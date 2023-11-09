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
  'https://res1999.huijiwiki.com/wiki/%E6%A7%B2%E5%AF%84%E7%94%9F'
)
  .then((html) => {
    const getLevel = 10;
    const $ = cheerio.load(html);

    const resonateElements = $('.resonate-single');

    const extractedData = [];

    resonateElements.each((index, element) => {
      const data = {};

      level = $(element).closest('.resonate-tabber-item').data('level');
      if (level === getLevel) {
        data.level = level;
        levelInfo = $(element).find('div:first-child').text().trim();
        src = $(element).find('img').attr('src');
        if (levelInfo) {
          let from = [];
          if (src.includes('Fw_000')) {
            from = [
              [true, true],
              [true, true],
            ];
          } else if (src.includes('Fw_001')) {
            from = [[true], [true], [true], [true]];
          } else if (src.includes('Fw_002')) {
            from = [
              [false, true, true],
              [true, true, false],
            ];
          } else if (src.includes('Fw_003')) {
            from = [
              [true, true, false],
              [false, true, true],
            ];
          } else if (src.includes('Fw_004')) {
            from = [
              [true, false],
              [true, false],
              [true, true],
            ];
          } else if (src.includes('Fw_005')) {
            from = [
              [false, true],
              [false, true],
              [true, true],
            ];
          } else if (src.includes('Fw_006')) {
            from = [
              [false, true, false],
              [true, true, true],
            ];
          } else if (src.includes('Fw_007')) {
            from = [[true]];
          } else if (src.includes('Fw_008')) {
            from = [[true]];
          } else if (src.includes('Fw_009')) {
            from = [[true, true]];
          } else if (src.includes('Fw_010')) {
            from = [
              [false, true, false],
              [true, true, true],
              [false, true, false],
            ];
          }
          if (src.includes('Fw_011')) {
            from = [
              [true, true, false],
              [false, true, false],
              [false, true, true],
            ];
          } else if (src.includes('Fw_012')) {
            from = [
              [true, true],
              [true, false],
            ];
          } else if (src.includes('Fw_013')) {
            from = [
              [false, true, false],
              [false, true, false],
              [true, true, true],
            ];
          } else if (src.includes('Fw_014')) {
            from = [
              [true, false, true],
              [true, true, true],
            ];
          }
          if (from.length > 0) {
            data.from = from;
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
      }
    });

    console.log(extractedData);
  })
  .catch((error) => {
    console.error('Error:', error);
  });
