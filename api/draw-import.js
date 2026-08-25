const { setTimeout } = require('node:timers/promises');
const { getDb } = require('./_shared/mongo');
const { withAuth } = require('./_shared/auth');
const { enforceRateLimit } = require('./_shared/rateLimit');
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
    buildUrl: (banner, authkey, endid) =>
      `https://public-operation-hk4e-sg.hoyoverse.com/gacha_info/api/getGachaLog?authkey_ver=1&sign_type=2&auth_appid=webview_gacha&init_type=${banner}&lang=en&authkey=${authkey}&gacha_type=${banner}&page=1&size=20&end_id=${endid}`,
    buildConfigUrl: (authkey) =>
      `https://public-operation-hk4e-sg.hoyoverse.com/gacha_info/api/getConfigList?authkey_ver=1&sign_type=2&auth_appid=webview_gacha&lang=en&authkey=${authkey}`,
    types: GENSHIN_TYPES,
    transformItem(item, names) {
      item.gacha_type = resolveBannerName(GENSHIN_TYPES, names, item.gacha_type);
    },
  },
  starrail: {
    bannerSequence: [2, 11, 12, 21, 22, 1],
    uidField: 'StarRail_UID',
    collection: 'StarRail_Draw',
    summaryPrefix: 'StarRail',
    retryDelay: 100,
    buildUrl: (banner, authkey, endid) =>
      `https://public-operation-hkrpg-sg.hoyoverse.com/common/gacha_record/api/getGachaLog?authkey_ver=1&sign_type=2&auth_appid=webview_gacha&default_gacha_type=${banner}&lang=en&authkey=${authkey}&game_biz=hkrpg_global&gacha_type=${banner}&page=1&size=20&end_id=${endid}`,
    buildConfigUrl: (authkey) =>
      `https://public-operation-hkrpg-sg.hoyoverse.com/common/gacha_record/api/getConfigList?authkey_ver=1&sign_type=2&auth_appid=webview_gacha&lang=en&authkey=${authkey}&game_biz=hkrpg_global`,
    types: STARRAIL_TYPES,
    transformItem(item, names) {
      item.gacha_type = resolveBannerName(STARRAIL_TYPES, names, item.gacha_type);
    },
  },
  zzz: {
    bannerSequence: [2001, 3001, 102001, 103001, 5001, 1001],
    uidField: 'Zzz_UID',
    collection: 'Zzz_Draw',
    summaryPrefix: 'Zzz',
    retryDelay: 75,
    buildUrl: (banner, authkey, endid) =>
      `https://public-operation-nap-sg.hoyoverse.com/common/gacha_record/api/getGachaLog?authkey_ver=1&sign_type=2&auth_appid=webview_gacha&default_gacha_type=${banner}&lang=en&authkey=${authkey}&game_biz=nap_global&gacha_type=${banner}&page=1&size=20&end_id=${endid}`,
    buildConfigUrl: (authkey) =>
      `https://public-operation-nap-sg.hoyoverse.com/common/gacha_record/api/getConfigList?authkey_ver=1&sign_type=2&auth_appid=webview_gacha&lang=en&authkey=${authkey}&game_biz=nap_global`,
    types: ZZZ_TYPES,
    transformItem(item, names) {
      item.gacha_type = resolveBannerName(ZZZ_TYPES, names, item.gacha_type);
      // ZZZ reports rarity one step lower than every other game.
      const shifted = { 2: '3', 3: '4', 4: '5' }[item.rank_type];
      if (shifted) item.rank_type = shifted;
    },
  },
};

const reportedUnknownTypes = new Set();

/**
 * Names a banner from its numeric type.
 *
 * Anything missing from the hardcoded map used to be labelled "Unknown" and
 * then dropped, so a banner type added by the game -- a new collaboration, say
 * -- silently vanished from the user's history and skewed their pity counts.
 * The live name from getConfigList is used when we have it, and an unrecognised
 * id is kept under a generated label rather than thrown away.
 */
function resolveBannerName(knownTypes, liveNames, gachaType) {
  const known = knownTypes[gachaType];
  if (known) return known;

  const live = liveNames && liveNames[String(gachaType)];
  if (live) return live;

  if (!reportedUnknownTypes.has(gachaType)) {
    reportedUnknownTypes.add(gachaType);
    console.warn(`Unmapped banner type ${gachaType}; keeping draws under a generated name`);
  }
  return `Banner ${gachaType}`;
}

