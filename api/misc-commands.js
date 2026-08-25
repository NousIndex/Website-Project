const { fetchWikiPage, fetchHtml } = require('./_shared/wiki');
const { getDb } = require('./_shared/mongo');
const { getAuthenticatedUserId } = require('./_shared/auth');
const {
  withScrapeFallback,
  sendScrapeResult,
} = require('./_shared/scrapeCache');

// Scraped wiki data changes at most a few times a day; caching at the CDN keeps
// page loads fast and stops every visitor hitting the source sites.
const SCRAPE_CACHE = 's-maxage=3600, stale-while-revalidate=86400';

const STARRAIL_WIKI = 'https://honkai-star-rail.fandom.com/api.php';
const GENSHIN_WIKI = 'https://genshin-impact.fandom.com/api.php';
const ZZZ_WIKI = 'https://zenless-zone-zero.fandom.com/api.php';
const WUWA_WIKI = 'https://wutheringwaves.fandom.com/api.php';

const stripPng = (src) => (src ? src.split('.png')[0] + '.png' : '');

/**
 * Banners running right now, per game.
 *
 * Each wiki publishes its gacha page the same way: the first table lists the
 * current banners and its header carries the version window, e.g.
 * "Version 4.4: August 05, 2026 - August 25, 2026". That window drives the
 * home page countdown, so it is parsed from the same table.
 *
 * ZZZ and Reverse: 1999 have no equivalent page, so they are absent here and
 * their home pages show no carousel rather than another game's banners.
 */
const BANNER_SOURCES = {
  genshin: { apiUrl: GENSHIN_WIKI, page: 'Wish' },
  starrail: { apiUrl: STARRAIL_WIKI, page: 'Warp' },
  wuwa: { apiUrl: WUWA_WIKI, page: 'Convene' },
};

const VERSION_WINDOW = /:\s*([A-Z][a-z]+ \d{1,2},? \d{4})\s*[\u2014\u2013-]\s*([A-Z][a-z]+ \d{1,2},? \d{4})/;

// Rarity pips, element icons and similar chrome share the tables with the
// banner art; the art is what the carousel wants.
const NOT_BANNER_ART = /Icon_|_Icon|Logo|Stellar|Departure|Item_Unknown/;

async function scrapeCurrentBanners(config) {
  const $ = await fetchWikiPage(config.apiUrl, config.page);
  const table = $('table').eq(0);

  const imageURLSet = new Set();
  table.find('img').each((_index, element) => {
    const src = $(element).attr('data-src') || $(element).attr('src');
    if (!src || !/\.(png|jpg|jpeg)/i.test(src)) return;
    if (NOT_BANNER_ART.test(src)) return;
    imageURLSet.add(src.split('/revision')[0]);
  });

  let dateText;
  table.find('th').each((_index, element) => {
    const match = $(element).text().replace(/\s+/g, ' ').trim().match(VERSION_WINDOW);
    if (match) {
      dateText = `${match[1]} - ${match[2]}`.replaceAll(',', '');
      return false;
    }
    return undefined;
  });

  return { urls: Array.from(imageURLSet), date: dateText };
}

/**
 * Redemption code tables, one config per game.
 *
 * Every wiki lays the table out differently: HoYo wikis wrap the code in a
 * <code> element and list rewards as `span.item-text`, while the Wuthering
 * Waves table puts the codes in a second table, has no <code> element, and
 * shows rewards as linked icons with the amount in the cell text.
 */
const CODE_SOURCES = {
  genshin: {
    apiUrl: GENSHIN_WIKI,
    page: 'Promotional_Code',
    tableIndex: 0,
    columns: { code: 0, region: 1, reward: 2, valid: 3 },
    codeSelector: 'code',
  },
  starrail: {
    apiUrl: STARRAIL_WIKI,
    page: 'Redemption_Code',
    tableIndex: 0,
    columns: { code: 0, region: 1, reward: 2, valid: 3 },
    codeSelector: 'code',
  },
  zzz: {
    apiUrl: ZZZ_WIKI,
    page: 'Redemption_Code',
    tableIndex: 0,
    columns: { code: 0, region: 1, reward: 2, valid: 3 },
    codeSelector: 'code',
  },
  wuwa: {
    apiUrl: WUWA_WIKI,
    page: 'Redemption_Code',
    // table 0 on that page is a personal "used?" checklist
    tableIndex: 1,
    columns: { code: 0, region: 1, reward: 2, valid: 3 },
    codeSelector: null,
  },
};

