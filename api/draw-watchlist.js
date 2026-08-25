const { getDb } = require('./_shared/mongo');
const { getAuthenticatedUserId } = require('./_shared/auth');

const GAME_CONFIG = {
  genshin: { watchField: 'Genshin_Watch', summaryPrefix: 'Genshin' },
  starrail: { watchField: 'StarRail_Watch', summaryPrefix: 'StarRail' },
  zzz: { watchField: 'Zzz_Watch', summaryPrefix: 'Zzz' },
  wuwa: { watchField: 'Wuwa_Watch', summaryPrefix: 'Wuwa' },
};

async function handleGet(database, userId, watchField, res) {
  try {
    const gamesUsersCollection = database.collection('Games_Users');
    const data = await gamesUsersCollection.findOne(
      { UID: userId },
      { projection: { [watchField]: true, _id: false } }
    );
    if (!data) {
      // No row yet simply means the user has never saved a watchlist.
      return res.json({ [watchField]: null });
    }
    return res.json(data);
  } catch (error) {
    console.error('Error fetching watchlist:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function handleUpdate(database, userId, body, watchField, res) {
  const watchList = body?.watchList;
  if (!Array.isArray(watchList)) {
    return res.status(400).json({ error: 'Invalid request' });
  }
  try {
    const gamesUsersCollection = database.collection('Games_Users');
    await gamesUsersCollection.updateOne(
      { UID: userId },
      { $set: { [watchField]: JSON.stringify(watchList) } },
      { upsert: true }
    );
    return res.json({ message: 'success' });
  } catch (error) {
    console.error('Error updating watchlist:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function handleExplore(database, summaryPrefix, res) {
  try {
    const sumCollection = database.collection('SummaryTable');
    const result = await sumCollection
      .find(
        { Game_UID: { $regex: `^${summaryPrefix}-` } },
        { projection: { Game_UID: 1, _id: 0 } }
      )
      .toArray();
    const gameUIDs = result.map((doc) =>
      doc.Game_UID.replace(`${summaryPrefix}-`, '')
    );
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
    return res.json(gameUIDs);
  } catch (error) {
    console.error('Error fetching explore list:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = async (req, res) => {
  const { game, command } = req.query;

  const config = GAME_CONFIG[game];
  if (!config) {
    return res.status(400).json({ error: 'Invalid request' });
  }

  if (command !== 'explore' && command !== 'get' && command !== 'update') {
    return res.status(400).json({ error: 'Invalid request' });
  }

  // `get` and `update` both act on the caller's own account, so the account is
  // taken from the verified token rather than from client input. Authenticate
  // before touching the database, so an unauthenticated caller cannot make the
  // function open a connection.
  let userId = null;
  if (command !== 'explore') {
    const auth = await getAuthenticatedUserId(req);
    if (auth.error) {
      return res.status(auth.status).json({ error: auth.error });
    }
    userId = auth.userId;
  }

  try {
    const database = await getDb();

    if (command === 'explore') {
      return handleExplore(database, config.summaryPrefix, res);
    }

    return command === 'get'
      ? handleGet(database, userId, config.watchField, res)
      : handleUpdate(database, userId, req.body, config.watchField, res);
  } catch (error) {
    console.error('Error handling watchlist request:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
