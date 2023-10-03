const express = require('express');
const { PrismaClient } = require('@prisma/client');
const cors = require('cors');
const fs = require('fs');
const cheerio = require('cheerio');
const { findRenderedDOMComponentWithClass } = require('react-dom/test-utils');

const prisma = new PrismaClient();
const app = express();
const port = process.env.PORT || 7777;

app.use(express.json());
app.use(cors());

// In-memory storage for user entry timestamps
const userEntryTimestamps = {};
const userEntryTimestamps2 = {};

// Middleware to record timestamps for user entry
app.use((req, res, next) => {
  const userId = req.query.userId; // Assuming you pass the user's ID as a query parameter
  if (userId) {
    userEntryTimestamps2[userId] = userEntryTimestamps[userId];
    userEntryTimestamps[userId] = Date.now();
  }
  next();
});

app.get('/api/check-fetch-condition', (req, res) => {
  console.log('Starting Check Fetch Condition API');
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ error: 'Invalid request' });
  }

  const entryTimestamp = userEntryTimestamps[userId] || 0;
  const oldTime = userEntryTimestamps2[userId] || 0;
  const elapsedTime = entryTimestamp - oldTime;

  // Check if the condition to fetch data is met (e.g., 30 minutes have passed)
  //const shouldFetch = elapsedTime >= 30 * 60 * 1000;
  const shouldFetch = elapsedTime >= 1000;
  console.log(
    'userId:',
    userId + ' entryTimestamp:',
    entryTimestamp + ' oldTime:',
    oldTime + ' elapsedTime:',
    elapsedTime + ' shouldFetch:',
    shouldFetch
  );

  res.json({ shouldFetch });
});

