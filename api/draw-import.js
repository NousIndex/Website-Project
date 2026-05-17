const { setTimeout } = require('node:timers/promises');
const { getDb } = require('./_shared/mongo');
const { parseGachaTime } = require('./_shared/parseTime');

const GENSHIN_TYPES = {
  100: 'Beginner Wish',
  200: 'Permanent Wish',
  301: 'Character Event Wish',
  400: 'Character Event Wish - 2',
  302: 'Weapon Event Wish',
  500: 'Chronicled Wish',
};

const STARRAIL_TYPES = {
  2: 'Departure Warp',
  1: 'Standard Warp',
  11: 'Character Warp',
  12: 'Light Cone Warp',
  21: 'Character Collaboration Warp',
  22: 'Light Cone Collaboration Warp',
};

const ZZZ_TYPES = {
  2: 'Agent Search',
  1: 'Standard Search',
  3: 'W-Engine Search',
  5: 'Bangboo Search',
  102: 'Exclusive Rescreening',
  103: 'W-Engine Reverberation',
};

const HOYO_CONFIGS = {
  genshin: {
    bannerSequence: [100, 301, 400, 302, 500, 200],
    uidField: 'Genshin_UID',
    collection: 'Genshin_Draw',
    summaryPrefix: 'Genshin',
    retryDelay: 100,
    logOnRetry: false,
    buildUrl: (banner, authkey, endid) =>
      `https://public-operation-hk4e-sg.hoyoverse.com/gacha_info/api/getGachaLog?authkey_ver=1&sign_type=2&auth_appid=webview_gacha&init_type=${banner}&lang=en&authkey=${authkey}&gacha_type=${banner}&page=1&size=20&end_id=${endid}`,
    transformItem(item) {
      item.gacha_type = GENSHIN_TYPES[item.gacha_type] || 'Unknown';
    },
  },
  starrail: {
    bannerSequence: [2, 11, 12, 21, 22, 1],
    uidField: 'StarRail_UID',
    collection: 'StarRail_Draw',
    summaryPrefix: 'StarRail',
    retryDelay: 100,
    logOnRetry: false,
    buildUrl: (banner, authkey, endid) =>
      `https://public-operation-hkrpg-sg.hoyoverse.com/common/gacha_record/api/getGachaLog?authkey_ver=1&sign_type=2&auth_appid=webview_gacha&default_gacha_type=${banner}&lang=en&authkey=${authkey}&game_biz=hkrpg_global&gacha_type=${banner}&page=1&size=20&end_id=${endid}`,
    transformItem(item) {
      item.gacha_type = STARRAIL_TYPES[item.gacha_type] || 'Unknown';
    },
  },
  zzz: {
    bannerSequence: [2001, 3001, 102001, 103001, 5001, 1001],
    uidField: 'Zzz_UID',
    collection: 'Zzz_Draw',
    summaryPrefix: 'Zzz',
    retryDelay: 75,
    logOnRetry: true,
    buildUrl: (banner, authkey, endid) =>
      `https://public-operation-nap-sg.hoyoverse.com/common/gacha_record/api/getGachaLog?authkey_ver=1&sign_type=2&auth_appid=webview_gacha&default_gacha_type=${banner}&lang=en&authkey=${authkey}&game_biz=nap_global&gacha_type=${banner}&page=1&size=20&end_id=${endid}`,
    transformItem(item) {
      item.gacha_type = ZZZ_TYPES[item.gacha_type] || 'Unknown';
      if (item.gacha_type !== 'Unknown') {
        switch (item.rank_type) {
          case '2':
            item.rank_type = '3';
            break;
          case '3':
            item.rank_type = '4';
            break;
          case '4':
            item.rank_type = '5';
            break;
          default:
            item.gacha_type = '0';
            break;
        }
      }
    },
  },
};

async function fetchPageWithRetry(url, retryDelay, logOnRetry) {
  while (true) {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();
    if (data.retcode === -110) {
      if (logOnRetry) console.log('Too Fast');
      await setTimeout(retryDelay);
      continue;
    }
    return data;
  }
}

