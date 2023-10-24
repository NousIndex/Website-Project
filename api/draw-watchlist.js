const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

module.exports = async (req, res) => {
  const game = req.query.game;
  const command = req.query.command;
  if (!game) {
    return res.status(400).json({ error: 'Invalid request' });
  }
  if (game === 'genshin') {
    if (command === 'get') {
      // console.log('Starting Genshin Draw Watchlist Get API');
      const userGameId = req.query.userGameId;
      if (!userGameId) {
        return res.status(400).json({ error: 'Invalid request' });
      }
      try {
        const data = await prisma.Games_Users.findUnique({
          where: {
            UID: userGameId,
          },
          select: {
            Genshin_Watch: true,
          },
        });
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
        const data = await prisma.Games_Users.update({
          where: {
            UID: userGameId,
          },
          data: {
            Genshin_Watch: watchList,
          },
        });
        if (!data) {
          return res.status(400).json({ error: 'Invalid request' });
        }
        return res.json({ message: 'success' });
      } catch (error) {
        console.error('Error fetching data:', error);
        return res.status(500).json({ error: 'Internal server error' });
      }
    }
  } else if (game === 'starrail') {
    if (command === 'get') {
      // console.log('Starting Genshin Draw Watchlist Get API');
      const userGameId = req.query.userGameId;
      if (!userGameId) {
        return res.status(400).json({ error: 'Invalid request' });
      }
      try {
        const data = await prisma.Games_Users.findUnique({
          where: {
            UID: userGameId,
          },
          select: {
            StarRail_Watch: true,
          },
        });
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
        const data = await prisma.Games_Users.update({
          where: {
            UID: userGameId,
          },
          data: {
            StarRail_Watch: watchList,
          },
        });
        if (!data) {
          return res.status(400).json({ error: 'Invalid request' });
        }
        return res.json({ message: 'success' });
      } catch (error) {
        console.error('Error fetching data:', error);
        return res.status(500).json({ error: 'Internal server error' });
      }
    }
  }
};
