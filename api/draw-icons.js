const { fetchWikiPage } = require('./_shared/wiki');
const {
  withScrapeFallback,
  sendScrapeResult,
} = require('./_shared/scrapeCache');
const { fetchWikiIconDictionary } = require('./_shared/wikiList');

// Scraped reference data; cached at the CDN so visitors do not re-scrape it.
const SCRAPE_CACHE = 's-maxage=3600, stale-while-revalidate=86400';

const WIKI_CONFIGS = {
  genshin: {
    apiUrl: 'https://genshin-impact.fandom.com/api.php',
    weaponsPage: 'Weapon/List',
    weaponFilter: 'Weapon',
  },
  starrail: {
    apiUrl: 'https://honkai-star-rail.fandom.com/api.php',
    weaponsPage: 'Light_Cone/List',
    weaponFilter: 'Light_Cone',
  },
};

async function scrapeWikiIcons(config) {
  const [$weapons, $characters] = await Promise.all([
    fetchWikiPage(config.apiUrl, config.weaponsPage),
    fetchWikiPage(config.apiUrl, 'Character/List'),
  ]);

  const filteredDataSrcSet = new Set();

  // Item art is named "<Name>_Icon.png"; files named "Icon_<something>" are
  // the rarity pips and element badges that share these tables. They were
  // being collected as if they were items, which pads the list and lets a
  // name match land on a star icon.
  const isItemIcon = (url) =>
    /_Icon\.png$/.test(url) && !/\/Icon_[^/]*$/.test(url);

  $characters('img[data-src]').each((_index, element) => {
    const dataSrc = $characters(element).attr('data-src');
    const filtered = dataSrc.split('.png')[0] + '.png';
    if (!filteredDataSrcSet.has(filtered) && isItemIcon(filtered)) {
      filteredDataSrcSet.add(filtered);
    }
  });

  $weapons('img[data-src]').each((_index, element) => {
    const dataSrc = $weapons(element).attr('data-src');
    if (dataSrc && dataSrc.includes(config.weaponFilter)) {
      filteredDataSrcSet.add(dataSrc.split('.png')[0] + '.png');
    }
  });

  return Array.from(filteredDataSrcSet);
}

async function handleWikiIcons(game, config, res) {
  try {
    const result = await withScrapeFallback(`icons:${game}`, () =>
      scrapeWikiIcons(config)
    );
    return sendScrapeResult(res, result, SCRAPE_CACHE);
  } catch (error) {
    console.error('Error fetching icons:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// ZZZ and Wuthering Waves are read from their fandom wikis: prydwen.gg, the
// previous source, answers a server-side fetch with 403, which left both games
// with no item icons at all.
const WIKI_DICT_GAMES = new Set(['zzz', 'wuwa']);

async function handleWikiDictionaryIcons(game, res) {
  try {
    const result = await withScrapeFallback(`icons:${game}`, () =>
      fetchWikiIconDictionary(game)
    );
    return sendScrapeResult(res, result, SCRAPE_CACHE);
  } catch (error) {
    console.error('Error fetching icons:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = async (req, res) => {
  const game = req.query.game;
  if (!game) {
    return res.status(400).json({ error: 'Invalid request' });
  }

  if (WIKI_CONFIGS[game]) {
    return handleWikiIcons(game, WIKI_CONFIGS[game], res);
  }
  if (WIKI_DICT_GAMES.has(game)) {
    return handleWikiDictionaryIcons(game, res);
  }

  return res.status(400).json({ error: 'Invalid request' });
};
