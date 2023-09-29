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

app.get('/api/genshin-draw-import', async (req, res) => {
  try {
    // Beginner Wish = 100, Permanent Wish = 200, Character Event Wish = 301, Weapon Event Wish = 302
    // Object properties: {
    //   uid: '802199629',
    //   gacha_type: '301',
    //   item_id: '',
    //   count: '1',
    //   time: '2023-09-30 03:38:45',
    //   name: 'Harbinger of Dawn',
    //   lang: 'en-us',
    //   item_type: 'Weapon',
    //   rank_type: '3',
    //   id: '1696014360000464729'
    // }

    let endid = '0';
    let banner = 301;
    let authkey = req.query.authkey;

    const apiUrl =
      'https://hk4e-api-os.mihoyo.com/event/gacha_info/api/getGachaLog?authkey_ver=1&sign_type=2&auth_appid=webview_gacha&init_type=' +
      banner +
      '&lang=en&authkey=' +
      authkey +
      '&gacha_type=' +
      banner +
      '&page=1&size=20&end_id=' +
      endid;
    // console.log(apiUrl);
    // Use the built-in fetch to make the request to Mihoyo API
    const response = await fetch(apiUrl);

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    // Parse the response body as JSON
    const responseData = await response.json();
    const itemList = responseData.data.list;
    itemList.forEach((item, index) => {
      console.log(`Item ${index + 1}:`);
      console.log('Object properties:', item);
    });
    
    // Send a response to the client and close the connection
    res.json({ success: true });

  } catch (error) {
    console.error('Fetch error:', error);
    // Handle errors as needed, but you won't send an error response to the client.
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
