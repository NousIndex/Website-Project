import axios from 'axios';
import cheerio from 'cheerio';

(async () => {
  // * should be done
  //console.log('Starting ZZZ Draw Import API');
  try {
    // Connect the client to the server
    await client.connect();
    // Access the database
    const database = client.db('NousIndex');
    let endid = '0';
    // 2001 Agent banner
    // 3001 W-Engine banner
    // 1001 Standard banner
    // 5001 Bangboo banner
    let banner = 2001;
    const authkey = req.query.authkey;
    const userID = req.query.userID;
    const newDraws = [];
    let loop = true;
    let zzz_uid = '';

    while (loop) {
      const apiUrl =
        'https://public-operation-nap-sg.hoyoverse.com/common/gacha_record/api/getGachaLog?authkey_ver=1&sign_type=2&auth_appid=webview_gacha&default_gacha_type=' +
        banner +
        '&lang=en&authkey=' +
        authkey +
        '&game_biz=nap_global&gacha_type=' +
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
        console.log('Too Fast');
        await setTimeout(75);
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
            zzz_uid = item.uid;
            // Access the "ZZZ_Draw" collection
            const zzzDrawCollection = database.collection('Zzz_Draw');

            // Find the document with the specified DrawID
            const existingItem = await zzzDrawCollection.findOne({
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
              // 2001 Agent banner
              // 3001 W-Engine banner
              // 1001 Standard banner
              // 5001 Bangboo banner
              switch (item.gacha_type) {
                case '2001':
                  item.gacha_type = 'Agent Search';
                  break;
                case '1001':
                  item.gacha_type = 'Standard Search';
                  break;
                case '3001':
                  item.gacha_type = 'W-Engine Search';
                  break;
                case '5001':
                  item.gacha_type = 'Bangboo Search';
                  break;
                default:
                  item.gacha_type = 'Unknown';
                  break;
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
                  Zzz_UID: String(item.uid),
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
            console.error(`Error checking item with DrawID ${item.id}:`, error);
          }
        }
        endid = itemList[itemList.length - 1].id;
        if (duplicateFound) {
          // 2001 Agent banner
          // 3001 W-Engine banner
          // 1001 Standard banner
          // 5001 Bangboo banner
          if (banner === 2001) {
            banner = 3001;
            endid = '0';
          } else if (banner === 3001) {
            banner = 5001;
            endid = '0';
            // } else if (banner === 400) {
            //   banner = 302;
            //   endid = '0';
          } else if (banner === 5001) {
            banner = 1001;
            endid = '0';
          } else {
            loop = false;
          }
        }
      } else {
        if (banner === 2001) {
          // get uid
          banner = 3001;
          endid = '0';
        } else if (banner === 3001) {
          banner = 5001;
          endid = '0';
          // } else if (banner === 400) {
          //   banner = 302;
          //   endid = '0';
        } else if (banner === 5001) {
          banner = 1001;
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
      { $set: { Zzz_UID: zzz_uid } }, // Update operation
      { upsert: true } // Options: upsert if not found, return the updated document
    );

    if (newDraws.length > 0) {
      // Access the "StarRail_Draw" collection
      const zzzDrawCollection = database.collection('Zzz_Draw');

      // Insert multiple documents into the collection
      await zzzDrawCollection.insertMany(newDraws);

      // Calculate the total number of items in newDraws
      const totalItems = newDraws.length;

      // Access the "SummaryTable" collection
      const summaryTableCollection = database.collection('SummaryTable');

      // Upsert the document with the specified Game_UID
      await summaryTableCollection.findOneAndUpdate(
        { Game_UID: `Zzz-${newDraws[0].Zzz_UID}` }, // Filter condition
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
})();
