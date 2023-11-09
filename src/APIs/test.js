const { default: axios } = require('axios');
const cheerio = require('cheerio');

async function fetchWebsiteHtml(url) {
  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching website content:', error);
    throw error;
  }
}

fetchWebsiteHtml(
  'https://res1999.huijiwiki.com/wiki/%E8%A7%92%E8%89%B2%E5%88%97%E8%A1%A8'
)
  .then((html) => {
    const $ = cheerio.load(html);

    // Find all image elements and extract the src attributes
    const imageSrcList = [];
    $('img').each((index, element) => {
      const src = $(element).attr('src');
      if (
        src.includes('Bg_kapaidi') ||
        src.includes('Huijilogo-standard.svg') ||
        src.includes('Career_') ||
        src.includes('-Fw_') ||
        src.includes('Dmgtype')
      ) {
        return;
      } else {
        imageSrcList.push(src);
      }
    });

    let foundCharList = false;

    // Find all image elements and extract the src attributes
    const characterUrls = [];
    $('a').each((index, element) => {
      const href = $(element).attr('href');
      if (foundCharList) {
        if (href.startsWith('/wiki/')) {
          characterUrls.push('https://res1999.huijiwiki.com' + href);
        }
      }
      if (href.includes('#simplecollapse-charList')) {
        foundCharList = true;
      }
    });
    const uniquecharacterUrls = Array.from(new Set(characterUrls));
    let counter = 0;
    const groupedUrls = [];
    for (let i = 0; i < imageSrcList.length; i += 3) {
      const url = uniquecharacterUrls[counter];
      const character = imageSrcList[i];
      const rarity = imageSrcList[i + 1];
      const element = imageSrcList[i + 2];
      counter++;

      if (character && rarity && element) {
        groupedUrls.push({ character, rarity, element, url });
      }
    }
    console.log(groupedUrls);
  })
  .catch((error) => {
    console.error('Error:', error);
  });
