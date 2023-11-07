const express = require('express');
const { PrismaClient } = require('@prisma/client');
const cors = require('cors');
const fs = require('fs');
const cheerio = require('cheerio');
const { get } = require('http');
const { createClient } = require('@supabase/supabase-js');
// Initialize a Supabase client with your Supabase URL and API key
const supabaseUrl = 'https://vtmjuwctzebijssijzhq.supabase.co';
const supabaseKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ0bWp1d2N0emViaWpzc2lqemhxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTY5NjcwOTE3MywiZXhwIjoyMDEyMjg1MTczfQ.wb1hHzf0_D5uaqURxof7VhKF53Bz0jxcwt9vvXkRrFY';
const supabase = createClient(supabaseUrl, supabaseKey);

// Define the name of the bucket you want to read from
const bucketName = 'draw-cache';

const prisma = new PrismaClient();
const app = express();
const port = process.env.PORT || 7777;

app.use(express.json());
app.use(cors());

app.get('/api/draw-watchlist', async (req, res) => {
  const game = req.query.game;
  const command = req.query.command;
  if (!game) {
    return res.status(400).json({ error: 'Invalid request' });
  }
  if (game === 'genshin') {
    if (command === 'get') {
      // console.log('Starting Genshin Draw Watchlist Get API');
      const userGameId = req.query.userGameId;
      if (!userGameId) {
        return res.status(400).json({ error: 'Invalid request' });
      }
      try {
        const data = await prisma.Games_Users.findUnique({
          where: {
            UID: userGameId,
          },
          select: {
            Genshin_Watch: true,
          },
        });
        if (!data) {
          return res.status(400).json({ error: 'Invalid request' });
        }
        return res.json(data);
      } catch (error) {
        console.error('Error fetching data:', error);
        return res.status(500).json({ error: 'Internal server error' });
      }
    } else if (command === 'update') {
      // console.log('Starting Genshin Draw Watchlist Update API');
      const { userGameId, watchList } = req.body;
      if (!userGameId || !watchList) {
        return res.status(400).json({ error: 'Invalid request' });
      }
      try {
        const data = await prisma.Games_Users.update({
          where: {
            UID: userGameId,
          },
          data: {
            Genshin_Watch: watchList,
          },
        });
        if (!data) {
          return res.status(400).json({ error: 'Invalid request' });
        }
        return res.json({ message: 'success' });
      } catch (error) {
        console.error('Error fetching data:', error);
        return res.status(500).json({ error: 'Internal server error' });
      }
    }
  } else if (game === 'starrail') {
    if (command === 'get') {
      // console.log('Starting Genshin Draw Watchlist Get API');
      const userGameId = req.query.userGameId;
      if (!userGameId) {
        return res.status(400).json({ error: 'Invalid request' });
      }
      try {
        const data = await prisma.Games_Users.findUnique({
          where: {
            UID: userGameId,
          },
          select: {
            StarRail_Watch: true,
          },
        });
        if (!data) {
          return res.status(400).json({ error: 'Invalid request' });
        }
        return res.json(data);
      } catch (error) {
        console.error('Error fetching data:', error);
        return res.status(500).json({ error: 'Internal server error' });
      }
    } else if (command === 'update') {
      // console.log('Starting Genshin Draw Watchlist Update API');
      const { userGameId, watchList } = req.body;
      if (!userGameId || !watchList) {
        return res.status(400).json({ error: 'Invalid request' });
      }
      try {
        const data = await prisma.Games_Users.update({
          where: {
            UID: userGameId,
          },
          data: {
            StarRail_Watch: watchList,
          },
        });
        if (!data) {
          return res.status(400).json({ error: 'Invalid request' });
        }
        return res.json({ message: 'success' });
      } catch (error) {
        console.error('Error fetching data:', error);
        return res.status(500).json({ error: 'Internal server error' });
      }
    }
  }
});

