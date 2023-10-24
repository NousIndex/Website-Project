const { PrismaClient } = require('@prisma/client');
const { createClient } = require('@supabase/supabase-js');

// Initialize a Supabase client with your Supabase URL and API key
const supabaseUrl = 'https://vtmjuwctzebijssijzhq.supabase.co';
const supabaseKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ0bWp1d2N0emViaWpzc2lqemhxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTY5NjcwOTE3MywiZXhwIjoyMDEyMjg1MTczfQ.wb1hHzf0_D5uaqURxof7VhKF53Bz0jxcwt9vvXkRrFY';
const supabase = createClient(supabaseUrl, supabaseKey);

// Define the name of the bucket you want to read from
const bucketName = 'draw-cache';
const prisma = new PrismaClient();

async function viewFileContent(fileName) {
  try {
    const { data, error } = await supabase.storage
      .from(bucketName)
      .download(fileName);

    if (error) {
      // Handle the error (e.g., file not found)
      console.error('Error reading the file:', error);
      return null; // Return null or an empty array as needed
    }

    const blob = data;
    const fileContent = JSON.parse(await blob.text());

    return fileContent;
  } catch (error) {
    console.error('An error occurred:', error);
    return null; // Handle the error by returning null or an empty array
  }
}

async function modifyAndUploadFileContent(fileContent, fileName) {
  try {
    // Convert the modified data back to JSON
    const modifiedFileContent = JSON.stringify(fileContent);

    // Create a new Blob with the modified JSON data
    const modifiedBlob = new Blob([modifiedFileContent], {
      type: 'application/json',
    });

    // Upload the modified data back to the bucket
    const { uploadError } = await supabase.storage
      .from(bucketName)
      .upload(fileName, modifiedBlob, {
        upsert: true,
      });

    if (uploadError) {
      // Handle the upload error
      console.error('Error uploading the modified file:', uploadError);
    } else {
      console.log('File modified and uploaded successfully.');
    }
  } catch (error) {
    console.error('An error occurred:', error);
  }
}

module.exports = async (req, res) => {
  // console.log('Starting Genshin Draw API');
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
    const fileName = `genshin/Genshin-${genshinUID}.json`;

    if (!genshinUID) {
      return res.status(400).json({ error: 'Invalid request' });
    }

    // Check if the file exists in the bucket
    fileContent = await viewFileContent(fileName);
    if (fileContent) {
      console.log('File exists in bucket');
      try {
        totalJsonDataItems = fileContent.length;
        const summaryTableData = await prisma.SummaryTable.findUnique({
          where: {
            Game_UID: `Genshin-${genshinUID}`,
          },
        });
        if (summaryTableData.total_items === totalJsonDataItems) {
          console.log('Data is up to date');
          return res.json(fileContent);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        return res.status(500).json({ error: 'Internal server error' });
      }
    } else {
      console.log('File does not exist in bucket');
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
      if (combinedDraws.length === 0) {
        return res.status(400).json({ message: 'No Data' });
      } else {
        await modifyAndUploadFileContent(combinedDraws, fileName);
      }
      return res.json(combinedDraws);
    } catch (error) {
      console.error('Error fetching data:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  } else if (game === 'starrail') {
    // * Should be done
    // console.log('Starting StarRail Draw API');
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
    const fileName = `starrail/StarRail-${starrailUID}.json`;

    if (!starrailUID) {
      return res.status(400).json({ error: 'Invalid request' });
    }

    // Check if the file exists in the bucket
    fileContent = await viewFileContent(fileName);
    if (fileContent) {
      console.log('File exists in bucket');
      try {
        totalJsonDataItems = fileContent.length;
        const summaryTableData = await prisma.SummaryTable.findUnique({
          where: {
            Game_UID: `StarRail-${starrailUID}`,
          },
        });
        if (summaryTableData.total_items === totalJsonDataItems) {
          console.log('Data is up to date');
          return res.json(fileContent);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        return res.status(500).json({ error: 'Internal server error' });
      }
    } else {
      console.log('File does not exist in bucket');
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
        return res.status(400).json({ message: 'No Data' });
      } else {
        await modifyAndUploadFileContent(combinedDraws, fileName);
      }
      return res.json(combinedDraws);
    } catch (error) {
      console.error('Error fetching data:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
};
