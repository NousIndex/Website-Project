const { fetchWikiPage, fetchHtml } = require('./_shared/wiki');

const GENSHIN_WIKI = 'https://genshin-impact.fandom.com/api.php';
const STARRAIL_WIKI = 'https://honkai-star-rail.fandom.com/api.php';

const stripPng = (src) => src.split('.png')[0] + '.png';

const PRYDWEN_CONFIGS = {
  zzz: {
    characterUrl: 'https://www.prydwen.gg/zenless/characters',
    weaponUrl: 'https://www.prydwen.gg/zenless/w-engines',
    characterNameTrim: true,
    characterExcludeRover: false,
    weaponListSelector: '.zzz-engine',
    weaponNameSelector: '.zzz-info h5',
    weaponNameTrim: true,
    weaponRarSelector: '.zzz-info strong',
    weaponRarTrim: true,
    weaponStatsSelector: '.stats span',
    weaponStatsDelimiter: ':',
  },
  wuwa: {
    characterUrl: 'https://www.prydwen.gg/wuthering-waves/characters',
    weaponUrl: 'https://www.prydwen.gg/wuthering-waves/weapons',
    characterNameTrim: false,
    characterExcludeRover: true,
    weaponListSelector: '.ww-weapon-box',
    weaponNameSelector: '.ww-data h4',
    weaponNameTrim: false,
    weaponRarSelector: '.ww-info strong',
    weaponRarTrim: false,
    weaponStatsSelector: '.ww-stats p',
    weaponStatsDelimiter: ': ',
  },
};

