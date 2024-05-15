import axios from 'axios';
import cheerio from 'cheerio';
import { API_URL } from '../API_Config.js';
import r1999_1 from '../assets/r1999/1.webp';
import r1999_2 from '../assets/r1999/2.webp';
import r1999_3 from '../assets/r1999/3.webp';
import r1999_4 from '../assets/r1999/4.webp';
import r1999_5 from '../assets/r1999/5.webp';
import r1999_6 from '../assets/r1999/6.webp';
import r1999_r2 from '../assets/r1999/r2.webp';
import r1999_r3 from '../assets/r1999/r3.webp';
import r1999_r4 from '../assets/r1999/r4.webp';
import r1999_r5 from '../assets/r1999/r5.webp';
import r1999_r6 from '../assets/r1999/r6.webp';

// Function to fetch website HTML content
export async function fetchWebsiteHtml(url) {
  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching website content:', error);
    throw error;
  }
}

// Function to extract image URLs and text from HTML for first 2 tables
export function extractDataFromIGNHTMLFirstTwoTable(html) {
  const $ = cheerio.load(html);
  const firstTableData = { imageUrls: [], boldText: [] };
  const secondTableData = { imageUrls: [], boldText: [] };

  // Select the first two tables using CSS selectors
  const firstTable = $('table').eq(0);
  const secondTable = $('table').eq(1);

  // Extract <img> elements and <b> elements from the first table
  firstTable.find('img').each((index, element) => {
    const imageUrl = $(element).attr('src');
    if (imageUrl) {
      if (
        imageUrl.startsWith(
          'https://oyster.ignimgs.com/mediawiki/apis.ign.com/genshin-impact/'
        )
      ) {
        const imageUrl = $(element).attr('src').split('?')[0] + '?width=1200';
        firstTableData.imageUrls.push(imageUrl);
      }
    }
  });

  firstTable.find('b').each((index, element) => {
    const text = $(element).text();
    if (text) {
      firstTableData.boldText.push(text);
    }
  });

  // Extract <img> elements and <b> elements from the second table
  secondTable.find('img').each((index, element) => {
    const imageUrl = $(element).attr('src');
    if (imageUrl) {
      if (
        imageUrl.startsWith(
          'https://oyster.ignimgs.com/mediawiki/apis.ign.com/genshin-impact/'
        )
      ) {
        // https://oyster.ignimgs.com/mediawiki/apis.ign.com/genshin-impact/2/24/Key_art_EN.png?width=200&quality=20&dpr=0.05
        // remove &quality=20&dpr=0.05 from image url
        const imageUrl = $(element).attr('src').split('?')[0] + '?width=1200';
        secondTableData.imageUrls.push(imageUrl);
      }
    }
  });

  secondTable.find('b').each((index, element) => {
    const text = $(element).text();
    if (text) {
      secondTableData.boldText.push(text);
    }
  });

  // Log the extracted image URLs and bold text for each table
  // console.log('Data from First Table:');
  // console.log(firstTableData);

  // console.log('\nData from Second Table:');
  // console.log(secondTableData);

  return { firstTableData, secondTableData };
}

// Function to extract the newest Key Art image URL from HTML
export function extractNewestKeyArt(html) {
  const $ = cheerio.load(html);
  let imageUrl = null;

  // Use CSS selectors to find image elements
  $('img').each((index, element) => {
    const src = $(element).attr('src');
    const alt = $(element).attr('alt');

    if (
      src &&
      alt === 'Key art EN.png' &&
      src.startsWith(
        'https://oyster.ignimgs.com/mediawiki/apis.ign.com/genshin-impact/'
      )
    ) {
      // Modify the image URL to the desired format
      imageUrl = src.split('?')[0] + '?width=1200';
      return false; // Exit the loop as soon as an image is found
    }
  });

  return imageUrl;
}

