const { fetchWikiPage } = require('./_shared/wiki');
const {
  withScrapeFallback,
  sendScrapeResult,
} = require('./_shared/scrapeCache');
const { fetchWikiDatabase } = require('./_shared/wikiList');

// Scraped reference data; cached at the CDN so visitors do not re-scrape it.
const SCRAPE_CACHE = 's-maxage=3600, stale-while-revalidate=86400';

const GENSHIN_WIKI = 'https://genshin-impact.fandom.com/api.php';
const STARRAIL_WIKI = 'https://honkai-star-rail.fandom.com/api.php';

// Wiki rows occasionally lack an image (a placeholder entry, or a layout
// change upstream). This used to throw on `undefined.split`, which failed the
// whole scrape and left the inventory panel empty for the game.
const stripPng = (src) => (src ? src.split('.png')[0] + '.png' : '');

// Same story as the icons: these two games come from their fandom wikis
// because prydwen.gg blocks server-side requests. See _shared/wikiList.js.
const WIKI_DATABASE_GAMES = new Set(['zzz', 'wuwa']);

async function scrapeGenshinDatabase() {
  const [$weapons, $characters] = await Promise.all([
    fetchWikiPage(GENSHIN_WIKI, 'Weapon/List'),
    fetchWikiPage(GENSHIN_WIKI, 'Character/List'),
  ]);

  const extractedDataWeapon = [];
  const extractedDataCharacter = [];
  const seenWeapons = new Set();
  const seenCharacters = new Set();

  $weapons('tr').each((_index, element) => {
    const rowData = $weapons(element).find('td');

    const name = rowData.eq(1).find('a').text();
    const rarityImg = rowData.eq(2).find('img').attr('data-src');
    const atk = rowData.eq(3).text();
    let sub = rowData.eq(4).text();
    const passive = rowData.eq(5).text();

    if (!name || name === 'Prized Isshin Blade') return;
    if (seenWeapons.has(name)) return;
    seenWeapons.add(name);

    if (sub.toLowerCase().includes('elemental mastery')) {
      sub = sub.replace('Elemental Mastery', 'EM');
    }
    if (sub.toLowerCase().includes('physical dmg bonus')) {
      sub = sub.replace('Physical DMG Bonus', 'Phys DMG');
    }
    if (sub.toLowerCase().includes('energy recharge')) {
      sub = sub.replace('Energy Recharge', 'ER');
    }

    extractedDataWeapon.push({
      name,
      rarity: stripPng(rarityImg),
      atk,
      sub,
      passive,
    });
  });

  $characters('tr').each((_index, element) => {
    const rowData = $characters(element).find('td');

    const name = rowData.eq(1).find('a').text().trim();
    const rarityImg = rowData.eq(2).find('img').attr('data-src');
    const elementImg = rowData.eq(3).find('a img').attr('data-src');
    const weaponImg = rowData.eq(4).find('a img').attr('data-src');
    const release = rowData.eq(7).text().trim();

    if (!release || !name || name === 'Traveler') return;
    if (seenCharacters.has(name)) return;
    seenCharacters.add(name);

    extractedDataCharacter.push({
      name,
      rarity: stripPng(rarityImg),
      element: stripPng(elementImg),
      weapon: stripPng(weaponImg),
      release,
    });
  });

  const characterArray = [...extractedDataCharacter].sort(
    (a, b) => new Date(b.release) - new Date(a.release)
  );

  return { characters: characterArray, weapons: extractedDataWeapon };
}

async function scrapeStarrailDatabase() {
  const [$lc, $characters] = await Promise.all([
    fetchWikiPage(STARRAIL_WIKI, 'Light_Cone/List'),
    fetchWikiPage(STARRAIL_WIKI, 'Character/List'),
  ]);

  const extractedDataWeapon = [];
  const extractedDataCharacter = [];

  $lc('tr').each((_index, element) => {
    const rowData = $lc(element).find('td');

    const name = rowData.eq(0).find('a').text().trim();
    const rarityImg = rowData.eq(1).find('img').attr('data-src');
    const typeImg = rowData.eq(2).find('img').attr('data-src');
    const stats = rowData.eq(3).text().trim();
    const passive = rowData.eq(4).text().trim();

    if (!name) return;
    if (extractedDataWeapon.find((d) => d.name === name)) return;

    let hpStat = '';
    let atkStat = '';
    let dfStat = '';

    if (stats.toLowerCase() === 'unknown') {
      hpStat = stats;
    } else {
      hpStat = stats.split('ATK:')[0];
      atkStat = 'ATK:' + stats.split('ATK:')[1].split('DEF:')[0];
      dfStat = 'DEF:' + stats.split('DEF:')[1];
    }

    extractedDataWeapon.push({
      name,
      rarity: stripPng(rarityImg),
      type: stripPng(typeImg),
      hp: hpStat,
      atk: atkStat,
      df: dfStat,
      passive,
    });
  });

  // The wiki's character table is [Character (icon + name), Rarity, Path,
  // Combat Type, Version]. It used to carry a separate icon column, and this
  // scraper still read the old offsets -- so every row came back nameless and
  // the whole database scrape was discarded as empty.
  $characters('tr').each((_index, element) => {
    const rowData = $characters(element).find('td');

    const name = rowData.eq(0).find('a').text().trim();
    const rarityImg = rowData.eq(1).find('img').attr('data-src');
    const elementImg = rowData.eq(3).find('img').attr('data-src');
    const weaponImg = rowData.eq(2).find('img').attr('data-src');

    if (!name || name === 'Trailblazer') return;
    if (extractedDataCharacter.find((d) => d.name === name)) return;

    extractedDataCharacter.push({
      name,
      rarity: stripPng(rarityImg),
      element: stripPng(elementImg),
      weapon: stripPng(weaponImg),
    });
  });

  const characterArray = Object.entries(extractedDataCharacter).map(
    ([, data]) => ({
      name: data.name,
      rarity: data.rarity,
      element: data.element,
      weapon: data.weapon,
    })
  );

  return { characters: characterArray, weapons: extractedDataWeapon };
}

// A scrape that yields no characters is a failed scrape, not an empty database.
const hasCharacters = (data) =>
  Boolean(data && data.characters && Object.keys(data.characters).length > 0);

module.exports = async (req, res) => {
  const game = req.query.game;

  if (!game) {
    return res.status(400).json({ error: 'Invalid request' });
  }

  let scrape = null;
  if (game === 'genshin') scrape = scrapeGenshinDatabase;
  else if (game === 'starrail') scrape = scrapeStarrailDatabase;
  else if (WIKI_DATABASE_GAMES.has(game)) {
    scrape = () => fetchWikiDatabase(game);
  }

  if (!scrape) {
    return res.status(400).json({ error: 'Invalid request' });
  }

  try {
    const result = await withScrapeFallback(`database:${game}`, scrape, {
      isEmpty: (data) => !hasCharacters(data),
    });
    return sendScrapeResult(res, result, SCRAPE_CACHE);
  } catch (error) {
    console.error('Error fetching database:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
