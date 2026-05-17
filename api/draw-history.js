const { getDb } = require('./_shared/mongo');
const {
  viewFileContent,
  modifyAndUploadFileContent,
  pingStorage,
} = require('./_shared/supabase');
const { fetchAndProcessDraws } = require('./_shared/drawHistory');

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

async function resolveGameUid(database, userGameId, uidField) {
  if (userGameId.length <= 12) return userGameId;
  const gamesUsersCollection = database.collection('Games_Users');
  const dataUser = await gamesUsersCollection.findOne({ UID: userGameId });
  if (!dataUser) return null;
  return dataUser[uidField];
}

async function handleDrawHistory(req, res, config) {
  try {
    const database = await getDb();

    const userGameId = req.query.userGameId;
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
      console.log('File exists in bucket');
      try {
        const summaryTableCollection = database.collection('SummaryTable');
        const summaryTableData = await summaryTableCollection.findOne({
          Game_UID: `${config.summaryPrefix}-${uid}`,
        });

        if (summaryTableData.total_items === fileContent.length) {
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

    console.log('Fetching data from database');
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
        return res.status(400).json({ message: 'No Data' });
      }

      await modifyAndUploadFileContent(combinedDraws, fileName);
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
    console.log('Keep-ALIVE');
    return res.status(200).json({ message: 'alive' });
  } catch (error) {
    console.error('Error fetching data:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
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

  return handleDrawHistory(req, res, config);
};