app.get('/api/draw-history', async (req, res) => {
  // * Done
  console.log('Starting Genshin Draw API');
  const game = req.query.game;
  const userGameId = req.query.userGameId;
  if (game === 'genshin') {
    let genshinUID = '';
    if (!userGameId) {
      return res.status(400).json({ error: 'Invalid request' });
    }
    if (userGameId.length > 12) {
      // get genshin uid from user id in database
      const dataUser = await prisma.Games_Users.findUnique({
        where: { UID: userGameId },
      });
      if (!dataUser) {
        return res.status(400).json({ error: 'Invalid request' });
      }
      genshinUID = dataUser.Genshin_UID;
    } else {
      genshinUID = userGameId;
    }
    const filePath = `./backend_server/draw_cache/genshin/Genshin-${genshinUID}.json`;

    if (!genshinUID) {
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
            Game_UID: `Genshin-${genshinUID}`,
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
          Genshin_UID: genshinUID,
        },
        orderBy: {
          DrawTime: 'desc',
        },
        select: {
          DrawID: true,
          DrawTime: true,
          Item_Name: true,
          DrawType: true,
          Rarity: true,
        },
      });

      if (!data) {
        return res.status(400).json({ error: 'Invalid request' });
      }

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
            if (rarity4Pity === 11) {
              rarity4Pity = 10;
            }
            if (rarity4Pity > 10) {
              console.log(item.DrawID, rarity4Pity);
            }
            item.rarity4Pity = rarity4Pity;
            rarity4Pity = 0;
          } else if (item.Rarity === '5') {
            item.rarity5Pity = rarity5Pity;
            rarity5Pity = 0;
          }
        }
      }

      // Combine the draws for all banners and sort by DrawTime
      const combinedDraws = [...bannerDraws.values()]
        .flat()
        .sort((a, b) => b.drawNumber - a.drawNumber);

      if (combinedDraws.length === 0) {
        return res.json({ message: 'No data' });
      } else {
        fs.writeFileSync(filePath, JSON.stringify(combinedDraws, null, 2));
        return res.json(combinedDraws);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  } else if (game === 'starrail') {
    // * Should be done
    console.log('Starting StarRail Draw API');
    const { userGameId } = req.query;
    let starrailUID = '';
    if (!userGameId) {
      return res.status(400).json({ error: 'Invalid request' });
    }
    if (userGameId.length > 12) {
      // get starrail uid from user id in database
      const dataUser = await prisma.Games_Users.findUnique({
        where: { UID: userGameId },
      });
      if (!dataUser) {
        return res.status(400).json({ error: 'Invalid request' });
      }
      starrailUID = dataUser.StarRail_UID;
    } else {
      starrailUID = userGameId;
    }
    const filePath = `./backend_server/draw_cache/starrail/StarRail-${starrailUID}.json`;

    if (!starrailUID) {
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
            Game_UID: `StarRail-${starrailUID}`,
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
      // Use Prisma to query the StarRail_Draw table based on StarRail_UID
      const data = await prisma.StarRail_Draw.findMany({
        where: {
          StarRail_UID: starrailUID,
        },
        orderBy: {
          DrawTime: 'desc',
        },
        select: {
          DrawID: true,
          DrawTime: true,
          Item_Name: true,
          DrawType: true,
          Rarity: true,
        },
      });

      if (!data) {
        return res.status(400).json({ error: 'Invalid request' });
      }

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
        // Extract the base banner type (e.g., 'Character Warp')
        let baseBannerType = item.DrawType;

        if (item.DrawType.startsWith('Character Warp - ')) {
          // If the DrawType starts with 'Character Warp - ', classify it as 'Character Warp'
          baseBannerType = 'Character Warp';
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
            if (rarity4Pity === 11) {
              rarity4Pity = 10;
            }
            if (rarity4Pity > 10) {
              console.log(item.DrawID, rarity4Pity);
            }
            item.rarity4Pity = rarity4Pity;
            rarity4Pity = 0;
          } else if (item.Rarity === '5') {
            item.rarity5Pity = rarity5Pity;
            rarity5Pity = 0;
          }
        }
      }

      // Combine the draws for all banners and sort by DrawTime
      const combinedDraws = [...bannerDraws.values()]
        .flat()
        .sort((a, b) => b.drawNumber - a.drawNumber);

      // console.log('Data:', combinedDraws);
      if (combinedDraws.length === 0) {
        return res.json({ message: 'noData' });
      } else {
        fs.writeFileSync(filePath, JSON.stringify(combinedDraws, null, 2));
      }
      return res.json(combinedDraws);
    } catch (error) {
      console.error('Error fetching data:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
});

