const { getDb } = require('./_shared/mongo');

const GAME_CONFIG = {
  genshin: { watchField: 'Genshin_Watch', summaryPrefix: 'Genshin' },
  starrail: { watchField: 'StarRail_Watch', summaryPrefix: 'StarRail' },
  zzz: { watchField: 'Zzz_Watch', summaryPrefix: 'Zzz' },
  wuwa: { watchField: 'Wuwa_Watch', summaryPrefix: 'Wuwa' },
};

async function handleGet(database, userGameId, watchField, res) {
  if (!userGameId) {
    return res.status(400).json({ error: 'Invalid request' });
  }
  try {
    const gamesUsersCollection = database.collection('Games_Users');
    const data = await gamesUsersCollection.findOne(
      { UID: userGameId },
      { projection: { [watchField]: true, _id: false } }
    );
    if (!data) {
      return res.status(400).json({ error: 'Invalid request' });
    }
    return res.json(data);
  } catch (error) {
    console.error('Error fetching data:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function handleUpdate(database, body, watchField, res) {
  const { userGameId, watchList } = body;
  if (!userGameId || !watchList) {
    return res.status(400).json({ error: 'Invalid request' });
  }
  try {
    const gamesUsersCollection = database.collection('Games_Users');
    const data = await gamesUsersCollection.updateOne(
      { UID: userGameId },
      { $set: { [watchField]: JSON.stringify(watchList) } }
    );
    if (!data) {
      return res.status(400).json({ error: 'Invalid request' });
    }
    return res.json({ message: 'success' });
  } catch (error) {
    console.error('Error fetching data:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function handleExplore(database, userGameId, summaryPrefix, res) {
  if (!userGameId) {
    return res.status(400).json({ error: 'Invalid request' });
  }
  try {
    const sumCollection = database.collection('SummaryTable');
    const result = await sumCollection
      .find(
        { Game_UID: { $regex: summaryPrefix } },
        { projection: { Game_UID: 1, _id: 0 } }
      )
      .toArray();
    const gameUIDs = result.map((doc) =>
      doc.Game_UID.replace(`${summaryPrefix}-`, '')
    );
    if (!gameUIDs) {
      return res.status(400).json({ error: 'Invalid request' });
    }
    return res.json(gameUIDs);
  } catch (error) {
    console.error('Error fetching data:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = async (req, res) => {
  const game = req.query.game;
  const command = req.query.command;

  if (!game) {
    return res.status(400).json({ error: 'Invalid request' });
  }

  const config = GAME_CONFIG[game];
  if (!config) {
    return res.status(400).json({ error: 'Invalid request' });
  }

  const database = await getDb();

  if (command === 'get') {
    return handleGet(database, req.query.userGameId, config.watchField, res);
  }
  if (command === 'update') {
    return handleUpdate(database, req.body, config.watchField, res);
  }
  if (command === 'explore') {
    return handleExplore(
      database,
      req.query.userGameId,
      config.summaryPrefix,
      res
    );
  }
};
