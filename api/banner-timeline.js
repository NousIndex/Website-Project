const { fetchWikiPage } = require('./_shared/wiki');
const {
  withScrapeFallback,
  sendScrapeResult,
} = require('./_shared/scrapeCache');

const SCRAPE_CACHE = 's-maxage=21600, stale-while-revalidate=86400';

const GENSHIN_WIKI = 'https://genshin-impact.fandom.com/api.php';
const STARRAIL_WIKI = 'https://honkai-star-rail.fandom.com/api.php';
const WUWA_WIKI = 'https://wutheringwaves.fandom.com/api.php';

/**
 * Banner history, for the timeline pages.
 *
 * Two shapes exist upstream:
 *
 *   list      a plain table of [Image, Name, Start, End, Version], which Star
 *             Rail and Wuthering Waves publish per banner type
 *   sectioned Genshin's Wish/List, where a version header row ("Version Luna
 *             VIII: July 21, 2026 - August 11, 2026") is followed by one row
 *             per banner type; it is the only Genshin page that carries
 *             character banner history
 *
 * ZZZ has no page listing past signal searches with dates, so it is absent and
 * its timeline says so rather than showing another game's banners.
 */
const TIMELINE_SOURCES = {
  genshin: {
    apiUrl: GENSHIN_WIKI,
    sectioned: [{ page: 'Wish/List' }],
  },
  starrail: {
    apiUrl: STARRAIL_WIKI,
    lists: [
      { page: 'Character Event Warp', type: 'Character Warp' },
      { page: 'Light Cone Event Warp', type: 'Light Cone Warp' },
    ],
  },
  wuwa: {
    apiUrl: WUWA_WIKI,
    lists: [
      { page: 'Featured Resonator Convene', type: 'Featured Resonator Convene' },
      { page: 'Featured Weapon Convene', type: 'Featured Weapon Convene' },
    ],
  },
};

const VERSION_HEADER = /^Version\s+(.+?):\s*(.+?)\s*[–—-]\s*(.+)$/;

const cleanUrl = (src) => (src || '').split('/revision')[0];

function toIsoDate(text) {
  if (!text) return null;
  const parsed = Date.parse(`${text.replace(/,/g, '')} UTC`);
  return Number.isNaN(parsed) ? null : new Date(parsed).toISOString();
}

/** Locates a table by its headers, so a new table on the page cannot shift it. */
function findTableByHeaders($, required) {
  let found = null;
  $('table').each((_index, table) => {
    if (found) return;
    const headers = $(table)
      .find('th')
      .map((_i, cell) => $(cell).text().trim())
      .get();
    if (required.every((name) => headers.includes(name))) {
      found = $(table);
    }
  });
  return found;
}

function columnIndexes($, table) {
  const headers = $(table)
    .find('th')
    .map((_i, cell) => $(cell).text().trim())
    .get();
  return {
    image: headers.indexOf('Image'),
    name: headers.indexOf('Name'),
    start: headers.indexOf('Start'),
    end: headers.indexOf('End'),
    version: headers.indexOf('Version'),
  };
}

async function scrapeListPage(apiUrl, config) {
  const $ = await fetchWikiPage(apiUrl, config.page);
  const table = findTableByHeaders($, ['Name', 'Start', 'End']);
  if (!table) return [];

  const columns = columnIndexes($, table);
  const banners = [];

  table.find('tr').each((_index, row) => {
    const cells = $(row).find('td');
    if (cells.length === 0) return;

    // Names are written "Banner Name 2026-09-12"; the run date is already in
    // its own column, so it is dropped from the title.
    const name = cells
      .eq(columns.name)
      .text()
      .replace(/\s+/g, ' ')
      .replace(/\s*\d{4}-\d{2}-\d{2}\s*$/, '')
      .trim();
    const start = toIsoDate(cells.eq(columns.start).text().trim());
    if (!name || !start) return;

    // Some tables keep the art in the name cell rather than the image column.
    const image = cells.eq(columns.image).find('img').length
      ? cells.eq(columns.image).find('img')
      : cells.eq(columns.name).find('img');

    banners.push({
      name,
      type: config.type,
      image: cleanUrl(image.attr('data-src') || image.attr('src')),
      start,
      end: toIsoDate(cells.eq(columns.end).text().trim()),
      version:
        columns.version >= 0
          ? cells.eq(columns.version).text().trim()
          : null,
    });
  });

  return banners;
}

/**
 * Walks Genshin's Wish/List: rows alternate between a version header and the
 * banners that ran during it, so the header sets the window for the rows that
 * follow. Each banner is two anchors sharing a "Name/YYYY-MM-DD" title -- one
 * carrying the art, one carrying the text.
 */
async function scrapeSectionedPage(apiUrl, config) {
  const $ = await fetchWikiPage(apiUrl, config.page);

  // Several tables on the page carry a version header -- the one listing the
  // current banners has exactly one. The history table is whichever has the
  // most, so picking the first match would only ever return the current patch.
  let table = null;
  let bestCount = 0;
  $('table').each((_index, candidate) => {
    const count = $(candidate)
      .find('th')
      .toArray()
      .filter((cell) =>
        VERSION_HEADER.test($(cell).text().replace(/\s+/g, ' ').trim())
      ).length;
    if (count > bestCount) {
      bestCount = count;
      table = $(candidate);
    }
  });
  if (!table) return [];

  const banners = [];
  let current = null;

  table.find('tr').each((_index, row) => {
    const headers = $(row).find('th');
    if (headers.length === 1) {
      const match = $(headers[0])
        .text()
        .replace(/\s+/g, ' ')
        .trim()
        .match(VERSION_HEADER);
      if (match) {
        current = {
          version: match[1],
          start: toIsoDate(match[2]),
          end: toIsoDate(match[3]),
        };
      }
      return;
    }

    const cells = $(row).find('td');
    if (cells.length < 2 || !current) return;

    const type = cells.eq(0).text().replace(/([a-z])([A-Z])/g, '$1 $2').trim();
    const byTitle = new Map();

    cells
      .eq(1)
      .find('a[title]')
      .each((_i, anchor) => {
        const title = $(anchor).attr('title');
        const image = $(anchor).find('img');
        const entry = byTitle.get(title) || { name: title.split('/')[0] };
        const src = cleanUrl(image.attr('data-src') || image.attr('src'));
        if (src) entry.image = src;
        byTitle.set(title, entry);
      });

    for (const entry of byTitle.values()) {
      banners.push({
        name: entry.name,
        type,
        image: entry.image || '',
        start: current.start,
        end: current.end,
        version: current.version,
      });
    }
  });

  return banners;
}

async function scrapeTimeline(game) {
  const source = TIMELINE_SOURCES[game];
  const [lists, sectioned] = await Promise.all([
    Promise.all((source.lists || []).map((c) => scrapeListPage(source.apiUrl, c))),
    Promise.all(
      (source.sectioned || []).map((c) => scrapeSectionedPage(source.apiUrl, c))
    ),
  ]);

  return [...lists.flat(), ...sectioned.flat()].sort(
    (a, b) => new Date(b.start) - new Date(a.start)
  );
}

module.exports = async (req, res) => {
  const game = req.query.game;
  const source = TIMELINE_SOURCES[game];

  if (!source) {
    return res.status(400).json({ error: 'Invalid request' });
  }

  try {
    const result = await withScrapeFallback(`timeline:${game}`, () =>
      scrapeTimeline(game)
    );
    return sendScrapeResult(res, result, SCRAPE_CACHE);
  } catch (error) {
    console.error('Error building banner timeline:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports.TIMELINE_SOURCES = TIMELINE_SOURCES;