app.get('/api/draw-import', async (req, res) => {
  const game = req.query.game;
  if (!game) {
    return res.status(400).json({ error: 'Invalid request' });
  }

  if (game === 'genshin') {
    // console.log('Starting Genshin Draw Import API');
    try {
      let endid = '0';
      let banner = 100;
      const authkey = req.query.authkey;
      const userID = req.query.userID;
      const newDraws = [];
      let loop = true;
      let genshin_uid = '';

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
              genshin_uid = item.uid;
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
              console.error(
                `Error checking item with DrawID ${item.id}:`,
                error
              );
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
            // get uid
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
      }
      // console.log(newDraws);
      // console.log(userID);

      // Use Prisma to update the Genshin_User table with the new UID
      await prisma.Games_Users.upsert({
        where: { UID: userID },
        update: { Genshin_UID: genshin_uid },
        create: { UID: userID, Genshin_UID: genshin_uid },
      });

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
    } catch (errors) {
      console.error('Fetch error:', errors);
      return res.json({ message: errors });
    }
  } else if (game === 'starrail') {
    // * should be done
    //console.log('Starting StarRail Draw Import API');
    try {
      let endid = '0';
      let banner = 2;
      const authkey = req.query.authkey;
      const userID = req.query.userID;
      const newDraws = [];
      let loop = true;
      let starrail_uid = '';

      while (loop) {
        const apiUrl =
          'https://api-os-takumi.mihoyo.com/common/gacha_record/api/getGachaLog?authkey_ver=1&sign_type=2&auth_appid=webview_gacha&default_gacha_type=' +
          banner +
          '&lang=en&authkey=' +
          authkey +
          '&game_biz=hkrpg_global&gacha_type=' +
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
              starrail_uid = item.uid;
              const existingItem = await prisma.StarRail_Draw.findUnique({
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
                  case '2':
                    item.gacha_type = 'Departure Warp';
                    break;
                  case '1':
                    item.gacha_type = 'Standard Warp';
                    break;
                  case '11':
                    item.gacha_type = 'Character Warp';
                    break;
                  // case '400':
                  //   item.gacha_type = 'Character Event Wish - 2';
                  //   break;
                  case '12':
                    item.gacha_type = 'Light Cone Warp';
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
                    StarRail_UID: item.uid,
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
              console.error(
                `Error checking item with DrawID ${item.id}:`,
                error
              );
            }
          }
          endid = itemList[itemList.length - 1].id;
          if (duplicateFound) {
            if (banner === 2) {
              banner = 11;
              endid = '0';
            } else if (banner === 11) {
              banner = 12;
              endid = '0';
              // } else if (banner === 400) {
              //   banner = 302;
              //   endid = '0';
            } else if (banner === 12) {
              banner = 1;
              endid = '0';
            } else {
              loop = false;
            }
          }
        } else {
          if (banner === 2) {
            // get uid
            banner = 11;
            endid = '0';
          } else if (banner === 11) {
            banner = 12;
            endid = '0';
            // } else if (banner === 400) {
            //   banner = 302;
            //   endid = '0';
          } else if (banner === 12) {
            banner = 1;
            endid = '0';
          } else {
            loop = false;
          }
        }
      }
      // console.log(newDraws);
      // console.log(userID);

      // Use Prisma to update the Genshin_User table with the new UID
      await prisma.Games_Users.upsert({
        where: { UID: userID },
        update: { StarRail_UID: starrail_uid },
        create: { UID: userID, StarRail_UID: starrail_uid },
      });

      // Use Prisma to create a new entry in the Genshin_Draw table
      if (newDraws.length > 0) {
        await prisma.StarRail_Draw.createMany({
          data: newDraws,
          skipDuplicates: true,
        });
        // Update SummaryTable about the new data

        // Calculate the total number of items in newDraws
        const totalItems = newDraws.length;

        // Update the SummaryTable with the new total item count
        await prisma.SummaryTable.upsert({
          where: { Game_UID: `StarRail-${newDraws[0].StarRail_UID}` },
          update: {
            total_items: {
              increment: totalItems, // Specify the amount to increment by
            },
          },
          create: {
            Game_UID: `StarRail-${newDraws[0].StarRail_UID}`,
            total_items: totalItems,
          },
        });

        console.log('Data inserted successfully');
        return res.json({ message: 'newData' });
      } else {
        console.log('No new data');
        return res.json({ message: 'noNewData' });
      }
    } catch (errors) {
      console.error('Fetch error:', errors);
      return res.json({ message: errors });
    }
  } else {
    return res.status(400).json({ error: 'Invalid request' });
  }
});