/**
 * Decides whether a code is still usable from its duration cell.
 *
 * Some wikis write "Expired" outright; others only give "Valid until: <date>",
 * so the date is parsed and compared. Anything unparseable is kept -- showing a
 * code that turns out to be dead is friendlier than hiding a live one.
 */
function isCodeExpired(validText) {
  const text = validText.replace(/\s+/g, ' ').trim();
  if (/expired/i.test(text)) return true;

  const match = text.match(
    /Valid until:\s*([A-Z][a-z]+ \d{1,2},? \d{4})(?:\s+(\d{1,2}:\d{2}))?/
  );
  if (!match) return false;

  const parsed = Date.parse(`${match[1]} ${match[2] || '23:59'} UTC`);
  if (Number.isNaN(parsed)) return false;
  return parsed < Date.now();
}

function readRewards($, cell) {
  const named = cell
    .find('span.item-text')
    .map((_i, el) => $(el).text().trim())
    .get()
    .filter(Boolean);
  if (named.length > 0) return named.join('\n');

  // Icon-based tables (Wuthering Waves): pair each linked item with the
  // amount that sits next to it in the cell text.
  const items = cell
    .find('a')
    .map((_i, el) => $(el).attr('title'))
    .get()
    .filter(Boolean);
  const amounts = cell
    .text()
    .trim()
    .split(/\s+/)
    .filter((token) => /^[\d,]+$/.test(token));

  if (items.length === 0) return cell.text().replace(/\s+/g, ' ').trim();

  return items
    .map((item, i) => (amounts[i] ? `${item} ×${amounts[i]}` : item))
    .join('\n');
}

