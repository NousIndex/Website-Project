const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const prisma = new PrismaClient();

module.exports = async (req, res) => {
  console.log('Starting Genshin Draw API');
  const { userGameId } = req.query;
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
  const filePath = `../cache/draw_cache/genshin/Genshin-${genshinUID}.json`;
  console.log('__filename:', __filename);
  console.log('__dirname:', __dirname);

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
          item.rarity5Pity = 0;
          if (rarity4Pity === 11) {
            rarity4Pity = 10;
          }
          if (rarity4Pity > 10) {
            console.log(item.DrawID, rarity4Pity);
          }
          item.rarity4Pity = rarity4Pity;
          rarity4Pity = 0;
        } else if (item.Rarity === '5') {
          item.rarity4Pity = 0;
          item.rarity5Pity = rarity5Pity;
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
};