app.get('/api/draw-icons', async (req, res) => {
  const game = req.query.game;
  if (!game) {
    return res.status(400).json({ error: 'Invalid request' });
  }

  if (game === 'genshin') {
    // console.log('Starting Genshin Draw Icons API');
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

      // Convert the Set back to an array (if needed)
      const filteredDataSrcValues = Array.from(filteredDataSrcSet);

      res.json(filteredDataSrcValues);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  } else if (game === 'starrail') {
    // console.log('Starting StarRail Draw Icons API');
    // Define the URL of the MediaWiki API
    const apiUrl = 'https://honkai-star-rail.fandom.com/api.php';

    // Define the parameters for your API request
    const params = {
      action: 'parse', // You can use 'parse' to retrieve page content
      page: 'Light_Cone/List', // The page you want to fetch data from
      format: 'json', // You can specify the format as JSON
    };
    // Define the URL of the MediaWiki API
    const apiUrl2 = 'https://honkai-star-rail.fandom.com/api.php';

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
      // Iterate through each matching element
      imgElements.each((index, element) => {
        // Get the value of the data-src attribute for each element
        const dataSrc = $(element).attr('data-src');

        // Check if the data-src value contains the word "weapon"
        if (dataSrc && dataSrc.includes('Light_Cone')) {
          // Remove any characters after .png
          const filteredDataSrc = dataSrc.split('.png')[0] + '.png';

          // If it contains "weapon," add it to the Set
          filteredDataSrcSet.add(filteredDataSrc);
        }
      });

      // Convert the Set back to an array (if needed)
      const filteredDataSrcValues = Array.from(filteredDataSrcSet);

      res.json(filteredDataSrcValues);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  } else {
    return res.status(400).json({ error: 'Invalid request' });
  }
});

