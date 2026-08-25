const { fetchWikiPage } = require('./wiki');

const ZZZ_WIKI = 'https://zenless-zone-zero.fandom.com/api.php';
const WUWA_WIKI = 'https://wutheringwaves.fandom.com/api.php';

/**
 * Character and weapon lists for ZZZ and Wuthering Waves, read from their
 * fandom wikis.
 *
 * These two games used to be served entirely from prydwen.gg, which answers a
 * plain server-side fetch with 403 -- so their item icons and their whole
 * character/weapon database came back empty, leaving the trackers without art
 * and with an empty inventory. The wikis answer normally and publish the same
 * facts, so they are the primary source for both games now.
 *
 * Field shapes match what the inventory components already expect: ZZZ scores
 * rarity as S/A/B letters, Wuthering Waves as star digits, and `type` is the
 * URL of the attribute icon.
 */
const cleanUrl = (src) => (src || '').split('/revision')[0];

function readIcon($, cell) {
  const image = $(cell).find('img').first();
  return cleanUrl(image.attr('data-src') || image.attr('src'));
}

function readRarity($, cell, pattern) {
  const icon = readIcon($, cell);
  const match = icon.match(pattern);
  if (match) return match[1];
  // some rows write the rank as text instead of an icon
  return $(cell).text().replace(/\s+/g, ' ').trim();
}

const LIST_SOURCES = {
  zzz: {
    apiUrl: ZZZ_WIKI,
    characters: [
      {
        page: 'Agent/List',
        nameColumn: 1,
        iconColumn: 0,
        rarityColumn: 2,
        typeColumn: 3,
        rarityPattern: /AgentRank_([A-Z])/,
      },
      {
        page: 'Bangboo/List',
        nameColumn: 1,
        iconColumn: 0,
        rarityColumn: 2,
        typeColumn: 3,
        rarityPattern: /Rank_([A-Z])/,
      },
    ],
    weapons: [
      {
        page: 'W-Engine/List',
        nameColumn: 1,
        iconColumn: 0,
        rarityColumn: 2,
        typeColumn: 3,
        attackColumn: 6,
        statColumn: 7,
        rarityPattern: /Item_Rank_([A-Z])/,
      },
    ],
  },

  wuwa: {
    apiUrl: WUWA_WIKI,
    characters: [
      {
        page: 'Resonator/List',
        nameColumn: 0,
        iconColumn: 0,
        rarityColumn: 1,
        typeColumn: 2,
        rarityPattern: /Icon_(\d)_Stars/,
      },
    ],
    weapons: [
      {
        page: 'Weapon/List',
        nameColumn: 1,
        iconColumn: 0,
        rarityColumn: 2,
        typeColumn: 3,
        attackColumn: 4,
        statColumn: 4,
        rarityPattern: /Icon_(\d)_Stars/,
      },
    ],
  },
};

async function scrapeListPage(apiUrl, config) {
  const $ = await fetchWikiPage(apiUrl, config.page);
  const entries = [];
  const seen = new Set();

  $('table')
    .eq(0)
    .find('tr')
    .each((_index, row) => {
      const cells = $(row).find('td');
      if (cells.length === 0) return;

      const name = $(cells[config.nameColumn]).text().replace(/\s+/g, ' ').trim();
      if (!name || name === '—' || seen.has(name)) return;

      const url = readIcon($, cells[config.iconColumn]);
      if (!url) return;
      seen.add(name);

      const entry = {
        name,
        url,
        rarity: readRarity($, cells[config.rarityColumn], config.rarityPattern),
        type: readIcon($, cells[config.typeColumn]),
      };

      if (config.attackColumn !== undefined) {
        entry.attack = $(cells[config.attackColumn])
          .text()
          .replace(/\s+/g, ' ')
          .trim();
      }
      if (config.statColumn !== undefined) {
        entry.otherStat = $(cells[config.statColumn])
          .text()
          .replace(/\s+/g, ' ')
          .trim();
      }

      entries.push(entry);
    });

  return entries;
}

async function scrapeAll(apiUrl, configs) {
  const pages = await Promise.all(
    configs.map((config) => scrapeListPage(apiUrl, config))
  );
  return pages.flat();
}

/** `{ characters, weapons }` in the shape the inventory panels expect. */
async function fetchWikiDatabase(game) {
  const source = LIST_SOURCES[game];
  if (!source) throw new Error(`No wiki list source for "${game}"`);

  const [characters, weapons] = await Promise.all([
    scrapeAll(source.apiUrl, source.characters),
    scrapeAll(source.apiUrl, source.weapons),
  ]);

  return { characters, weapons };
}

/** `{ lowercased name: icon url }`, which is how these games look icons up. */
async function fetchWikiIconDictionary(game) {
  const { characters, weapons } = await fetchWikiDatabase(game);
  const dictionary = {};
  for (const entry of [...characters, ...weapons]) {
    dictionary[entry.name.toLowerCase()] = entry.url;
  }
  return dictionary;
}

module.exports = {
  LIST_SOURCES,
  fetchWikiDatabase,
  fetchWikiIconDictionary,
  scrapeListPage,
};