app.get('/api/genshin-draw', async (req, res) => {
  console.log('Starting Genshin Draw API');
  const { userGameId } = req.query;
  const filePath = `./backend_server/draw_cache/genshin/Genshin-${userGameId}.json`;

  if (!userGameId) {
    return res.status(400).json({ error: 'Invalid request' });
  }

  // Check if the file exists
  if (fs.existsSync(filePath)) {
    // Read the file contents
    const fileContents = fs.readFileSync(filePath, 'utf-8');

    // Parse the JSON data from the file
    try {
      const jsonData = JSON.parse(fileContents);
      totalJsonDataItems = jsonData.length;
      const summaryTableData = await prisma.SummaryTable.findUnique({
        where: {
          Game_UID: `Genshin-${userGameId}`,
        },
      });
      if (summaryTableData.total_items === totalJsonDataItems) {
        console.log('Data is up to date');
        return res.json(jsonData);
      }
    } catch (error) {
      errorMessage = ('Error parsing JSON data:', error);
      console.error(errorMessage);
      return res.status(400).json({ error: errorMessage });
    }
  } else {
    console.log('File does not exist.');
  }

  // If the file does not exist or the data is not up to date, fetch the data from the database
  console.log('Fetching data from database');
  try {
    // Use Prisma to query the Genshin_Draw table based on Genshin_UID
    const data = await prisma.Genshin_Draw.findMany({
      where: {
        Genshin_UID: userGameId,
      },
      orderBy: {
        DrawTime: 'desc',
      },
    });

    // Sort the data by DrawTime and DrawID in descending order
    const sortedData = data.sort((a, b) => {
      // Compare DrawTime first (descending order)
      const timeComparison = b.DrawTime.getTime() - a.DrawTime.getTime();

      // If DrawTime is the same, compare by DrawID (descending order)
      if (timeComparison === 0) {
        return b.DrawID.localeCompare(a.DrawID);
      }

      return timeComparison;
    });

    const dataWithDrawNumber = sortedData.reverse().map((item, index) => ({
      ...item,
      drawNumber: index + 1,
    }));

    // Initialize banner-specific pity counters
    const bannerPity = new Map();

    // Initialize arrays to hold draws for each banner
    const bannerDraws = new Map();

    // Group draws by banner
    for (const item of dataWithDrawNumber) {
      // Extract the base banner type (e.g., 'Character Event Wish')
      let baseBannerType = item.DrawType;

      if (item.DrawType.startsWith('Character Event Wish - ')) {
        // If the DrawType starts with 'Character Event Wish - ', classify it as 'Character Event Wish'
        baseBannerType = 'Character Event Wish';
      }

      if (!bannerPity.has(baseBannerType)) {
        bannerPity.set(baseBannerType, { rarity4Pity: 0, rarity5Pity: 0 });
        bannerDraws.set(baseBannerType, []);
      }

      bannerDraws.get(baseBannerType).push(item);
    }

    // Calculate and update pity for each banner
    for (const [banner, draws] of bannerDraws) {
      let rarity4Pity = 0;
      let rarity5Pity = 0;

      // Reverse the draws to calculate pity from the newest to oldest
      for (const item of draws) {
        rarity4Pity++;
        rarity5Pity++;

        if (item.Rarity === '4') {
          item.rarity5Pity = 0;
          item.rarity4Pity = rarity4Pity;
          rarity4Pity = 0;
        } else if (item.Rarity === '5') {
          item.rarity4Pity = 0;
          item.rarity5Pity = rarity5Pity;
          rarity4Pity++;
          rarity5Pity = 0;
        } else {
          item.rarity4Pity = 0;
          item.rarity5Pity = 0;
        }
      }
    }

    // Combine the draws for all banners and sort by DrawTime
    const combinedDraws = [...bannerDraws.values()]
      .flat()
      .sort((a, b) => b.drawNumber - a.drawNumber);

    // console.log('Data:', combinedDraws);
    fs.writeFileSync(filePath, JSON.stringify(combinedDraws, null, 2));
    return res.json(combinedDraws);
  } catch (error) {
    console.error('Error fetching data:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Beginner Wish = 100, Permanent Wish = 200, Character Event Wish = 301, Character Event Wish - 2 = 400,  Weapon Event Wish = 302
// Object properties: {
//   uid: '802199629',
//   gacha_type: '301',
//   item_id: '',
//   count: '1',
//   time: '2023-09-30 03:38:45',
//   name: 'Harbinger of Dawn',
//   lang: 'en-us',
//   item_type: 'Weapon',
//   rank_type: '3',
//   id: '1696014360000464729'
// }

app.get('/api/genshin-draw-import', async (req, res) => {
  console.log('Starting Genshin Draw Import API');
  try {
    let endid = '0';
    let banner = 100;
    let authkey = req.query.authkey;
    let newDraws = [];
    let loop = true;

    while (loop) {
      const apiUrl =
        'https://hk4e-api-os.hoyoverse.com/event/gacha_info/api/getGachaLog?authkey_ver=1&sign_type=2&auth_appid=webview_gacha&init_type=' +
        banner +
        '&lang=en&authkey=' +
        authkey +
        '&gacha_type=' +
        banner +
        '&page=1&size=20&end_id=' +
        endid;

      // Use the built-in fetch to make the request to Mihoyo API
      const response = await fetch(apiUrl);

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      // Parse the response body as JSON
      const responseData = await response.json();
      //console.log('Response data:', responseData);
      if (responseData.retcode === -110) {
        // Visit API too frequently
        // Wait for 1 seconds before trying again
        await new Promise((resolve) => setTimeout(resolve, 1000));
        continue;
      }
      if (!responseData.data) {
        // console.log(responseData)
        return res.json({ message: responseData.message });
      }
      const itemList = responseData.data.list;
      if (itemList.length > 0) {
        // No more data

        let duplicateFound = false;

        for (const item of itemList) {
          try {
            const existingItem = await prisma.Genshin_Draw.findUnique({
              where: {
                DrawID: item.id, // Assuming DrawID uniquely identifies an item
              },
            });

            if (existingItem) {
              // console.log(
              //   `Item with DrawID ${item.id} exists in Genshin_Draw table.`
              // );
              duplicateFound = true;
              //console.log('Duplicate found');
              break; // Exit the loop if a duplicate is found
            } else {
              switch (item.gacha_type) {
                case '100':
                  item.gacha_type = 'Beginner Wish';
                  break;
                case '200':
                  item.gacha_type = 'Permanent Wish';
                  break;
                case '301':
                  item.gacha_type = 'Character Event Wish';
                  break;
                case '400':
                  item.gacha_type = 'Character Event Wish - 2';
                  break;
                case '302':
                  item.gacha_type = 'Weapon Event Wish';
                  break;
                default:
                  item.gacha_type = 'Unknown';
              }

              if (item.gacha_type !== 'Unknown') {
                // Split the date and time string into its components
                const [datePart, timePart, ampm] = item.time.split(' ');

                // Split the date components into year, month, and day
                const [year, month, day] = datePart.split('-').map(Number);

                // Split the time components into hours, minutes, seconds, and AM/PM
                const [time] = timePart.split(' ');
                const [hours, minutes, seconds] = time.split(':').map(Number);

                // Create the Date object
                const dateTime = new Date(
                  year,
                  month - 1,
                  day,
                  hours,
                  minutes,
                  seconds
                );

                newDraws.push({
                  Genshin_UID: item.uid,
                  DrawID: item.id,
                  DrawTime: dateTime,
                  DrawType: item.gacha_type,
                  Item_Name: item.name,
                  Rarity: item.rank_type,
                });
              }

              // console.log(
              //   `Item with DrawID ${item.id} does not exist in Genshin_Draw table.`
              // );
            }
          } catch (error) {
            console.error(`Error checking item with DrawID ${item.id}:`, error);
          }
        }
        endid = itemList[itemList.length - 1].id;
        if (duplicateFound) {
          if (banner === 100) {
            banner = 301;
            endid = '0';
          } else if (banner === 301) {
            banner = 400;
            endid = '0';
          } else if (banner === 400) {
            banner = 302;
            endid = '0';
          } else if (banner === 302) {
            banner = 200;
            endid = '0';
          } else {
            loop = false;
          }
        }
      } else {
        if (banner === 100) {
          banner = 301;
          endid = '0';
        } else if (banner === 301) {
          banner = 400;
          endid = '0';
        } else if (banner === 400) {
          banner = 302;
          endid = '0';
        } else if (banner === 302) {
          banner = 200;
          endid = '0';
        } else {
          loop = false;
        }
      }
      // console.log(newDraws);
      // Use Prisma to create a new entry in the Genshin_Draw table
      if (newDraws.length > 0) {
        await prisma.Genshin_Draw.createMany({
          data: newDraws,
          skipDuplicates: true,
        });
        // Update SummaryTable about the new data

        // Calculate the total number of items in newDraws
        const totalItems = newDraws.length;

        // Update the SummaryTable with the new total item count
        await prisma.SummaryTable.upsert({
          where: { Game_UID: `Genshin-${newDraws[0].Genshin_UID}` },
          update: {
            total_items: {
              increment: totalItems, // Specify the amount to increment by
            },
          },
          create: {
            Game_UID: `Genshin-${newDraws[0].Genshin_UID}`,
            total_items: totalItems,
          },
        });

        console.log('Data inserted successfully');
        return res.json({ message: 'newData' });
      } else {
        console.log('No new data');
        return res.json({ message: 'noNewData' });
      }
    }
  } catch (errors) {
    console.error('Fetch error:', errors);
    return res.json({ message: errors });
  }
});

app.get('/api/genshin-draw-icons', async (req, res) => {
  console.log('Starting Genshin Draw Icons API');
  // Define the URL of the MediaWiki API
  const apiUrl = 'https://genshin-impact.fandom.com/api.php';

  // Define the parameters for your API request
  const params = {
    action: 'parse', // You can use 'parse' to retrieve page content
    page: 'Weapon/List', // The page you want to fetch data from
    format: 'json', // You can specify the format as JSON
  };
  // Define the URL of the MediaWiki API
  const apiUrl2 = 'https://genshin-impact.fandom.com/api.php';

  // Define the parameters for your API request
  const params2 = {
    action: 'parse', // You can use 'parse' to retrieve page content
    page: 'Character/List', // The page you want to fetch data from
    format: 'json', // You can specify the format as JSON
  };
  try {
    // Construct the API URL with parameters
    const url = `${apiUrl}?${new URLSearchParams(params).toString()}`;
    // Construct the API URL with parameters
    const url2 = `${apiUrl2}?${new URLSearchParams(params2).toString()}`;

    // Fetch data from the API
    const response = await fetch(url);
    const data = await response.json();
    // Fetch data from the API
    const response2 = await fetch(url2);
    const data2 = await response2.json();

    // Extract the content from the response
    const content = data.parse.text['*'];
    // Extract the content from the response
    const content2 = data2.parse.text['*'];

    // Parse the HTML content using cheerio
    const $ = cheerio.load(content);
    // Parse the HTML content using cheerio
    const $2 = cheerio.load(content2);

    // Find all <img> elements with the data-src attribute
    const imgElements = $('img[data-src]');

    // Find all <img> elements with the data-src attribute
    const imgElements2 = $2('img[data-src]');

    // Initialize a Set to store filtered data-src values (automatically removes duplicates)
    const filteredDataSrcSet = new Set();

    // Iterate through each matching element
    imgElements.each((index, element) => {
      // Get the value of the data-src attribute for each element
      const dataSrc = $(element).attr('data-src');

      // Check if the data-src value contains the word "weapon"
      if (dataSrc && dataSrc.includes('Weapon')) {
        // Remove any characters after .png
        const filteredDataSrc = dataSrc.split('.png')[0] + '.png';

        // If it contains "weapon," add it to the Set
        filteredDataSrcSet.add(filteredDataSrc);
      }
    });
    // Iterate through each matching element
    imgElements2.each((index, element) => {
      // Get the value of the data-src attribute for each element
      const dataSrc2 = $(element).attr('data-src');
      const filteredDataSrc2 = dataSrc2.split('.png')[0] + '.png';
      if (!filteredDataSrcSet.has(filteredDataSrc2)) {
        if (filteredDataSrc2 && filteredDataSrc2.includes('Icon')) {
          // If it contains "weapon," add it to the Set
          filteredDataSrcSet.add(filteredDataSrc2);
        }
      }
    });

    // Convert the Set back to an array (if needed)
    const filteredDataSrcValues = Array.from(filteredDataSrcSet);

    res.json(filteredDataSrcValues);
  } catch (error) {
    console.error('Error fetching data:', error);
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
