const { fetchWikiPage, fetchHtml } = require('./_shared/wiki');
const { getDb } = require('./_shared/mongo');

const STARRAIL_WIKI = 'https://honkai-star-rail.fandom.com/api.php';
const GENSHIN_WIKI = 'https://genshin-impact.fandom.com/api.php';
const REVERSE1999_WIKI = 'https://reverse1999.fandom.com/api.php';

const stripPng = (src) => src.split('.png')[0] + '.png';

async function handleStarrailBanner(res) {
  try {
    const $ = await fetchWikiPage(STARRAIL_WIKI, 'Honkai:_Star_Rail_Wiki');
    const firstTable = $('table').eq(0);
    const imageURLSet = new Set();

    firstTable.find('img').each((_index, element) => {
      const imageUrl = $(element).attr('data-src');
      const imageUrl2 = $(element).attr('src');
      const candidate = imageUrl && imageUrl.includes('png') ? imageUrl
        : imageUrl2 && imageUrl2.includes('png') ? imageUrl2
        : null;
      if (!candidate) return;
      if (candidate.includes('Stellar') || candidate.includes('Departure') ||
          candidate.includes('Item_Unknown.png')) return;
      imageURLSet.add(stripPng(candidate));
    });

    let dateText;
    firstTable.find('th').each((_index, element) => {
      const text = $(element).text();
      if (text.includes('—')) {
        dateText = text.trim().replace('—', '-');
        return false;
      }
    });

    res.json({ urls: Array.from(imageURLSet), date: dateText });
  } catch (error) {
    console.error('Error fetching data:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function handleReverse1999Banner(res) {
  try {
    const $ = await fetchWikiPage(REVERSE1999_WIKI, 'Reverse:_1999_Wiki');
    const firstTable = $('table').eq(4);
    const imageURLSet = new Set();

    firstTable.find('img').each((_index, element) => {
      const imageUrl = $(element).attr('data-src');
      if (!imageUrl) return;
      if (imageUrl.includes('Stellar') || imageUrl.includes('Departure')) return;
      imageURLSet.add(stripPng(imageUrl));
    });

    let dateText;
    firstTable.find('.lightbox-caption').each((_index, element) => {
      const text = $(element).text();
      if (text.includes('From') && text.includes('to')) {
        const nbsp = new RegExp(String.fromCharCode(160), 'g');
        dateText = text
          .split('(')[0]
          .trim()
          .replace(nbsp, ' ')
          .replace('From ', '')
          .replace('to ', ' - ')
          .replaceAll(',', '');
        return false;
      }
    });

    res.json({ urls: Array.from(imageURLSet), date: dateText });
  } catch (error) {
    console.error('Error fetching data:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function handleCodeScrape(apiUrl, page, res) {
  try {
    const $ = await fetchWikiPage(apiUrl, page);
    const tableRows = $('table').eq(0).find('tr');
    const tableData = [];

    tableRows.each((_index, element) => {
      const columns = $(element).find('td');
      const codeText = columns.eq(0).find('code').eq(0).text().trim();
      if (codeText.length === 0) return;

      let validText = '';
      columns.eq(3).contents().each(function () {
        validText += $(this).text().trim() + ' ';
      });
      if (validText.toLowerCase().includes('expired')) return;

      const regionText = columns.eq(1).text().trim();

      let rewardText = '';
      columns.eq(2).find('span.item-text').each(function () {
        rewardText += $(this).text().trim() + '\n';
      });

      tableData.push({ code: codeText, region: regionText, reward: rewardText });
    });

    res.json(tableData);
  } catch (error) {
    console.error('Error fetching data:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function handleResonanceSummary(req, res) {
  try {
    const database = await getDb();
    const characterFind = req.query.characterFind;
    const collection = database.collection('Reverse1999_Resonance');
    const summary = await collection.findOne({
      Character_Resonance: characterFind,
    });
    return res.json(summary.Resonance);
  } catch (error) {
    console.error('Error fetching data:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function handleResonanceUpdate(req, res) {
  try {
    const database = await getDb();
    const { character_name, updateData, summaryList } = req.body;
    const summaryList2 = summaryList ? [...summaryList] : [];
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

async function handleReverse1999CharacterList(res) {
  try {
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

    res.json(imageAltDictionary);
  } catch (error) {
    console.error('Error fetching data:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = async (req, res) => {
  const scrapeCommand = req.query.scrapeCommand;

  switch (scrapeCommand) {
    case 'starrailbanner':
      return handleStarrailBanner(res);
    case 'reverse1999banner':
      return handleReverse1999Banner(res);
    case 'genshincode':
      return handleCodeScrape(GENSHIN_WIKI, 'Promotional_Code', res);
    case 'starrailcode':
      console.log('Starting StarRail Code API');
      return handleCodeScrape(STARRAIL_WIKI, 'Redemption_Code', res);
    case 'reverse1999resonancesummary':
      return handleResonanceSummary(req, res);
    case 'reverse1999resonanceupdate':
      return handleResonanceUpdate(req, res);
    case 'reverse1999characterList':
      return handleReverse1999CharacterList(res);
    default:
      return res.status(400).json({ error: 'Invalid request' });
  }
};
