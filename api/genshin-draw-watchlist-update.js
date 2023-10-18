const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

module.exports = async (req, res) => {
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
    return res.json({message: 'success'});
  } catch (error) {
    console.error('Error fetching data:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};