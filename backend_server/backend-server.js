const express = require('express');
const { PrismaClient } = require('@prisma/client');
const cors = require('cors');

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

app.get('/api/apiusage', async (req, res) => {
  try {
    const data = await prisma.aPI_Usage.findMany();
    //console.log('Data:', data);
    res.json(data);
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/genshin-draw', async (req, res) => {
  const { userGameId } = req.query;

  if (!userGameId) {
    return res.status(400).json({ error: 'Invalid request' });
  }

  try {
    // Use Prisma to query the Genshin_Draw table based on Genshin_UID
    const data = await prisma.Genshin_Draw.findMany({
      where: {
        Genshin_UID: userGameId,
      },
      orderBy: {
        Wish_Index: 'desc',
      },
    });

    res.json(data);
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