app.get('/api/draw-database', async (req, res) => {
  const game = req.query.game;

  if (!game) {
    return res.status(400).json({ error: 'Invalid request' });
  }
  if (game === 'genshin') {
    // console.log('Starting Genshin Database API');
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

      const tableRow = $('tr');
      const tableRow2 = $2('tr');
      const extractedDataCharacter = [];
      const extractedDataWeapon = [];

      tableRow.each((index, element) => {
        const rowData = $(element).find('td');

        const column2Text = rowData.eq(1).find('a').text();
        const column3DataSrc = rowData.eq(2).find('img').attr('data-src');
        const column4Text = rowData.eq(3).text();
        let column5Text = rowData.eq(4).text();
        const column6Text = rowData.eq(5).text();

        if (column2Text && column2Text !== 'Prized Isshin Blade') {
          const existingData = extractedDataWeapon.find(
            (data) => data.name === column2Text
          );

          if (column5Text.toLowerCase().includes('elemental mastery')) {
            column5Text = column5Text.replace('Elemental Mastery', 'EM');
          }
          if (column5Text.toLowerCase().includes('physical dmg bonus')) {
            column5Text = column5Text.replace('Physical DMG Bonus', 'Phys DMG');
          }
          if (column5Text.toLowerCase().includes('energy recharge')) {
            column5Text = column5Text.replace('Energy Recharge', 'ER');
          }

          if (!existingData) {
            const data = {
              name: column2Text,
              rarity: column3DataSrc.split('.png')[0] + '.png',
              atk: column4Text,
              sub: column5Text,
              passive: column6Text,
            };

            extractedDataWeapon.push(data);
          }
        }
      });

      tableRow2.each((index, element) => {
        const rowData = $(element).find('td');

        const column2Text = rowData.eq(1).find('a').text().trim();
        const column3DataSrc = rowData.eq(2).find('img').attr('data-src');
        const column4DataSrc = rowData.eq(3).find('a img').attr('data-src');
        const column5DataSrc = rowData.eq(4).find('a img').attr('data-src');
        const column8Text = rowData.eq(7).text().trim();

        if (column8Text && column2Text && column2Text !== 'Traveler') {
          const existingData = extractedDataCharacter.find(
            (data) => data.name === column2Text
          );

          if (!existingData) {
            const data = {
              name: column2Text,
              rarity: column3DataSrc.split('.png')[0] + '.png',
              element: column4DataSrc.split('.svg')[0] + '.svg',
              weapon: column5DataSrc.split('.png')[0] + '.png',
              release: column8Text,
            };
            extractedDataCharacter.push(data);
          }
        }
      });
      // Create an array of character objects with keys and release dates
      const characterArray = Object.entries(extractedDataCharacter).map(
        ([name, data]) => ({
          name: data.name,
          rarity: data.rarity,
          element: data.element,
          weapon: data.weapon,
          release: data.release,
        })
      );

      // Sort the characterArray by release date (newest first)
      characterArray.sort((a, b) => new Date(b.release) - new Date(a.release));

      res.json({
        characters: characterArray,
        weapons: extractedDataWeapon,
      });
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  } else if (game === 'starrail') {
    // console.log('Starting StarRail Database API');
    // Define the URL of the MediaWiki API
    const apiUrl = 'https://honkai-star-rail.fandom.com/api.php';

    // Define the parameters for your API request
    const params = {
      action: 'parse', // You can use 'parse' to retrieve page content
      page: 'Light_Cone/List', // The page you want to fetch data from
      format: 'json', // You can specify the format as JSON
    };
    // Define the URL of the MediaWiki API
    const apiUrl2 = 'https://honkai-star-rail.fandom.com/api.php';

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

      const tableRow = $('tr');
      const tableRow2 = $2('tr');
      const extractedDataCharacter = [];
      const extractedDataWeapon = [];

      tableRow.each((index, element) => {
        const rowData = $(element).find('td');

        const column1Text = rowData.eq(0).find('a').text().trim();
        const column2DataSrc = rowData.eq(1).find('img').attr('data-src');
        const column3DataSrc = rowData.eq(2).find('img').attr('data-src');
        const column4Text = rowData.eq(3).text().trim();
        const column5Text = rowData.eq(4).text().trim();

        if (column1Text) {
          const existingData = extractedDataWeapon.find(
            (data) => data.name === column1Text
          );

          if (!existingData) {
            let hpStat = '';
            let atkStat = '';
            let dfStat = '';

            if (column4Text.toLowerCase() === 'unknown') {
              hpStat = column4Text;
            } else {
              hpStat = column4Text.split('ATK:')[0];
              atkStat = 'ATK:' + column4Text.split('ATK:')[1].split('DEF:')[0];
              dfStat = 'DEF:' + column4Text.split('DEF:')[1];
            }
            const data = {
              name: column1Text,
              rarity: column2DataSrc.split('.png')[0] + '.png',
              type: column3DataSrc.split('.png')[0] + '.png',
              hp: hpStat,
              atk: atkStat,
              df: dfStat,
              passive: column5Text,
            };

            extractedDataWeapon.push(data);
          }
        }
      });

      tableRow2.each((index, element) => {
        const rowData = $(element).find('td');

        const column2Text = rowData.eq(1).find('a').text().trim();
        const column3DataSrc = rowData.eq(2).find('img').attr('data-src');
        const column4DataSrc = rowData.eq(3).find('a img').attr('data-src');
        const column5DataSrc = rowData.eq(4).find('a img').attr('data-src');

        if (column2Text && column2Text !== 'Trailblazer') {
          const existingData = extractedDataCharacter.find(
            (data) => data.name === column2Text
          );

          if (!existingData) {
            const data = {
              name: column2Text,
              rarity: column3DataSrc.split('.png')[0] + '.png',
              element: column4DataSrc.split('.png')[0] + '.png',
              weapon: column5DataSrc.split('.png')[0] + '.png',
            };
            extractedDataCharacter.push(data);
          }
        }
      });
      // Create an array of character objects with keys and release dates
      const characterArray = Object.entries(extractedDataCharacter).map(
        ([name, data]) => ({
          name: data.name,
          rarity: data.rarity,
          element: data.element,
          weapon: data.weapon,
        })
      );

      res.json({
        characters: characterArray,
        weapons: extractedDataWeapon,
      });
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  } else {
    return res.status(400).json({ error: 'Invalid request' });
  }
});

