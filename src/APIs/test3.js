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
    uniquecharacterUrls.forEach((url) => {
      fetchWebsiteHtml(url)
        .then((html) => {
          const getLevel = 10;
          const $ = cheerio.load(html);

          const resonateElements = $('.resonate-single');

          const extractedData = [];
          const puzzleUrls = [];

          resonateElements.each((index, element) => {
            const data = {};

            level = $(element).closest('.resonate-tabber-item').data('level');
            if (level === getLevel) {
              data.level = level;
              levelInfo = $(element).find('div:first-child').text().trim();
              src = $(element).find('img').attr('src');

              if (levelInfo) {
                const shapeImage = $(element).find('img').attr('src');
                if (!shapeImage.includes('Fw_014') && !shapeImage.includes('Fw_013') && !shapeImage.includes('Fw_010') && !shapeImage.includes('Fw_000') && !shapeImage.includes('Fw_001') && !shapeImage.includes('Fw_002') && !shapeImage.includes('Fw_003') && !shapeImage.includes('Fw_004') && !shapeImage.includes('Fw_005') && !shapeImage.includes('Fw_006') && !shapeImage.includes('Fw_007') && !shapeImage.includes('Fw_008') && !shapeImage.includes('Fw_009') && !shapeImage.includes('Fw_011') && !shapeImage.includes('Fw_012')) {
                  puzzleUrls.push(shapeImage);
                }
                data.amount = levelInfo.split('Lv')[0];
                const spans = $(element).find('span');
                data['HP'] = 0;
                data['ATK'] = 0;
                data['Reality DEF'] = 0;
                data['Mental DEF'] = 0;
                data['Crit Rate'] = 0;
                data['Crit DMG'] = 0;
                data['DMG Bonus'] = 0;
                data['DMG Reduction'] = 0;
                data['Crit Resist'] = 0;
                data['Crit DEF'] = 0;
                spans.each((index, span) => {
                  const text = $(span).text().trim();
                  let keyName = text;
                  if (text === '生命') {
                    keyName = 'HP';
                  } else if (text === '攻击') {
                    keyName = 'ATK';
                  } else if (text === '现实防御') {
                    keyName = 'Reality DEF';
                  } else if (text === '精神防御') {
                    keyName = 'Mental DEF';
                  } else if (text === '暴击率') {
                    keyName = 'Crit Rate';
                  } else if (text === '暴击创伤') {
                    keyName = 'Crit DMG';
                  } else if (text === '创伤加成') {
                    keyName = 'DMG Bonus';
                  } else if (text === '受创减免') {
                    keyName = 'DMG Reduction';
                  } else if (text === '抗暴率') {
                    keyName = 'Crit Resist';
                  } else if (text === '暴击防御') {
                    keyName = 'Crit DEF';
                  }
                  const value = $(span).next().text().trim();
                  data[keyName] = value;
                });

                extractedData.push(data);
              }
            }
          });

          // console.log(extractedData);
          const uniquecharacterUrls2 = Array.from(new Set(puzzleUrls));
          if (uniquecharacterUrls2.length > 0) {
            console.log(uniquecharacterUrls2);
          }
        })
        .catch((error) => {
          console.error('Error:', error);
        });
    });
  })
  .catch((error) => {
    console.error('Error:', error);
  });
