const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

module.exports = async (req, res) => {
  console.log('Starting Genshin Draw Watchlist Get API');
  const { userGameId } = req.query;
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
};
    