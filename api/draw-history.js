require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const { MongoClient, ServerApiVersion } = require('mongodb');

// Initialize a Supabase client with your Supabase URL and API key
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// Define the name of the bucket you want to read from
const bucketName = 'draw-cache';

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
    try {
      let genshinUID = '';
      // Connect the client to the server
      await client.connect();
      // Access the database
      const database = client.db('NousIndex');
      if (!userGameId) {
        return res.status(400).json({ error: 'Invalid request' });
      }
      if (userGameId.length > 12) {
        // Access the "Games_Users" collection
        const gamesUsersCollection = database.collection('Games_Users');
        // Find the document with the specified UID
        const dataUser = await gamesUsersCollection.findOne({
          UID: userGameId,
        });
        // console.log(dataUser);

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

          // Access the "SummaryTable" collection
          const summaryTableCollection = database.collection('SummaryTable');

          // Find the document with the specified Game_UID
          const summaryTableData = await summaryTableCollection.findOne({
            Game_UID: `Genshin-${genshinUID}`,
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
        // Access the "Genshin_Draw" collection
        const genshinDrawCollection = database.collection('Genshin_Draw');

        // Find documents with the specified Genshin_UID, sort them by DrawTime in descending order, and select specific fields
        const data = await genshinDrawCollection
          .find(
            { Genshin_UID: genshinUID }, // Filter condition
            {
              projection: {
                // Select specific fields to return
                DrawID: true,
                DrawTime: true,
                Item_Name: true,
                DrawType: true,
                Rarity: true,
                _id: false, // Exclude _id field from the result
              },
              sort: { DrawTime: -1 }, // Sort by DrawTime in descending order
            }
          )
          .toArray();

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
    } finally {
      // Ensures that the client will close when you finish/error
      await client.close();
    }
  } else if (game === 'starrail') {
    try {
      // Connect the client to the server
      await client.connect();
      // Access the database
      const database = client.db('NousIndex');
      // * Should be done
      // console.log('Starting StarRail Draw API');
      const { userGameId } = req.query;
      let starrailUID = '';
      if (!userGameId) {
        return res.status(400).json({ error: 'Invalid request' });
      }
      if (userGameId.length > 12) {
        // Access the "Games_Users" collection
        const gamesUsersCollection = database.collection('Games_Users');
        // Find the document with the specified UID
        const dataUser = await gamesUsersCollection.findOne({
          UID: userGameId,
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
          // Access the "SummaryTable" collection
          const summaryTableCollection = database.collection('SummaryTable');

          // Find the document with the specified Game_UID
          const summaryTableData = await summaryTableCollection.findOne({
            Game_UID: `StarRail-${starrailUID}`,
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
        // Access the "StarRail_Draw" collection
        const starrailDrawCollection = database.collection('StarRail_Draw');

        // Find documents with the specified StarRail_UID, sort them by DrawTime in descending order, and select specific fields
        const data = await starrailDrawCollection
          .find(
            { StarRail_UID: starrailUID }, // Filter condition
            {
              projection: {
                // Select specific fields to return
                DrawID: true,
                DrawTime: true,
                Item_Name: true,
                DrawType: true,
                Rarity: true,
                _id: false, // Exclude _id field from the result
              },
              sort: { DrawTime: -1 }, // Sort by DrawTime in descending order
            }
          )
          .toArray();

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
    } finally {
      // Ensures that the client will close when you finish/error
      await client.close();
    }
  }  else if (game === 'wuwa') {
    try {
      // Connect the client to the server
      await client.connect();
      // Access the database
      const database = client.db('NousIndex');
      // * Should be done
      // console.log('Starting StarRail Draw API');
      const { userGameId } = req.query;
      let wuwaUID = '';
      if (!userGameId) {
        return res.status(400).json({ error: 'Invalid request' });
      }
      if (userGameId.length > 12) {
        // Access the "Games_Users" collection
        const gamesUsersCollection = database.collection('Games_Users');
        // Find the document with the specified UID
        const dataUser = await gamesUsersCollection.findOne({
          UID: userGameId,
        });
        if (!dataUser) {
          return res.status(400).json({ error: 'Invalid request' });
        }
        wuwaUID = dataUser.Wuwa_UID;
      } else {
        wuwaUID = userGameId;
      }
      const fileName = `starrail/StarRail-${wuwaUID}.json`;

      if (!wuwaUID) {
        return res.status(400).json({ error: 'Invalid request' });
      }

      // Check if the file exists in the bucket
      fileContent = await viewFileContent(fileName);
      if (fileContent) {
        console.log('File exists in bucket');
        try {
          totalJsonDataItems = fileContent.length;
          // Access the "SummaryTable" collection
          const summaryTableCollection = database.collection('SummaryTable');

          // Find the document with the specified Game_UID
          const summaryTableData = await summaryTableCollection.findOne({
            Game_UID: `Wuwa-${wuwaUID}`,
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
        // Access the "StarRail_Draw" collection
        const wuwaDrawCollection = database.collection('Wuwa_Draw');

        // Find documents with the specified StarRail_UID, sort them by DrawTime in descending order, and select specific fields
        const data = await wuwaDrawCollection
          .find(
            { Wuwa_UID: wuwaUID }, // Filter condition
            {
              projection: {
                // Select specific fields to return
                DrawID: true,
                DrawTime: true,
                Item_Name: true,
                DrawType: true,
                Rarity: true,
                _id: false, // Exclude _id field from the result
              },
              sort: { DrawTime: -1 }, // Sort by DrawTime in descending order
            }
          )
          .toArray();

        if (!data) {
          return res.status(400).json({ error: 'Invalid request' });
        }

        // Sort the data by DrawTime and DrawID in descending order
        const sortedData = data.sort((a, b) => {
          // Compare DrawTime first (descending order)
          const timeComparison = b.DrawTime.getTime() - a.DrawTime.getTime();

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
    } finally {
      // Ensures that the client will close when you finish/error
      await client.close();
    }
  } else {
    return res.status(400).json({ error: 'Invalid request' });
  }
};