function IGNGenshinBannerDateFormater(date) {
  // Define month names mapping
  const monthNames = {
    Jan: 0,
    January: 0,
    Feb: 1,
    February: 1,
    Mar: 2,
    March: 2,
    Apr: 3,
    April: 3,
    May: 4,
    Jun: 5,
    June: 5,
    Jul: 6,
    July: 6,
    Aug: 7,
    August: 7,
    Sep: 8,
    September: 8,
    Sept: 8,
    Oct: 9,
    October: 9,
    Nov: 10,
    November: 10,
    Dec: 11,
    December: 11,
  };
  if (date === 'October 14 - November 1, 202') {
    date = 'October 14 - November 1, 2020';
  }
  // Regular expression patterns for both date formats
  const datePattern1 =
    /^(\w{3,20}) (\d{1,2}), (\d{4}) - (\w{3,20}) (\d{1,2}), (\d{4})$/;
  const datePattern2 = /^(\w{3,20} \d{1,2}) - (\w{3,20} \d{1,2}, \d{4})$/;

  // Try to match both patterns
  const match1 = date.match(datePattern1);
  const match2 = date.match(datePattern2);

  if (match1) {
    // Format 1: Month Day, Year - Month Day, Year
    const [, startMonth, startDay, startYear, endMonth, endDay, endYear] =
      match1;
    const startDate = new Date(
      startYear,
      monthNames[startMonth],
      parseInt(startDay)
    );
    const endDate = new Date(endYear, monthNames[endMonth], parseInt(endDay));
    return { startDate, endDate };
  } else if (match2) {
    // Format 2: Month Day, Year - Month Day, Year
    const [, startDateStr, endDateStr] = match2;
    const [endDateStr2, YearDateStr] = endDateStr.split(', ');
    const startDate = new Date(startDateStr + ' ' + YearDateStr);
    const endDate = new Date(endDateStr2 + ' ' + YearDateStr);
    return { startDate, endDate };
  } else {
    // Invalid date format
    console.error('Invalid date format:', date);
    return null;
  }
}

// Function to extract image URLs from HTML
export function extractIGNImageUrls(html) {
  const $ = cheerio.load(html);
  let firstTableData = '';
  const bannerDates = [];

  // Select the first two tables using CSS selectors
  const firstTable = $('table').eq(0);
  firstTable.find('b').each((index, element) => {
    const text = $(element).text();
    if (text) {
      if (index === 1) {
        firstTableData = text;
        return;
      }
    }
  });

  // Create a temporary div element to parse the HTML content
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;

  // Find all table elements within the div
  const tables = tempDiv.querySelectorAll('table');
  bannerDates.push(IGNGenshinBannerDateFormater(firstTableData));

  // Iterate through all tables
  tables.forEach((table) => {
    // Find all rows within the table
    const rows = table.querySelectorAll('tr');

    // Iterate through rows and extract the date information
    rows.forEach((row) => {
      // Find all cells within the row
      const cells = row.querySelectorAll('td');

      if (cells.length >= 3) {
        // Ensure there are at least 3 cells in the row
        let date = cells[2].textContent.trim(); // Extract and trim the text from the third cell (index 2)
        const dates = IGNGenshinBannerDateFormater(date);
        bannerDates.push(dates);
      }
    });
  });

  return bannerDates;
}