async function scrapeCodes(config) {
  const $ = await fetchWikiPage(config.apiUrl, config.page);
  const tableRows = $('table').eq(config.tableIndex).find('tr');
  const { code: codeCol, region: regionCol, reward: rewardCol, valid: validCol } =
    config.columns;
  const tableData = [];

  tableRows.each((_index, element) => {
    const columns = $(element).find('td');
    if (columns.length === 0) return;

    const codeCell = columns.eq(codeCol);
    const codeText = config.codeSelector
      ? codeCell.find(config.codeSelector).eq(0).text().trim()
      : codeCell.text().trim().split(/\s+/)[0];
    if (!codeText) return;

    if (isCodeExpired(columns.eq(validCol).text())) return;

    tableData.push({
      code: codeText,
      region: columns.eq(regionCol).text().trim(),
      reward: readRewards($, columns.eq(rewardCol)),
    });
  });

  return tableData;
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

/**
 * Character birthdays from the Genshin wiki.
 *
 * Only Genshin publishes these in one table; the other wikis have no
 * equivalent page, which is why the birthday panel is Genshin-only rather
 * than showing placeholder characters on every game as it used to.
 */
async function scrapeGenshinBirthdays() {
  const $ = await fetchWikiPage(GENSHIN_WIKI, 'Birthday');
  const birthdays = [];

  $('table').eq(0).find('tr').each((_index, element) => {
    const columns = $(element).find('td');
    if (columns.length < 3) return;

    const name = columns.eq(1).text().trim();
    const birthday = columns.eq(2).text().trim();
    if (!name || !birthday) return;

    // "January 3rd" -> month index + day; the Traveler's "Player's Choice"
    // has no date and is skipped.
    const match = birthday.match(/^([A-Z][a-z]+)\s+(\d{1,2})/);
    if (!match) return;
    const month = MONTHS.indexOf(match[1]);
    if (month < 0) return;

    const image = columns.eq(0).find('img');
    const icon = (image.attr('data-src') || image.attr('src') || '').split(
      '/revision'
    )[0];

    birthdays.push({
      name,
      birthday,
      month: month + 1,
      day: Number(match[2]),
      icon,
    });
  });

  return birthdays;
}

async function handleResonanceSummary(req, res) {
  try {
    const database = await getDb();
    const characterFind = String(req.query.characterFind || '');
    if (!characterFind) {
      return res.status(400).json({ error: 'Invalid request' });
    }

    const collection = database.collection('Reverse1999_Resonance');
    const summary = await collection.findOne({
      Character_Resonance: characterFind,
    });
    if (!summary) {
      return res.status(404).json({ error: 'Not found' });
    }
    return res.json(summary.Resonance);
  } catch (error) {
    console.error('Error fetching data:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function handleResonanceUpdate(req, res) {
  const auth = await getAuthenticatedUserId(req);
  if (auth.error) {
    return res.status(auth.status).json({ error: auth.error });
  }

  try {
    const database = await getDb();
    const { character_name, updateData, summaryList } = req.body || {};
    if (typeof character_name !== 'string' || !character_name) {
      return res.status(400).json({ error: 'Invalid request' });
    }
    const summaryList2 = Array.isArray(summaryList) ? [...summaryList] : [];
    summaryList2.push(character_name);

    const collection = database.collection('Reverse1999_Resonance');
    await collection.updateOne(
      { Character_Resonance: 'SummaryList' },
      { $set: { Resonance: summaryList2 } }
    );

    await collection.findOneAndUpdate(
      { Character_Resonance: character_name },
      {
        $setOnInsert: { Character_Resonance: character_name },
        $set: { Resonance: updateData },
      },
      { upsert: true, returnDocument: 'after' }
    );

    return res.json({ message: 'success' });
  } catch (error) {
    console.error('Error updating resonance:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

const REVERSE1999_ALT_MAP = [
  { match: '6', value: 'six' },
  { match: '37', value: 'thirty-seven' },
  { match: 'matilda', value: 'matilda bouanich' },
  { match: 'jessica', value: 'changeling' },
  { match: 'kaalaa baunaa', value: 'black dwarf' },
];

function normalizeReverse1999Alt(alt) {
  for (const { match, value } of REVERSE1999_ALT_MAP) {
    if (alt.includes(match)) return value;
  }
  return alt;
}

async function scrapeReverse1999CharacterList() {
  const $ = await fetchHtml('https://www.prydwen.gg/re1999/characters');
  const imageURLSet = new Set();
  const altTextSet = new Set();

  $('.avatar-card').each((_index, element) => {
    const imgElement = $(element).find(
      'div[data-gatsby-image-wrapper] picture img'
    );
    const src = 'https://www.prydwen.gg' + imgElement.attr('data-src');
    const alt = normalizeReverse1999Alt(
      imgElement.attr('alt').trim().toLowerCase()
    );

    imageURLSet.add(src);
    altTextSet.add(alt);
  });

  const imageURLArray = Array.from(imageURLSet);
  const altTextArray = Array.from(altTextSet);
  const imageAltDictionary = {};
  for (
    let i = 0;
    i < Math.min(imageURLArray.length, altTextArray.length);
    i++
  ) {
    imageAltDictionary[altTextArray[i]] = imageURLArray[i];
  }

  return imageAltDictionary;
}

// A banner scrape with no images failed; an empty code table is a legitimate
// result (every listed code expired), so only a thrown error falls back there.
const SCRAPES = {
  genshinbanner: {
    key: 'banner:genshin',
    run: () => scrapeCurrentBanners(BANNER_SOURCES.genshin),
    isEmpty: (data) => !data?.urls?.length,
  },
  starrailbanner: {
    key: 'banner:starrail',
    run: () => scrapeCurrentBanners(BANNER_SOURCES.starrail),
    isEmpty: (data) => !data?.urls?.length,
  },
  genshincode: {
    key: 'codes:genshin',
    run: () => scrapeCodes(CODE_SOURCES.genshin),
    isEmpty: () => false,
  },
  starrailcode: {
    key: 'codes:starrail',
    run: () => scrapeCodes(CODE_SOURCES.starrail),
    isEmpty: () => false,
  },
  zzzcode: {
    key: 'codes:zzz',
    run: () => scrapeCodes(CODE_SOURCES.zzz),
    isEmpty: () => false,
  },
  wuwacode: {
    key: 'codes:wuwa',
    run: () => scrapeCodes(CODE_SOURCES.wuwa),
    isEmpty: () => false,
  },
  wuwabanner: {
    key: 'banner:wuwa',
    run: () => scrapeCurrentBanners(BANNER_SOURCES.wuwa),
    isEmpty: (data) => !data?.urls?.length,
  },
  genshinbirthday: {
    key: 'birthdays:genshin',
    run: scrapeGenshinBirthdays,
  },
  reverse1999characterList: {
    key: 'characters:reverse1999',
    run: scrapeReverse1999CharacterList,
  },
};

module.exports = async (req, res) => {
  const scrapeCommand = req.query.scrapeCommand;

  if (scrapeCommand === 'reverse1999resonancesummary') {
    return handleResonanceSummary(req, res);
  }
  if (scrapeCommand === 'reverse1999resonanceupdate') {
    return handleResonanceUpdate(req, res);
  }

  const scrape = SCRAPES[scrapeCommand];
  if (!scrape) {
    return res.status(400).json({ error: 'Invalid request' });
  }

  try {
    const result = await withScrapeFallback(scrape.key, scrape.run, {
      isEmpty: scrape.isEmpty,
    });
    return sendScrapeResult(res, result, SCRAPE_CACHE);
  } catch (error) {
    console.error(`Error handling ${scrapeCommand}:`, error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
