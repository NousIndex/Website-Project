const { fetchWikiPage, fetchHtml } = require('./_shared/wiki');

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

const PRYDWEN_CONFIGS = {
  zzz: {
    sources: [
      {
        url: 'https://www.prydwen.gg/zenless/characters',
        listSelector: '.avatar-card',
        nameSelector: 'span[class="emp-name"]',
      },
      {
        url: 'https://www.prydwen.gg/zenless/w-engines',
        listSelector: '.zzz-engine',
        nameSelector: '.zzz-info h5',
      },
      {
        url: 'https://www.prydwen.gg/zenless/bangboo',
        listSelector: '.avatar-card',
        nameSelector: 'span[class="emp-name"]',
      },
    ],
    excludeRover: false,
  },
  wuwa: {
    sources: [
      {
        url: 'https://www.prydwen.gg/wuthering-waves/characters',
        listSelector: '.avatar-card',
        nameSelector: 'span[class="emp-name"]',
      },
      {
        url: 'https://www.prydwen.gg/wuthering-waves/weapons',
        listSelector: '.ww-weapon-box',
        nameSelector: '.ww-data h4',
      },
    ],
    excludeRover: true,
  },
};

async function handleWikiIcons(config, res) {
  try {
    const [$weapons, $characters] = await Promise.all([
      fetchWikiPage(config.apiUrl, config.weaponsPage),
      fetchWikiPage(config.apiUrl, 'Character/List'),
    ]);

    const filteredDataSrcSet = new Set();

    $characters('img[data-src]').each((_index, element) => {
      const dataSrc = $characters(element).attr('data-src');
      const filtered = dataSrc.split('.png')[0] + '.png';
      if (!filteredDataSrcSet.has(filtered) && filtered.includes('Icon')) {
        filteredDataSrcSet.add(filtered);
      }
    });

    $weapons('img[data-src]').each((_index, element) => {
      const dataSrc = $weapons(element).attr('data-src');
      if (dataSrc && dataSrc.includes(config.weaponFilter)) {
        filteredDataSrcSet.add(dataSrc.split('.png')[0] + '.png');
      }
    });

    res.json(Array.from(filteredDataSrcSet));
  } catch (error) {
    console.error('Error fetching data:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

function scrapePrydwenIcons($, source, excludeRover) {
  const urls = new Set();
  const names = new Set();
  $(source.listSelector).each((_index, element) => {
    const imgElement = $(element).find(
      'div[data-gatsby-image-wrapper] img[data-main-image]'
    );
    const src = 'https://www.prydwen.gg' + imgElement.attr('data-src');
    const name = $(element).find(source.nameSelector).text().trim();

    if (excludeRover && name.toLowerCase().includes('rover')) return;
    urls.add(src);
    names.add(name);
  });

  const urlArr = Array.from(urls);
  const nameArr = Array.from(names);
  const dict = {};
  for (let i = 0; i < Math.min(urlArr.length, nameArr.length); i++) {
    dict[nameArr[i].toLowerCase()] = urlArr[i];
  }
  return dict;
}

async function handlePrydwenIcons(config, res) {
  try {
    const docs = await Promise.all(config.sources.map((s) => fetchHtml(s.url)));

    const combinedDictionary = docs.reduce((acc, $, idx) => {
      return { ...acc, ...scrapePrydwenIcons($, config.sources[idx], config.excludeRover) };
    }, {});

    res.json(combinedDictionary);
  } catch (error) {
    console.error('Error fetching data:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = async (req, res) => {
  const game = req.query.game;
  if (!game) {
    return res.status(400).json({ error: 'Invalid request' });
  }

  if (WIKI_CONFIGS[game]) {
    return handleWikiIcons(WIKI_CONFIGS[game], res);
  }
  if (PRYDWEN_CONFIGS[game]) {
    return handlePrydwenIcons(PRYDWEN_CONFIGS[game], res);
  }
};
