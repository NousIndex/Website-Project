const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

module.exports = async (req, res) => {
  console.log('Starting Genshin Draw Import API');
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
};