export async function fetchR1999CharacterList() {
  const imageSrcLists = [];
  async function fetchData() {
    try {
      const response = await fetch(
        `${API_URL}api/misc-commands?scrapeCommand=reverse1999characterList`
      );
      const data = await response.json();
      imageSrcLists.push(data);
      // console.log(imageSrcLists);
    } catch (error) {
      console.error('Error fetching API usage data:', error);
    }
  }
  await fetchData();
  const groupedUrls = [];
  await fetchWebsiteHtml(
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
      const characterNames = [];
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

      $('.character-list-text-en').each((index, element) => {
        const names = $(element).text();
        if (names) {
          characterNames.push(names);
        }
      });
      const uniquecharacterUrls = Array.from(new Set(characterUrls));
      const uniquecharacterNames = Array.from(new Set(characterNames));
      let counter = 0;
      for (let i = 0; i < imageSrcList.length; i += 3) {
        const url = uniquecharacterUrls[counter];
        const name = uniquecharacterNames[counter];
        const character = imageSrcLists[0][name.toLowerCase()];
        // const character = imageSrcList[i];
        let rarity = imageSrcList[i + 1];
        if (rarity.includes('pz003')) {
          rarity = r1999_r3;
        } else if (rarity.includes('pz004')) {
          rarity = r1999_r4;
        } else if (rarity.includes('pz005')) {
          rarity = r1999_r5;
        } else if (rarity.includes('pz006')) {
          rarity = r1999_r6;
        } else if (rarity.includes('pz002')) {
          rarity = r1999_r2;
        }

        let element = imageSrcList[i + 2];
        if (element.includes('Lssx_1')) {
          element = r1999_1;
        } else if (element.includes('Lssx_2')) {
          element = r1999_2;
        } else if (element.includes('Lssx_3')) {
          element = r1999_3;
        } else if (element.includes('Lssx_4')) {
          element = r1999_4;
        } else if (element.includes('Lssx_5')) {
          element = r1999_5;
        } else if (element.includes('Lssx_6')) {
          element = r1999_6;
        }

        counter++;

        if (character && rarity && element) {
          groupedUrls.push({ name, character, rarity, element, url });
        }
      }
    })
    .catch((error) => {
      console.error('Error:', error);
    });
  // console.log(groupedUrls);
  return groupedUrls;
}
export async function fetchR1999GetReso(url, resoLevel) {
  const extractedData = [];
  await fetchWebsiteHtml(url).then((html) => {
    const $ = cheerio.load(html);

    const resonateElements = $('.resonate-single');

    resonateElements.each((index, element) => {
      const data = {};

      const level = $(element).closest('.resonate-tabber-item').data('level');
      if (level === parseInt(resoLevel)) {
        const levelInfo = $(element).find('div:first-child').text().trim();
        const src = $(element).find('img').attr('src');
        if (levelInfo) {
          let from = [];
          let extraValue = 0;
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
            extraValue = 100;
          }
          if (src.includes('Fw_011')) {
            from = [
              [true, true, false],
              [false, true, false],
              [false, true, true],
            ];
            extraValue = 100;
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
            extraValue = 100;
          } else if (src.includes('Fw_014')) {
            from = [
              [true, false, true],
              [true, true, true],
            ];
            extraValue = 100;
          }
          if (from.length > 0) {
            data.form = from;
            data.extraValue = extraValue;
            data.amount = levelInfo.split('Lv')[0];
            const spans = $(element).find('span');
            data['stats'] = {};
            data['stats']['HP'] = 0;
            data['stats']['ATK'] = 0;
            data['stats']['Reality DEF'] = 0;
            data['stats']['Mental DEF'] = 0;
            data['stats']['Crit Rate'] = 0;
            data['stats']['Crit DMG'] = 0;
            data['stats']['DMG Bonus'] = 0;
            data['stats']['DMG Reduction'] = 0;
            data['stats']['Crit Resist'] = 0;
            data['stats']['Crit DEF'] = 0;
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
              let value = $(span).next().text().trim().replace('+', '');
              if (value.includes('%')) {
                value = parseFloat(value.replace('%', ''));
                if (
                  keyName === 'HP' ||
                  keyName === 'ATK' ||
                  keyName === 'Reality DEF' ||
                  keyName === 'Mental DEF'
                ) {
                  value = value * level;
                }
              } else {
                value = parseFloat(value);
              }
              data['stats'][keyName] = value;
            });
            extractedData.push(data);
          }
        }
      }
    });
  });
  return extractedData;
}

// // Function to extract image URLs from HTML
// export function extractImageUrls(html) {
//   const $ = cheerio.load(html);
//   const imageUrls = [];

//   // Use CSS selectors to find image elements
//   $('img').each((index, element) => {
//     const imageUrl = $(element).attr('src');
//     const altTitle = $(element).attr('alt');
//     if (imageUrl) {
//       if (imageUrl.startsWith('https://oyster.ignimgs.com/mediawiki/apis.ign.com/genshin-impact/')) {
//           // https://oyster.ignimgs.com/mediawiki/apis.ign.com/genshin-impact/2/24/Key_art_EN.png?width=200&quality=20&dpr=0.05
//           // remove &quality=20&dpr=0.05 from image url
//           const imageUrl = $(element).attr('src').split('?')[0] + '?width=1200';
//           console.log(altTitle);
//           console.log(imageUrl);
//           imageUrls.push(imageUrl);
//       }
//     }
//   });

//   return imageUrls;
// }