/**
 * The banner types this account can actually see, straight from HoYo.
 *
 * Returns `{ order, names }`: the ids to walk, and their display names. Known
 * ids keep their existing order so pity grouping is unchanged, and anything new
 * is appended. A failure here is not fatal -- the import falls back to the
 * hardcoded list.
 */
async function fetchBannerConfig(config, authkey) {
  if (!config.buildConfigUrl) {
    return { order: config.bannerSequence, names: {} };
  }

  try {
    const response = await fetch(config.buildConfigUrl(authkey));
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const data = await response.json();
    const list = data?.data?.gacha_type_list;
    if (!Array.isArray(list) || list.length === 0) {
      return { order: config.bannerSequence, names: {} };
    }

    const names = {};
    for (const entry of list) {
      if (entry?.key) names[String(entry.key)] = entry.name || undefined;
    }

    const known = config.bannerSequence.map(String);
    const discovered = Object.keys(names).filter((key) => !known.includes(key));
    if (discovered.length > 0) {
      console.info(`Found banner types not in the built-in list: ${discovered.join(', ')}`);
    }

    return {
      order: [...config.bannerSequence, ...discovered],
      names,
    };
  } catch (error) {
    console.warn('Could not read the banner list, using the built-in one:', error.message);
    return { order: config.bannerSequence, names: {} };
  }
}

const MAX_RETRIES = 5;
const MAX_BACKOFF_MS = 1500;

async function fetchPageWithRetry(url, retryDelay) {
  let attempt = 0;
  while (true) {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();
    if (data.retcode === -110) {
      if (attempt >= MAX_RETRIES) {
        throw new Error('Rate limited too many times');
      }
      const backoff = Math.min(retryDelay * 2 ** attempt, MAX_BACKOFF_MS);
      await setTimeout(backoff);
      attempt++;
      continue;
    }
    return data;
  }
}

async function processBanner(
  database,
  config,
  authkey,
  banner,
  startEndid,
  deadline,
  bannerNames
) {
  const drawCollection = database.collection(config.collection);
  let endid = startEndid;
  let game_uid = '';
  const collected = [];

  while (true) {
    if (Date.now() > deadline) {
      return { collected, game_uid, timedOut: true, endid };
    }

    const responseData = await fetchPageWithRetry(
      config.buildUrl(banner, authkey, endid),
      config.retryDelay
    );

    if (!responseData.data) {
      return { collected, game_uid, earlyMessage: responseData.message };
    }

    const itemList = responseData.data.list;
    if (itemList.length === 0) return { collected, game_uid };

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

      config.transformItem(item, bannerNames);

      // Every draw is kept, including banner types this build has never seen:
      // dropping them loses history and corrupts the pity counts around them.
      collected.push({
        [config.uidField]: String(item.uid),
        DrawID: String(item.id),
        DrawTime: parseGachaTime(item.time),
        DrawType: String(item.gacha_type),
        Item_Name: String(item.name),
        Rarity: String(item.rank_type),
      });
    }

    endid = itemList[itemList.length - 1].id;
    if (duplicateFound) return { collected, game_uid };
  }
}

async function importHoyoDraws(database, config, authkey, startCursor, deadline) {
  const allDraws = [];
  let game_uid = '';
  const startBannerIdx = startCursor?.b ?? 0;
  let bannerStartEndid = startCursor?.e ?? '0';

  const { order, names } = await fetchBannerConfig(config, authkey);

  for (let i = startBannerIdx; i < order.length; i++) {
    const banner = order[i];
    const result = await processBanner(
      database,
      config,
      authkey,
      banner,
      bannerStartEndid,
      deadline,
      names
    );

    if (result.collected) allDraws.push(...result.collected);
    if (result.game_uid) game_uid = result.game_uid;

    if (result.earlyMessage !== undefined) {
      return { newDraws: allDraws, game_uid, earlyMessage: result.earlyMessage };
    }

    if (result.timedOut) {
      return {
        newDraws: allDraws,
        game_uid,
        timedOut: true,
        cursor: { b: i, e: result.endid },
      };
    }

    bannerStartEndid = '0';
  }

  return { newDraws: allDraws, game_uid };
}

const TIME_BUDGET_MS = 7500;

/**
 * Inserts draws, tolerating duplicate-key errors from a retried import, and
 * reports how many documents actually landed. The caller increments
 * SummaryTable.total_items by this number -- incrementing by the attempted
 * count instead would desync the counter that draw-history uses to decide
 * whether its cached file is still fresh.
 */