async function handleGenshinDatabase(res) {
  try {
    const [$weapons, $characters] = await Promise.all([
      fetchWikiPage(GENSHIN_WIKI, 'Weapon/List'),
      fetchWikiPage(GENSHIN_WIKI, 'Character/List'),
    ]);

    const extractedDataWeapon = [];
    const extractedDataCharacter = [];

    $weapons('tr').each((_index, element) => {
      const rowData = $weapons(element).find('td');

      const name = rowData.eq(1).find('a').text();
      const rarityImg = rowData.eq(2).find('img').attr('data-src');
      const atk = rowData.eq(3).text();
      let sub = rowData.eq(4).text();
      const passive = rowData.eq(5).text();

      if (!name || name === 'Prized Isshin Blade') return;
      if (extractedDataWeapon.find((d) => d.name === name)) return;

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
      if (extractedDataCharacter.find((d) => d.name === name)) return;

      extractedDataCharacter.push({
        name,
        rarity: stripPng(rarityImg),
        element: stripPng(elementImg),
        weapon: stripPng(weaponImg),
        release,
      });
    });

    const characterArray = Object.entries(extractedDataCharacter).map(
      ([, data]) => ({
        name: data.name,
        rarity: data.rarity,
        element: data.element,
        weapon: data.weapon,
        release: data.release,
      })
    );
    characterArray.sort((a, b) => new Date(b.release) - new Date(a.release));

    res.json({ characters: characterArray, weapons: extractedDataWeapon });
  } catch (error) {
    console.error('Error fetching data:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function handleStarrailDatabase(res) {
  try {
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

    $characters('tr').each((_index, element) => {
      const rowData = $characters(element).find('td');

      const name = rowData.eq(1).find('a').text().trim();
      const rarityImg = rowData.eq(2).find('img').attr('data-src');
      const elementImg = rowData.eq(3).find('a img').attr('data-src');
      const weaponImg = rowData.eq(4).find('a img').attr('data-src');

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

    res.json({ characters: characterArray, weapons: extractedDataWeapon });
  } catch (error) {
    console.error('Error fetching data:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

function scrapePrydwenCharacters($, config) {
  const imageURLSet = new Set();
  const altTextSet = new Set();
  const typeURLArray = [];

  $('.avatar-card').each((_index, element) => {
    const imgElement = $(element).find(
      'div[data-gatsby-image-wrapper] img[data-main-image]'
    );
    const src = 'https://www.prydwen.gg' + imgElement.attr('data-src');

    const nameElement = $(element).find('span[class="emp-name"]');
    const characterName = config.characterNameTrim
      ? nameElement.text().trim()
      : nameElement.text();

    const typeElement = $(element).find(
      '.floating-element picture img[data-main-image]'
    );
    const elementType =
      typeElement.attr('data-src') === undefined
        ? 'undefined'
        : 'https://www.prydwen.gg' + typeElement.attr('data-src');

    if (config.characterExcludeRover && characterName.toLowerCase().includes('rover')) {
      return;
    }

    imageURLSet.add(src);
    altTextSet.add(characterName);
    typeURLArray.push(elementType);
  });

  const rarityClasses = $('span a .avatar')
    .filter((_index, element) => {
      const empName = $(element).find('.emp-name').text().toLowerCase();
      return !empName.includes('rover');
    })
    .map((_index, p) => {
      const classList = $(p).attr('class').split(/\s+/);
      return classList.find((c) => c.startsWith('rarity'));
    })
    .get()
    .filter(Boolean);

  return {
    imageURLArray: Array.from(imageURLSet),
    altTextArray: Array.from(altTextSet),
    typeURLArray,
    rarityClasses,
  };
}

function scrapePrydwenWeapons($, config) {
  const imageURLSet = new Set();
  const altTextSet = new Set();
  const rarityArray = [];
  const attackStats = [];
  const otherStatsName = [];
  const otherStats = [];

  $(config.weaponListSelector).each((_index, element) => {
    const imgElement = $(element).find(
      'div[data-gatsby-image-wrapper] img[data-main-image]'
    );
    const src = 'https://www.prydwen.gg' + imgElement.attr('data-src');

    const weaponName = config.weaponNameTrim
      ? $(element).find(config.weaponNameSelector).text().trim()
      : $(element).find(config.weaponNameSelector).text();

    const rarRaw = $(element).find(config.weaponRarSelector).text()[0];
    const weaponRar = config.weaponRarTrim ? rarRaw.trim() : rarRaw;

    const statsText = $(element).find(config.weaponStatsSelector).text();
    const weaponStats = statsText.split(config.weaponStatsDelimiter, 3);
    const attackStat = weaponStats[1].match(/\d{3}/)[0];

    let otherStatName;
    try {
      otherStatName = weaponStats[1].match(/\d+(\w+\s\w+)/)[1];
    } catch {
      otherStatName = weaponStats[1].match(/\d+(\w+)/)[1];
    }
    const otherStat = weaponStats[2];

    imageURLSet.add(src);
    altTextSet.add(weaponName);
    rarityArray.push(weaponRar);
    attackStats.push(attackStat);
    otherStatsName.push(otherStatName);
    otherStats.push(otherStat);
  });

  return {
    imageURLArray: Array.from(imageURLSet),
    altTextArray: Array.from(altTextSet),
    rarityArray,
    attackStats,
    otherStatsName,
    otherStats,
  };
}

async function handlePrydwenDatabase(config, res) {
  try {
    const [$chars, $weapons] = await Promise.all([
      fetchHtml(config.characterUrl),
      fetchHtml(config.weaponUrl),
    ]);

    const chars = scrapePrydwenCharacters($chars, config);
    const weapons = scrapePrydwenWeapons($weapons, config);

    const characterDict = [];
    for (
      let i = 0;
      i < Math.min(chars.imageURLArray.length, chars.altTextArray.length);
      i++
    ) {
      characterDict[i] = {
        name: chars.altTextArray[i],
        url: chars.imageURLArray[i],
        type: chars.typeURLArray[i],
        rarity: chars.rarityClasses[i].split('-')[1],
      };
    }

    const weaponDict = [];
    for (
      let i = 0;
      i < Math.min(weapons.imageURLArray.length, weapons.altTextArray.length);
      i++
    ) {
      let statName = weapons.otherStatsName[i];
      if (statName.toLowerCase().includes('energy reg')) {
        statName = statName.replace('Energy Reg', 'ER');
      }
      weaponDict[i] = {
        name: weapons.altTextArray[i],
        url: weapons.imageURLArray[i],
        rarity: weapons.rarityArray[i],
        attack: weapons.attackStats[i],
        otherStat: statName + ' ' + weapons.otherStats[i],
      };
    }

    res.json({ characters: characterDict, weapons: weaponDict });
  } catch (error) {
    console.error('Error fetching data:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = async (req, res) => {
  const game = req.query.game;
  console.log(game);

  if (!game) {
    return res.status(400).json({ error: 'Invalid request' });
  }

  if (game === 'genshin') return handleGenshinDatabase(res);
  if (game === 'starrail') return handleStarrailDatabase(res);
  if (PRYDWEN_CONFIGS[game]) {
    return handlePrydwenDatabase(PRYDWEN_CONFIGS[game], res);
  }

  return res.status(400).json({ error: 'Invalid request' });
};