async function processBanner(database, config, authkey, banner) {
  const drawCollection = database.collection(config.collection);
  let endid = '0';
  let game_uid = '';
  const collected = [];

  while (true) {
    const responseData = await fetchPageWithRetry(
      config.buildUrl(banner, authkey, endid),
      config.retryDelay,
      config.logOnRetry
    );

    if (!responseData.data) {
      return { earlyMessage: responseData.message };
    }

    const itemList = responseData.data.list;
    if (itemList.length === 0) break;

    const ids = itemList.map((i) => i.id);
    const existingDocs = await drawCollection
      .find({ DrawID: { $in: ids } }, { projection: { DrawID: 1, _id: 0 } })
      .toArray();
    const existingIds = new Set(existingDocs.map((d) => d.DrawID));

    let duplicateFound = false;
    for (const item of itemList) {
      game_uid = item.uid;
      if (existingIds.has(item.id)) {
        duplicateFound = true;
        break;
      }

      config.transformItem(item);

      if (item.gacha_type !== 'Unknown') {
        collected.push({
          [config.uidField]: String(item.uid),
          DrawID: String(item.id),
          DrawTime: parseGachaTime(item.time),
          DrawType: String(item.gacha_type),
          Item_Name: String(item.name),
          Rarity: String(item.rank_type),
        });
      }
    }

    endid = itemList[itemList.length - 1].id;
    if (duplicateFound) break;
  }

  return { collected, game_uid };
}

async function importHoyoDraws(database, config, authkey) {
  const results = await Promise.all(
    config.bannerSequence.map((banner) =>
      processBanner(database, config, authkey, banner)
    )
  );

  const early = results.find((r) => r.earlyMessage !== undefined);
  if (early) return { earlyMessage: early.earlyMessage };

  const newDraws = results.flatMap((r) => r.collected || []);
  const game_uid = results.map((r) => r.game_uid).find(Boolean) || '';
  return { newDraws, game_uid };
}

async function persistImport(database, config, userID, newDraws, game_uid) {
  const gamesUsersCollection = database.collection('Games_Users');
  await gamesUsersCollection.findOneAndUpdate(
    { UID: userID },
    { $set: { [config.uidField]: game_uid } },
    { upsert: true }
  );

  if (newDraws.length === 0) {
    console.log('No new data');
    return { message: 'noNewData' };
  }

  const drawCollection = database.collection(config.collection);
  await drawCollection.insertMany(newDraws, { ordered: false });

  const summaryTableCollection = database.collection('SummaryTable');
  await summaryTableCollection.findOneAndUpdate(
    { Game_UID: `${config.summaryPrefix}-${newDraws[0][config.uidField]}` },
    { $inc: { total_items: newDraws.length } },
    { upsert: true }
  );

  console.log('Data inserted successfully');
  return { message: 'newData' };
}

async function handleHoyoImport(req, res, config) {
  const { authkey, userID } = req.query;
  if (!authkey || !userID) {
    return res.status(400).json({ error: 'Invalid request' });
  }

  try {
    const database = await getDb();
    const result = await importHoyoDraws(database, config, authkey);

    if (result.earlyMessage !== undefined) {
      return res.json({ message: result.earlyMessage });
    }

    const response = await persistImport(
      database,
      config,
      userID,
      result.newDraws,
      result.game_uid
    );
    return res.json(response);
  } catch (errors) {
    console.error('Fetch error:', errors);
    return res.json({ message: errors });
  }
}

const WUWA_BANNERS = [
  'Featured Resonator Convene',
  'Featured Weapon Convene',
  'Standard Resonator Convene',
  'Standard Weapon Convene',
  'Beginner Convene',
  "Beginner's Choice Convene",
  "Beginner's Choice Convene (Giveback Custom Convene)",
];

function buildWuwaDrawId(oneDraw, wuwa_id) {
  return (
    oneDraw.name.replace(/[\s:-]/g, '').trim() +
    oneDraw.time.replace(/[\s:-]/g, '').trim() +
    wuwa_id
  );
}

