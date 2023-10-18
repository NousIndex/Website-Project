const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

module.exports = async (req, res) => {
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
            console.error(`Error checking item with DrawID ${item.id}:`, error);
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
};