async function insertDrawsIgnoringDuplicates(drawCollection, draws) {
  try {
    const result = await drawCollection.insertMany(draws, { ordered: false });
    return result.insertedCount;
  } catch (error) {
    if (error?.code === 11000 || error?.writeErrors) {
      const duplicates = (error.writeErrors || []).length;
      console.warn(`Skipped ${duplicates} duplicate draw(s) during import`);
      return error.result?.nInserted ?? draws.length - duplicates;
    }
    throw error;
  }
}

async function persistDraws(database, config, userID, newDraws, game_uid) {
  if (game_uid) {
    const gamesUsersCollection = database.collection('Games_Users');
    await gamesUsersCollection.findOneAndUpdate(
      { UID: userID },
      { $set: { [config.uidField]: game_uid } },
      { upsert: true }
    );
  }

  if (newDraws.length === 0) return 0;

  const drawCollection = database.collection(config.collection);
  const insertedCount = await insertDrawsIgnoringDuplicates(
    drawCollection,
    newDraws
  );

  if (insertedCount === 0) return 0;

  const summaryTableCollection = database.collection('SummaryTable');
  await summaryTableCollection.findOneAndUpdate(
    { Game_UID: `${config.summaryPrefix}-${newDraws[0][config.uidField]}` },
    { $inc: { total_items: insertedCount } },
    { upsert: true }
  );

  return insertedCount;
}

/**
 * Reports what HoYo says about each banner, without importing anything.
 *
 * For every banner type -- the built-in list plus whatever getConfigList adds
 * -- this fetches the first page and reports how many records came back. A
 * banner the account has pulls on but which returns `records: 0` means the id
 * is wrong; an id that appears only under `discovered` means the built-in list
 * is out of date.
 */
async function inspectBanners(config, authkey) {
  const { order, names } = await fetchBannerConfig(config, authkey);
  const known = config.bannerSequence.map(String);

  const banners = [];
  for (const banner of order) {
    const entry = {
      id: String(banner),
      name: names[String(banner)] || config.types?.[banner] || null,
      source: known.includes(String(banner)) ? 'built-in' : 'discovered',
    };

    try {
      const data = await fetchPageWithRetry(
        config.buildUrl(banner, authkey, '0'),
        config.retryDelay
      );
      if (!data.data) {
        entry.records = 0;
        entry.message = data.message || 'no data field';
      } else {
        const list = data.data.list || [];
        entry.records = list.length;
        entry.newest = list[0]
          ? { name: list[0].name, time: list[0].time, gacha_type: list[0].gacha_type }
          : null;
      }
    } catch (error) {
      entry.records = 0;
      entry.message = error.message;
    }

    banners.push(entry);
    await setTimeout(config.retryDelay);
  }

  return {
    game: config.summaryPrefix,
    bannerCount: banners.length,
    discovered: banners.filter((b) => b.source === 'discovered').map((b) => b.id),
    banners,
  };
}