app.get('/api/misc-commands', async (req, res) => {
  console.log('Starting Misc Commands API');
  const scrapeCommand = req.query.scrapeCommand;
  if (scrapeCommand === 'starrailbanner') {
    // console.log('Starting StarRail Banner API');
    // Define the URL of the MediaWiki API
    const apiUrl = 'https://honkai-star-rail.fandom.com/api.php';

    // Define the parameters for your API request
    const params = {
      action: 'parse', // You can use 'parse' to retrieve page content
      page: 'Honkai:_Star_Rail_Wiki', // The page you want to fetch data from
      format: 'json', // You can specify the format as JSON
    };
    try {
      // Construct the API URL with parameters
      const url = `${apiUrl}?${new URLSearchParams(params).toString()}`;
      // Fetch data from the API
      const response = await fetch(url);
      const data = await response.json();

      // Extract the content from the response
      const content = data.parse.text['*'];

      // Parse the HTML content using cheerio
      const $ = cheerio.load(content);

      // Find all <img> elements with the data-src attribute
      const firstTable = $('table').eq(4);
      const imageURLSet = new Set();

      firstTable.find('img').each((index, element) => {
        const imageUrl = $(element).attr('data-src');
        if (imageUrl) {
          if (
            !imageUrl.includes('Stellar') &&
            !imageUrl.includes('Departure')
          ) {
            const newImageUrl = imageUrl.split('.png')[0] + '.png';
            imageURLSet.add(newImageUrl);
          }
        }
      });

      let dateText;
      firstTable.find('.lightbox-caption').each((index, element) => {
        const text = $(element).text();
        if (text.includes('From') && text.includes('to')) {
          const re = new RegExp(String.fromCharCode(160), 'g');
          dateText = text
            .split('(')[0]
            .trim()
            .replace(re, ' ')
            .replace('From ', '')
            .replace('to ', ' - ')
            .replaceAll(',', '');
          return false; // Exit the loop once found
        }
      });

      // Convert the Set back to an array (if needed)
      const imageURLArray = Array.from(imageURLSet);

      res.json({ urls: imageURLArray, date: dateText });
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  } else if (scrapeCommand === 'reverse1999banner') {
    // console.log('Starting StarRail Banner API');
    // Define the URL of the MediaWiki API
    const apiUrl = 'https://reverse1999.fandom.com/api.php';

    // Define the parameters for your API request
    const params = {
      action: 'parse', // You can use 'parse' to retrieve page content
      page: 'Reverse:_1999_Wiki', // The page you want to fetch data from
      format: 'json', // You can specify the format as JSON
    };
    try {
      // Construct the API URL with parameters
      const url = `${apiUrl}?${new URLSearchParams(params).toString()}`;
      // Fetch data from the API
      const response = await fetch(url);
      const data = await response.json();

      // Extract the content from the response
      const content = data.parse.text['*'];

      // Parse the HTML content using cheerio
      const $ = cheerio.load(content);

      // Find all <img> elements with the data-src attribute
      const firstTable = $('table').eq(4);
      const imageURLSet = new Set();

      firstTable.find('img').each((index, element) => {
        const imageUrl = $(element).attr('data-src');
        if (imageUrl) {
          if (
            !imageUrl.includes('Stellar') &&
            !imageUrl.includes('Departure')
          ) {
            const newImageUrl = imageUrl.split('.png')[0] + '.png';
            imageURLSet.add(newImageUrl);
          }
        }
      });

      let dateText;
      firstTable.find('.lightbox-caption').each((index, element) => {
        const text = $(element).text();
        if (text.includes('From') && text.includes('to')) {
          const re = new RegExp(String.fromCharCode(160), 'g');
          dateText = text
            .split('(')[0]
            .trim()
            .replace(re, ' ')
            .replace('From ', '')
            .replace('to ', ' - ')
            .replaceAll(',', '');
          return false; // Exit the loop once found
        }
      });

      // Convert the Set back to an array (if needed)
      const imageURLArray = Array.from(imageURLSet);

      res.json({ urls: imageURLArray, date: dateText });
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  } else if (scrapeCommand === 'genshincode') {
    console.log('Starting Genshin Code API');
    // Define the URL of the MediaWiki API
    const apiUrl = 'https://genshin-impact.fandom.com/api.php';

    // Define the parameters for your API request
    const params = {
      action: 'parse', // You can use 'parse' to retrieve page content
      page: 'Promotional_Code', // The page you want to fetch data from
      format: 'json', // You can specify the format as JSON
    };

    try {
      // Construct the API URL with parameters
      const url = `${apiUrl}?${new URLSearchParams(params).toString()}`;

      // Fetch data from the API
      const response = await fetch(url);
      const data = await response.json();

      // Extract the content from the response
      const content = data.parse.text['*'];

      // Parse the HTML content using cheerio
      const $ = cheerio.load(content);

      // Find all <table> elements with the data-src attribute
      const table = $('table').eq(0);

      // Extract table rows from the selected table
      const tableRows = table.find('tr');

      // Create an array to store the table data
      const tableData = [];

      // Iterate over the rows and extract cell data
      tableRows.each((index, element) => {
        const columns = $(element).find('td');

        const codeText = columns.eq(0).find('code').eq(0).text().trim();
        // console.log(codeText);
        if (codeText.length > 0) {
          let validText = '';
          columns
            .eq(3)
            .contents()
            .each(function () {
              if (this.nodeType === 3) {
                // Check if it's a text node
                validText += $(this).text().trim() + '\n';
              }
            });
          // console.log(validText);
          if (!validText.toLowerCase().includes('expired')) {
            const regionText = columns.eq(1).text().trim();

            let rewardText = '';
            columns
              .eq(2)
              .find('span.item-text')
              .each(function () {
                rewardText += $(this).text().trim() + '\n';
              });

            const rowData = {
              code: codeText,
              region: regionText,
              reward: rewardText,
              // valid: validText,
            };

            tableData.push(rowData);
          }
        }
      });

      res.json(tableData);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  } else if (scrapeCommand === 'starrailcode') {
    console.log('Starting StarRail Code API');
    // Define the URL of the MediaWiki API
    const apiUrl = 'https://honkai-star-rail.fandom.com/api.php';

    // Define the parameters for your API request
    const params = {
      action: 'parse', // You can use 'parse' to retrieve page content
      page: 'Redemption_Code', // The page you want to fetch data from
      format: 'json', // You can specify the format as JSON
    };

    try {
      // Construct the API URL with parameters
      const url = `${apiUrl}?${new URLSearchParams(params).toString()}`;

      // Fetch data from the API
      const response = await fetch(url);
      const data = await response.json();

      // Extract the content from the response
      const content = data.parse.text['*'];

      // Parse the HTML content using cheerio
      const $ = cheerio.load(content);

      // Find all <table> elements with the data-src attribute
      const table = $('table').eq(0);

      // Extract table rows from the selected table
      const tableRows = table.find('tr');

      // Create an array to store the table data
      const tableData = [];

      // Iterate over the rows and extract cell data
      tableRows.each((index, element) => {
        const columns = $(element).find('td');

        const codeText = columns.eq(0).find('code').eq(0).text().trim();
        // console.log(codeText);
        if (codeText.length > 0) {
          let validText = '';
          columns
            .eq(3)
            .contents()
            .each(function () {
              if (this.nodeType === 3) {
                // Check if it's a text node
                validText += $(this).text().trim() + '\n';
              }
            });
          // console.log(validText);
          if (!validText.toLowerCase().includes('expired')) {
            const regionText = columns.eq(1).text().trim();

            let rewardText = '';
            columns
              .eq(2)
              .find('span.item-text')
              .each(function () {
                rewardText += $(this).text().trim() + '\n';
              });

            const rowData = {
              code: codeText,
              region: regionText,
              reward: rewardText,
              // valid: validText,
            };

            tableData.push(rowData);
          }
        }
      });

      res.json(tableData);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  } else if (scrapeCommand === 'reverse1999resonancesummary') {
    const characterFind = req.query.characterFind;
    const summary = await prisma.Reverse1999_Resonance.findUnique({
      where: { Character_Resonance: characterFind },
    });
    const resonance = summary.Resonance;
    return res.json(resonance);
  } else {
    return res.status(400).json({ error: 'Invalid request' });
  }
});

app.post('/api/misc-commands', async (req, res) => {
  console.log('Starting Misc Commands API');
  const scrapeCommand = req.query.scrapeCommand;
  if (scrapeCommand === 'reverse1999resonanceupdate') {
    const { character_name, updateData, summaryList } = req.body;
    let summaryList2 = [];
    if (summaryList) {
      summaryList2 = summaryList;
    }

    summaryList2.push(character_name);

    await prisma.Reverse1999_Resonance.update({
      where: { Character_Resonance: 'SummaryList' },
      data: { Resonance: summaryList2 },
    });

    await prisma.Reverse1999_Resonance.upsert({
      where: { Character_Resonance: character_name },
      update: { Resonance: updateData },
      create: { Character_Resonance: character_name, Resonance: updateData },
    });
  } else {
    return res.status(400).json({ error: 'Invalid request' });
  }
});

app.get('/api/starrail-draw-explorer', async (req, res) => {
  // ! not done
  return res.json(await viewFolderList('genshin'));
});

app.get('/api/genshin-draw-explorer', async (req, res) => {
  // * Done
  return res.json(await viewFolderList('genshin'));
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