async function processWuwaBanner(
  drawCollection,
  cardpoolId,
  recordId,
  serverId,
  wuwa_id,
  bannerIndex
) {
  const payload = {
    cardPoolId: cardpoolId,
    cardPoolType: bannerIndex,
    languageCode: 'en',
    playerId: wuwa_id,
    recordId,
    serverId,
  };

  let data;
  try {
    const response = await fetch(
      'https://gmserver-api.aki-game2.net/gacha/record/query',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Origin: 'https://aki-gm-resources-oversea.aki-game.net',
        },
        body: JSON.stringify(payload),
      }
    );
    if (!response.ok) throw new Error('Network response was not ok');
    data = await response.json();
  } catch (error) {
    console.error('There was a problem with the fetch operation:', error);
    return [];
  }

  if (!data?.data?.length) return [];

  const drawIds = data.data.map((d) => buildWuwaDrawId(d, wuwa_id));
  const existingDocs = await drawCollection
    .find({ DrawID: { $in: drawIds } }, { projection: { DrawID: 1, _id: 0 } })
    .toArray();
  const existingIds = new Set(existingDocs.map((d) => d.DrawID));

  const collected = [];
  for (const oneDraw of data.data) {
    const drawID = buildWuwaDrawId(oneDraw, wuwa_id);
    if (existingIds.has(drawID)) break;

    collected.push({
      Wuwa_UID: String(wuwa_id),
      DrawID: String(drawID),
      DrawTime: parseGachaTime(oneDraw.time),
      DrawType: String(WUWA_BANNERS[bannerIndex - 1]),
      Item_Name: String(oneDraw.name),
      Rarity: String(oneDraw.qualityLevel),
    });
  }
  return collected;
}

function extractWuwaParams(authkey) {
  const fields = {
    wuwa_id: /player_id=([^&]+)/,
    cardpoolId: /resources_id=([^&]+)/,
    recordId: /record_id=([^&]+)/,
    serverId: /svr_id=([^&]+)/,
  };
  const out = {};
  for (const [key, regex] of Object.entries(fields)) {
    const match = authkey.match(regex);
    if (!match) return null;
    out[key] = match[1];
  }
  return out;
}

async function handleWuwaImport(req, res) {
  if (!req.query.authkey || !req.query.userID) {
    return res.status(400).json({ error: 'Invalid request' });
  }

  const authkey = decodeURIComponent(req.query.authkey);
  const params = extractWuwaParams(authkey);
  if (!params) {
    return res.status(400).json({ error: 'Invalid request' });
  }
  const { wuwa_id, cardpoolId, recordId, serverId } = params;

  try {
    const database = await getDb();
    const wuwaDrawCollection = database.collection('Wuwa_Draw');

    const bannerResults = await Promise.all(
      [1, 2, 3, 4, 5, 6, 7].map((i) =>
        processWuwaBanner(wuwaDrawCollection, cardpoolId, recordId, serverId, wuwa_id, i)
      )
    );
    const newDraws = bannerResults.flat();

    const userID = req.query.userID;
    const gamesUsersCollection = database.collection('Games_Users');
    await gamesUsersCollection.findOneAndUpdate(
      { UID: userID },
      { $set: { Wuwa_UID: wuwa_id } },
      { upsert: true }
    );

    if (newDraws.length === 0) {
      console.log('No new data');
      return res.json({ message: 'noNewData' });
    }

    await wuwaDrawCollection.insertMany(newDraws, { ordered: false });

    const summaryTableCollection = database.collection('SummaryTable');
    await summaryTableCollection.findOneAndUpdate(
      { Game_UID: `Wuwa-${wuwa_id}` },
      { $inc: { total_items: newDraws.length } },
      { upsert: true }
    );

    console.log('Data inserted successfully');
    return res.json({ message: 'newData' });
  } catch (errors) {
    console.error('Fetch error:', errors);
    return res.json({ message: errors });
  }
}

module.exports = async (req, res) => {
  const game = req.query.game;
  if (!game) {
    return res.status(400).json({ error: 'Invalid request' });
  }

  if (game === 'wuwa') {
    return handleWuwaImport(req, res);
  }

  const config = HOYO_CONFIGS[game];
  if (!config) {
    return res.status(400).json({ error: 'Invalid request' });
  }

  return handleHoyoImport(req, res, config);
};
