require('dotenv').config();
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
  const command = req.query.command;
  if (!game) {
    return res.status(400).json({ error: 'Invalid request' });
  }
  if (game === 'genshin') {
    try {
      // Connect the client to the server
      await client.connect();
      // Access the database
      const database = client.db('NousIndex');
      if (command === 'get') {
        // console.log('Starting Genshin Draw Watchlist Get API');
        const userGameId = req.query.userGameId;
        if (!userGameId) {
          return res.status(400).json({ error: 'Invalid request' });
        }
        try {
          // Access the "Games_Users" collection
          const gamesUsersCollection = database.collection('Games_Users');

          // Find the document with the specified UID and select the Genshin_Watch field
          const data = await gamesUsersCollection.findOne(
            { UID: userGameId }, // Filter condition
            {
              projection: {
                // Select specific fields to return
                Genshin_Watch: true,
                _id: false, // Exclude _id field from the result
              },
            }
          );
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
          // Access the "Games_Users" collection
          const gamesUsersCollection = database.collection('Games_Users');

          // Update the document with the specified UID
          const data = await gamesUsersCollection.updateOne(
            { UID: userGameId }, // Filter condition
            { $set: { Genshin_Watch: JSON.stringify(watchList) } } // Update operation
          );
          if (!data) {
            return res.status(400).json({ error: 'Invalid request' });
          }
          return res.json({ message: 'success' });
        } catch (error) {
          console.error('Error fetching data:', error);
          return res.status(500).json({ error: 'Internal server error' });
        }
      } else if (command === 'explore') {
        // console.log('Starting Genshin Draw Watchlist Update API');
        const userGameId = req.query.userGameId;
        if (!userGameId) {
          return res.status(400).json({ error: 'Invalid request' });
        }
        try {
          // Access the "Games_Users" collection
          const sumCollection = database.collection('SummaryTable');
          const result = await sumCollection
            .find(
              { Game_UID: { $regex: 'Genshin' } },
              { projection: { Game_UID: 1, _id: 0 } }
            )
            .toArray();
            // Map the result to get an array of Game_UID values
            const gameUIDs = result.map((doc) => doc.Game_UID.replace('Genshin-', ''));
          if (!gameUIDs) {
            return res.status(400).json({ error: 'Invalid request' });
          }
          return res.json(gameUIDs);
        } catch (error) {
          console.error('Error fetching data:', error);
          return res.status(500).json({ error: 'Internal server error' });
        }
      }
    } finally {
      await client.close();
    }
  } else if (game === 'starrail') {
    try {
      // Connect the client to the server
      await client.connect();
      // Access the database
      const database = client.db('NousIndex');
      if (command === 'get') {
        // console.log('Starting Genshin Draw Watchlist Get API');
        const userGameId = req.query.userGameId;
        if (!userGameId) {
          return res.status(400).json({ error: 'Invalid request' });
        }
        try {
          // Access the "Games_Users" collection
          const gamesUsersCollection = database.collection('Games_Users');

          // Find the document with the specified UID and select the StarRail_Watch field
          const data = await gamesUsersCollection.findOne(
            { UID: userGameId }, // Filter condition
            {
              projection: {
                // Select specific fields to return
                StarRail_Watch: true,
                _id: false, // Exclude _id field from the result
              },
            }
          );
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
          // Access the "Games_Users" collection
          const gamesUsersCollection = database.collection('Games_Users');

          // Update the document with the specified UID
          const data = await gamesUsersCollection.updateOne(
            { UID: userGameId }, // Filter condition
            { $set: { StarRail_Watch: JSON.stringify(watchList) } } // Update operation
          );
          if (!data) {
            return res.status(400).json({ error: 'Invalid request' });
          }
          return res.json({ message: 'success' });
        } catch (error) {
          console.error('Error fetching data:', error);
          return res.status(500).json({ error: 'Internal server error' });
        }
      } else if (command === 'explore') {
        // console.log('Starting Genshin Draw Watchlist Update API');
        const userGameId = req.query.userGameId;
        if (!userGameId) {
          return res.status(400).json({ error: 'Invalid request' });
        }
        try {
          // Access the "Games_Users" collection
          const sumCollection = database.collection('SummaryTable');
          const result = await sumCollection
            .find(
              { Game_UID: { $regex: 'StarRail' } },
              { projection: { Game_UID: 1, _id: 0 } }
            )
            .toArray();
          // Map the result to get an array of Game_UID values
            const gameUIDs = result.map((doc) => doc.Game_UID.replace('StarRail-', ''));
          if (!gameUIDs) {
            return res.status(400).json({ error: 'Invalid request' });
          }
          return res.json(gameUIDs);
        } catch (error) {
          console.error('Error fetching data:', error);
          return res.status(500).json({ error: 'Internal server error' });
        }
      }
    } finally {
      await client.close();
    }
  } else if (game === 'wuwa') {
    try {
      // Connect the client to the server
      await client.connect();
      // Access the database
      const database = client.db('NousIndex');
      if (command === 'get') {
        // console.log('Starting Genshin Draw Watchlist Get API');
        const userGameId = req.query.userGameId;
        if (!userGameId) {
          return res.status(400).json({ error: 'Invalid request' });
        }
        try {
          // Access the "Games_Users" collection
          const gamesUsersCollection = database.collection('Games_Users');

          const data = await gamesUsersCollection.findOne(
            { UID: userGameId }, // Filter condition
            {
              projection: {
                // Select specific fields to return
                Wuwa_Watch: true,
                _id: false, // Exclude _id field from the result
              },
            }
          );
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
          // Access the "Games_Users" collection
          const gamesUsersCollection = database.collection('Games_Users');

          // Update the document with the specified UID
          const data = await gamesUsersCollection.updateOne(
            { UID: userGameId }, // Filter condition
            { $set: { Wuwa_Watch: JSON.stringify(watchList) } } // Update operation
          );
          if (!data) {
            return res.status(400).json({ error: 'Invalid request' });
          }
          return res.json({ message: 'success' });
        } catch (error) {
          console.error('Error fetching data:', error);
          return res.status(500).json({ error: 'Internal server error' });
        }
      } else if (command === 'explore') {
        // console.log('Starting Genshin Draw Watchlist Update API');
        const userGameId = req.query.userGameId;
        if (!userGameId) {
          return res.status(400).json({ error: 'Invalid request' });
        }
        try {
          // Access the "Games_Users" collection
          const sumCollection = database.collection('SummaryTable');
          const result = await sumCollection
            .find(
              { Game_UID: { $regex: 'Wuwa' } },
              { projection: { Game_UID: 1, _id: 0 } }
            )
            .toArray();
          // Map the result to get an array of Game_UID values
            const gameUIDs = result.map((doc) => doc.Game_UID.replace('Wuwa-', ''));
          if (!gameUIDs) {
            return res.status(400).json({ error: 'Invalid request' });
          }
          return res.json(gameUIDs);
        } catch (error) {
          console.error('Error fetching data:', error);
          return res.status(500).json({ error: 'Internal server error' });
        }
      }
    } finally {
      await client.close();
    }
  } else {
    return res.status(400).json({ error: 'Invalid request' });
  }
};
