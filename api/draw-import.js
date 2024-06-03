require('dotenv').config();
const chromium = require("@sparticuz/chromium");
const puppeteer = require('puppeteer-core');
const { setTimeout } = require('node:timers/promises');
const { MongoClient, ServerApiVersion } = require('mongodb');

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(process.env.MONGODB_URI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
  ssl: true,
  tlsAllowInvalidCertificates: true, // Set to false in production
  tlsAllowInvalidHostnames: true, // Optional, set to true only for testing
});

module.exports = async (req, res) => {
  const game = req.query.game;
  if (!game) {
    return res.status(400).json({ error: 'Invalid request' });
  }

  if (game === 'genshin') {
    // console.log('Starting Genshin Draw Import API');
    try {
      // Connect the client to the server
      await client.connect();
      // Access the database
      const database = client.db('NousIndex');
      let endid = '0';
      let banner = 100;
      const authkey = req.query.authkey;
      const userID = req.query.userID;
      const newDraws = [];
      let loop = true;
      let genshin_uid = '';

      while (loop) {
        const apiUrl =
          'https://hk4e-api-os.hoyoverse.com/gacha_info/api/getGachaLog?authkey_ver=1&sign_type=2&auth_appid=webview_gacha&init_type=' +
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
              // Access the "Genshin_Draw" collection
              const genshinDrawCollection = database.collection('Genshin_Draw');

              // Find the document with the specified DrawID
              const existingItem = await genshinDrawCollection.findOne({
                DrawID: item.id,
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
                    Genshin_UID: String(item.uid),
                    DrawID: String(item.id),
                    DrawTime: dateTime,
                    DrawType: String(item.gacha_type),
                    Item_Name: String(item.name),
                    Rarity: String(item.rank_type),
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

      // Access the "Games_Users" collection
      const gamesUsersCollection = database.collection('Games_Users');

      // Upsert the document with the specified UID
      await gamesUsersCollection.findOneAndUpdate(
        { UID: userID }, // Filter condition
        { $set: { Genshin_UID: genshin_uid } }, // Update operation
        { upsert: true } // Options: upsert if not found, return the updated document
      );

      if (newDraws.length > 0) {
        // Access the "Genshin_Draw" collection
        const genshinDrawCollection = database.collection('Genshin_Draw');

        // Insert multiple documents into the collection
        await genshinDrawCollection.insertMany(newDraws);

        // Calculate the total number of items in newDraws
        const totalItems = newDraws.length;

        // Access the "SummaryTable" collection
        const summaryTableCollection = database.collection('SummaryTable');

        // Upsert the document with the specified Game_UID
        await summaryTableCollection.findOneAndUpdate(
          { Game_UID: `Genshin-${newDraws[0].Genshin_UID}` }, // Filter condition
          {
            $inc: { total_items: totalItems }, // Update operation to increment total_items
          },
          { upsert: true } // Options: upsert if not found, return the updated document
        );

        console.log('Data inserted successfully');
        return res.json({ message: 'newData' });
      } else {
        console.log('No new data');
        return res.json({ message: 'noNewData' });
      }
    } catch (errors) {
      console.error('Fetch error:', errors);
      return res.json({ message: errors });
    } finally {
      await client.close();
    }
  } else if (game === 'starrail') {
    // * should be done
    //console.log('Starting StarRail Draw Import API');
    try {
      // Connect the client to the server
      await client.connect();
      // Access the database
      const database = client.db('NousIndex');
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
              // Access the "StarRail_Draw" collection
              const starRailDrawCollection =
                database.collection('StarRail_Draw');

              // Find the document with the specified DrawID
              const existingItem = await starRailDrawCollection.findOne({
                DrawID: item.id,
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
                    StarRail_UID: String(item.uid),
                    DrawID: String(item.id),
                    DrawTime: dateTime,
                    DrawType: String(item.gacha_type),
                    Item_Name: String(item.name),
                    Rarity: String(item.rank_type),
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

      // Access the "Games_Users" collection
      const gamesUsersCollection = database.collection('Games_Users');

      // Upsert the document with the specified UID
      await gamesUsersCollection.findOneAndUpdate(
        { UID: userID }, // Filter condition
        { $set: { StarRail_UID: starrail_uid } }, // Update operation
        { upsert: true } // Options: upsert if not found, return the updated document
      );

      if (newDraws.length > 0) {
        // Access the "StarRail_Draw" collection
        const starRailDrawCollection = database.collection('StarRail_Draw');

        // Insert multiple documents into the collection
        await starRailDrawCollection.insertMany(newDraws);

        // Calculate the total number of items in newDraws
        const totalItems = newDraws.length;

        // Access the "SummaryTable" collection
        const summaryTableCollection = database.collection('SummaryTable');

        // Upsert the document with the specified Game_UID
        await summaryTableCollection.findOneAndUpdate(
          { Game_UID: `StarRail-${newDraws[0].StarRail_UID}` }, // Filter condition
          {
            $inc: { total_items: totalItems }, // Update operation to increment total_items
          },
          { upsert: true } // Options: upsert if not found, return the updated document
        );

        console.log('Data inserted successfully');
        return res.json({ message: 'newData' });
      } else {
        console.log('No new data');
        return res.json({ message: 'noNewData' });
      }
    } catch (errors) {
      console.error('Fetch error:', errors);
      return res.json({ message: errors });
    } finally {
      await client.close();
    }
  } else if (game === 'wuwa') {
    console.log(req.query.authkey)
    const authkey = decodeURIComponent(req.query.authkey);
    
    const wuwa_id = authkey.match(/player_id=([^&]+)/)[1];
    // * should be done
    //console.log('Starting wuwa Draw Import API');
    try {
      // Connect the client to the server
      await client.connect();
      // Access the database
      const database = client.db('NousIndex');

      async function get_page_items(dropdown, uid) {
        // Wait for any necessary page updates after selecting the item
        await page.evaluate((index) => {
          document
            .querySelectorAll('.app-select-list .app-select-list-label')
            [index].click();
          // Pass wuwaID to the browser's context
        }, dropdown);

        await setTimeout(50);

        // Extract the total number of pages
        const totalPages = await page.evaluate(() => {
          const paginationElement = document.querySelector(
            '.app-table-pagination .pagination-content .content-tatal'
          );
          if (paginationElement) {
            const text = paginationElement.textContent;
            const match = text.match(/\d+/);
            return match ? parseInt(match[0], 10) : null;
          }
          return null;
        });

        // console.log('Total Pages:', totalPages);
        if (totalPages !== null) {
          const pageData = [];
          let duplicateFound = false;
          for (let i = 1; i <= totalPages; i++) {
            // Extract the information you need from the page
            // Wait for all content-x elements to be available
            const contentXElements = await page.$$('.content-x');
            // Extract data from each content-x element
            for (const contentXElement of contentXElements) {
              const extractedData = await contentXElement.evaluate(
                (element, uid) => {
                  const nameElement = element.querySelector(
                    '.content-item p[class*=quality]'
                  );

                  const qualityClasses = Array.from(
                    element.querySelectorAll('.content-item p')
                  )
                    .map((p) =>
                      Array.from(p.classList).find((className) =>
                        className.startsWith('quality')
                      )
                    )
                    .filter(Boolean);

                  const dateElement = element.querySelector(
                    '.content-item:last-child p'
                  );

                  return {
                    drawID:
                      nameElement + dateElement + uid
                        ? nameElement.textContent
                            .replace(/[\s:-]/g, '')
                            .trim() +
                          dateElement.textContent
                            .replace(/[\s:-]/g, '')
                            .trim() +
                          uid
                        : null,
                    quality:
                      qualityClasses.length > 0
                        ? qualityClasses.join(', ')[7]
                        : null,
                    name: nameElement ? nameElement.textContent.trim() : null,
                    date: dateElement ? dateElement.textContent.trim() : null,
                  };
                },
                uid
              );

              // Access the "StarRail_Draw" collection
              const WuwaDrawCollection = database.collection('Wuwa_Draw');

              // Find the document with the specified DrawID
              const existingItem = await WuwaDrawCollection.findOne({
                DrawID: extractedData.drawID,
              });

              if (existingItem) {
                duplicateFound = true;
                break;
              } else {
                // console.log(extractedData.drawID);
                pageData.push(extractedData);
              }
            }

            if (duplicateFound) {
              return pageData;
            } else {
              // Click the button
              await page.click('.arrow-right.default-btn.arrow-right-pc');
              await setTimeout(5);
            }
          }
          return pageData;
        }
      }

      const browser = await puppeteer.launch({
        executablePath: await chromium.executablePath(),
        headless: chromium.headless,
        ignoreHTTPSErrors: true,
        args: chromium.args,
      });
      const page = await browser.newPage();

      // Navigate to the URL
      console.log(authkey);
      await page.goto(authkey);

      await setTimeout(25);

      // Print all the dropdown items
      const dropdownItems = await page.$$eval(
        '.app-select-list .app-select-list-label',
        (items) => {
          return items.map((item, index) => {
            return item.textContent.trim();
          });
        }
      );

      const new_Draws = {};
      let bannerTypeFixer = false;
      for (let i = 0; i < dropdownItems.length; i++) {
        let bannerName = dropdownItems[i];
        if (bannerName.includes('Featured Resonator Convene')) {
          if (bannerTypeFixer) {
            bannerName = 'Featured Weapon Convene';
          } else {
            bannerName = 'Featured Resonator Convene';
            bannerTypeFixer = true;
          }
        }
        console.log(bannerName);
        const data = await get_page_items(i, wuwa_id);
        if (data.length > 0) {
          new_Draws[bannerName] = data;
        }
        // Wait for any necessary page updates after selecting the item
        await setTimeout(20);
      }
      // Close the browser
      await browser.close();

      // Featured Resonator Convene
      // Featured Weapon Convene
      // Standard Resonator Convene
      // Standard Weapon Convene
      // Beginner Convene
      // Beginner's Choice Convene
      // Beginner's Choice Convene（Giveback Custom Convene）

      const userID = req.query.userID;
      const newDraws = [];
      for (const key in new_Draws) {
        // Log the key
        // console.log('Key:', key);

        // Log each element in the array corresponding to the current key
        new_Draws[key].forEach((element) => {
          // console.log('Value:', element);

          // Split the date and time string into its components
          const [datePart, timePart, ampm] = element.date.split(' ');

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
            Wuwa_UID: String(wuwa_id),
            DrawID: String(element.drawID),
            DrawTime: dateTime,
            DrawType: String(key),
            Item_Name: String(element.name),
            Rarity: String(element.quality),
          });
        });
      }

      // Access the "Games_Users" collection
      const gamesUsersCollection = database.collection('Games_Users');

      // Upsert the document with the specified UID
      await gamesUsersCollection.findOneAndUpdate(
        { UID: userID }, // Filter condition
        { $set: { Wuwa_UID: wuwa_id } }, // Update operation
        { upsert: true } // Options: upsert if not found, return the updated document
      );

      if (newDraws.length > 0) {
        // Access the "Wuwa_Draw" collection
        const WuwaDrawCollection = database.collection('Wuwa_Draw');

        // Insert multiple documents into the collection
        await WuwaDrawCollection.insertMany(newDraws);

        // Calculate the total number of items in newDraws
        const totalItems = newDraws.length;

        // Access the "SummaryTable" collection
        const summaryTableCollection = database.collection('SummaryTable');

        // Upsert the document with the specified Game_UID
        await summaryTableCollection.findOneAndUpdate(
          { Game_UID: `Wuwa-${wuwa_id}` }, // Filter condition
          {
            $inc: { total_items: totalItems }, // Update operation to increment total_items
          },
          { upsert: true } // Options: upsert if not found, return the updated document
        );

        console.log('Data inserted successfully');
        return res.json({ message: 'newData' });
      } else {
        console.log('No new data');
        return res.json({ message: 'noNewData' });
      }
    } catch (errors) {
      console.error('Fetch error:', errors);
      return res.json({ message: errors });
    } finally {
      await client.close();
    }
  } else {
    return res.status(400).json({ error: 'Invalid request' });
  }
};