async function handleHoyoImport(req, res, config, userID) {
  const authkey = readAuthkey(req);
  if (!authkey) {
    return res.status(400).json({ error: 'Invalid request' });
  }

  const deadline = Date.now() + TIME_BUDGET_MS;

  try {
    const database = await getDb();
    const progressCollection = database.collection('ImportProgress');
    const progressKey = `${config.summaryPrefix}-${userID}`;

    let startCursor = readCursor(req);
    if (!startCursor) {
      const saved = await progressCollection.findOne({ _id: progressKey });
      if (saved?.cursor) startCursor = saved.cursor;
    }

    const result = await importHoyoDraws(
      database,
      config,
      authkey,
      startCursor,
      deadline
    );

    await persistDraws(database, config, userID, result.newDraws, result.game_uid);

    if (result.earlyMessage !== undefined) {
      await progressCollection.deleteOne({ _id: progressKey });
      return res.json({ message: result.earlyMessage });
    }

    if (result.timedOut) {
      await progressCollection.updateOne(
        { _id: progressKey },
        { $set: { cursor: result.cursor, updatedAt: new Date() } },
        { upsert: true }
      );
      return res.json({
        message: 'partial',
        cursor: result.cursor,
        added: result.newDraws.length,
      });
    }

    await progressCollection.deleteOne({ _id: progressKey });
    return res.json({
      message: result.newDraws.length > 0 ? 'newData' : 'noNewData',
    });
  } catch (error) {
    console.error('Import error:', error);
    return res.status(500).json({ error: 'Import failed, please try again' });
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

async function handleWuwaImport(req, res, userID) {
  const authkey = readAuthkey(req);
  if (!authkey) {
    return res.status(400).json({ error: 'Invalid request' });
  }

  const params = extractWuwaParams(authkey);
  if (!params) {
    return res.status(400).json({ error: 'Invalid request' });
  }
  const { wuwa_id, cardpoolId, recordId, serverId } = params;
  const deadline = Date.now() + TIME_BUDGET_MS;

  try {
    const database = await getDb();
    const wuwaDrawCollection = database.collection('Wuwa_Draw');
    const progressCollection = database.collection('ImportProgress');
    const progressKey = `Wuwa-${userID}`;

    let startBanner = 1;
    const requestCursor = readCursor(req);
    if (typeof requestCursor?.b === 'number') {
      startBanner = requestCursor.b;
    } else {
      const saved = await progressCollection.findOne({ _id: progressKey });
      if (typeof saved?.cursor?.b === 'number') startBanner = saved.cursor.b;
    }

    const newDraws = [];
    let lastCompletedBanner = startBanner - 1;
    let timedOut = false;

    for (let i = startBanner; i <= 7; i++) {
      if (Date.now() > deadline) {
        timedOut = true;
        break;
      }
      const collected = await processWuwaBanner(
        wuwaDrawCollection,
        cardpoolId,
        recordId,
        serverId,
        wuwa_id,
        i
      );
      newDraws.push(...collected);
      lastCompletedBanner = i;
      await setTimeout(50);
    }

    const gamesUsersCollection = database.collection('Games_Users');
    await gamesUsersCollection.findOneAndUpdate(
      { UID: userID },
      { $set: { Wuwa_UID: wuwa_id } },
      { upsert: true }
    );

    let insertedCount = 0;
    if (newDraws.length > 0) {
      insertedCount = await insertDrawsIgnoringDuplicates(
        wuwaDrawCollection,
        newDraws
      );
      if (insertedCount > 0) {
        const summaryTableCollection = database.collection('SummaryTable');
        await summaryTableCollection.findOneAndUpdate(
          { Game_UID: `Wuwa-${wuwa_id}` },
          { $inc: { total_items: insertedCount } },
          { upsert: true }
        );
      }
    }

    if (timedOut) {
      const cursor = { b: lastCompletedBanner + 1 };
      await progressCollection.updateOne(
        { _id: progressKey },
        { $set: { cursor, updatedAt: new Date() } },
        { upsert: true }
      );
      return res.json({ message: 'partial', cursor, added: insertedCount });
    }

    await progressCollection.deleteOne({ _id: progressKey });

    if (newDraws.length === 0) {
      return res.json({ message: 'noNewData' });
    }
    return res.json({ message: 'newData' });
  } catch (error) {
    console.error('Import error:', error);
    return res.status(500).json({ error: 'Import failed, please try again' });
  }
}

/**
 * The gacha authkey is a bearer credential for the player's HoYo account, so
 * it travels in the POST body -- a query string would land in access logs and
 * browser history.
 */
function readAuthkey(req) {
  const authkey = req.body?.authkey;
  if (typeof authkey !== 'string' || authkey.length === 0) return null;

  // Accept the whole wish-history URL too, so the diagnostic can be run with
  // the link the game hands you rather than a hand-extracted key.
  if (authkey.includes('authkey=')) {
    return authkey.split('authkey=')[1].split('&game')[0];
  }
  return authkey;
}

function readCursor(req) {
  const cursor = req.body?.cursor;
  return cursor && typeof cursor === 'object' ? cursor : null;
}

// One import walks every banner and can need a dozen resumed calls, so the cap
// is well above a normal run while still stopping a loop from hammering HoYo.
const IMPORT_LIMIT = { limit: 40, windowMs: 5 * 60 * 1000 };

module.exports = withAuth(async (req, res, userID) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!(await enforceRateLimit(res, `import:${userID}`, IMPORT_LIMIT))) {
    return undefined;
  }

  const game = req.body?.game;
  if (!game) {
    return res.status(400).json({ error: 'Invalid request' });
  }

  if (game === 'wuwa') {
    return handleWuwaImport(req, res, userID);
  }

  const config = HOYO_CONFIGS[game];
  if (!config) {
    return res.status(400).json({ error: 'Invalid request' });
  }

  // `inspect: true` reports what each banner returns and stores nothing.
  if (req.body?.inspect === true) {
    const authkey = readAuthkey(req);
    if (!authkey) {
      return res.status(400).json({ error: 'Invalid request' });
    }
    try {
      return res.json(await inspectBanners(config, authkey));
    } catch (error) {
      console.error('Inspect failed:', error);
      return res.status(500).json({ error: error.message });
    }
  }

  return handleHoyoImport(req, res, config, userID);
});
