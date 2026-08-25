const { getDb } = require('./_shared/mongo');
const {
  viewFileContent,
  modifyAndUploadFileContent,
  pingStorage,
} = require('./_shared/supabase');
const { fetchAndProcessDraws } = require('./_shared/drawHistory');
const { enforceRateLimit } = require('./_shared/rateLimit');

const GAME_CONFIG = {
  genshin: {
    uidField: 'Genshin_UID',
    summaryPrefix: 'Genshin',
    cacheDir: 'genshin',
    cachePrefix: 'Genshin',
    collection: 'Genshin_Draw',
    bannerStripPrefix: 'Character Event Wish - ',
    bannerBaseName: 'Character Event Wish',
    zeroOnFour: true,
    zeroOnOther: true,
    drawIdTiebreak: true,
  },
  starrail: {
    uidField: 'StarRail_UID',
    summaryPrefix: 'StarRail',
    cacheDir: 'starrail',
    cachePrefix: 'StarRail',
    collection: 'StarRail_Draw',
    bannerStripPrefix: 'Character Warp - ',
    bannerBaseName: 'Character Warp',
    zeroOnFour: false,
    zeroOnOther: false,
    drawIdTiebreak: true,
  },
  zzz: {
    uidField: 'Zzz_UID',
    summaryPrefix: 'Zzz',
    cacheDir: 'zzz',
    cachePrefix: 'Zzz',
    collection: 'Zzz_Draw',
    bannerStripPrefix: 'Character Warp - ',
    bannerBaseName: 'Character Warp',
    zeroOnFour: false,
    zeroOnOther: false,
    drawIdTiebreak: true,
  },
  wuwa: {
    uidField: 'Wuwa_UID',
    summaryPrefix: 'Wuwa',
    cacheDir: 'wuwa',
    cachePrefix: 'Wuwa',
    collection: 'Wuwa_Draw',
    bannerStripPrefix: null,
    bannerBaseName: null,
    zeroOnFour: false,
    zeroOnOther: false,
    drawIdTiebreak: false,
  },
};

// Supabase user ids are UUIDs (36 chars); in-game UIDs are short numeric
// strings, so anything that looks like a UUID is resolved through Games_Users.
const SUPABASE_UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function resolveGameUid(database, userGameId, uidField) {
  if (!SUPABASE_UUID_PATTERN.test(userGameId)) return userGameId;
  const gamesUsersCollection = database.collection('Games_Users');
  const dataUser = await gamesUsersCollection.findOne({ UID: userGameId });
  if (!dataUser) return null;
  return dataUser[uidField];
}

async function handleDrawHistory(req, res, config) {
  try {
    const database = await getDb();

    const userGameId = String(req.query.userGameId || '');
    if (!userGameId) {
      return res.status(400).json({ error: 'Invalid request' });
    }

    const uid = await resolveGameUid(database, userGameId, config.uidField);
    if (!uid) {
      return res.status(400).json({ error: 'Invalid request' });
    }

    const fileName = `${config.cacheDir}/${config.cachePrefix}-${uid}.json`;
    const fileContent = await viewFileContent(fileName);

    if (fileContent) {
      try {
        const summaryTableCollection = database.collection('SummaryTable');
        const summaryTableData = await summaryTableCollection.findOne({
          Game_UID: `${config.summaryPrefix}-${uid}`,
        });

        // A missing summary row is not an error -- it just means the cached
        // file cannot be verified, so fall through and rebuild it below.
        if (summaryTableData?.total_items === fileContent.length) {
          res.setHeader('Cache-Control', 'private, no-store');
          return res.json(fileContent);
        }
      } catch (error) {
        console.error('Error checking cache freshness:', error);
      }
    }

    try {
      const combinedDraws = await fetchAndProcessDraws({
        database,
        collectionName: config.collection,
        drawUidField: config.uidField,
        uid,
        bannerStripPrefix: config.bannerStripPrefix,
        bannerBaseName: config.bannerBaseName,
        zeroOnFour: config.zeroOnFour,
        zeroOnOther: config.zeroOnOther,
        drawIdTiebreak: config.drawIdTiebreak,
      });

      if (combinedDraws === null) {
        return res.status(400).json({ error: 'Invalid request' });
      }

      if (combinedDraws.length === 0) {
        return res.status(404).json({ message: 'No Data' });
      }

      await modifyAndUploadFileContent(combinedDraws, fileName);
      res.setHeader('Cache-Control', 'private, no-store');
      return res.json(combinedDraws);
    } catch (error) {
      console.error('Error fetching data:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  } catch (error) {
    console.error('Error fetching data:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function handleKeepAlive(req, res) {
  try {
    await pingStorage();
    return res.status(200).json({ message: 'alive' });
  } catch (error) {
    console.error('Error fetching data:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * This endpoint is public (browsing another player's UID is a feature) and a
 * cache miss rebuilds the whole history and re-uploads it, so it is capped per
 * client. A tracker page load makes one call; the cap is far above that.
 */
const HISTORY_LIMIT = { limit: 60, windowMs: 60 * 1000 };

function clientKey(req) {
  const forwarded = req.headers['x-forwarded-for'];
  const ip = Array.isArray(forwarded)
    ? forwarded[0]
    : (forwarded || '').split(',')[0].trim();
  return ip || req.socket?.remoteAddress || 'unknown';
}

module.exports = async (req, res) => {
  const game = req.query.game;

  if (game === 'keepalive') {
    return handleKeepAlive(req, res);
  }

  const config = GAME_CONFIG[game];
  if (!config) {
    return res.status(400).json({ error: 'Invalid request' });
  }

  if (!(await enforceRateLimit(res, `history:${clientKey(req)}`, HISTORY_LIMIT))) {
    return undefined;
  }

  return handleDrawHistory(req, res, config);
};
