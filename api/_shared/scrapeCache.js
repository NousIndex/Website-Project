const { getDb } = require('./mongo');

const COLLECTION = 'ScrapeCache';

/**
 * Last-good store for scraped reference data.
 *
 * draw-icons, draw-database and the banner/code scrapes read straight from
 * Fandom and prydwen. When either site is down, rate limits us, or changes its
 * markup, the scrape throws and the tracker loses every item icon and its whole
 * character database. Persisting each successful scrape means an outage
 * degrades to slightly stale data instead of an empty page.
 */
async function readCached(key, resolveDb = getDb) {
  try {
    const db = await resolveDb();
    const doc = await db.collection(COLLECTION).findOne({ _id: key });
    return doc ? { data: doc.data, updatedAt: doc.updatedAt } : null;
  } catch (error) {
    console.error(`Could not read cached scrape "${key}":`, error);
    return null;
  }
}

async function writeCached(key, data, resolveDb = getDb) {
  try {
    const db = await resolveDb();
    await db
      .collection(COLLECTION)
      .updateOne(
        { _id: key },
        { $set: { data, updatedAt: new Date() } },
        { upsert: true }
      );
  } catch (error) {
    // A failed write must never fail the request -- the fresh data is fine.
    console.error(`Could not store scrape "${key}":`, error);
  }
}

/**
 * Runs `scrape`, stores whatever it returns, and falls back to the last stored
 * copy if it throws or comes back empty.
 *
 * `resolveDb` exists so callers (and tests) can supply their own database
 * handle; production callers use the default.
 *
 * @returns {Promise<{ data: any, stale: boolean, updatedAt?: Date }>}
 * @throws if the scrape fails and nothing was ever cached
 */
async function withScrapeFallback(key, scrape, { isEmpty, resolveDb } = {}) {
  const empty = isEmpty || defaultIsEmpty;
  const db = resolveDb || getDb;

  try {
    const data = await scrape();
    if (empty(data)) {
      throw new Error('scrape returned no usable data');
    }
    await writeCached(key, data, db);
    return { data, stale: false };
  } catch (error) {
    console.error(`Scrape "${key}" failed:`, error.message);

    const cached = await readCached(key, db);
    if (!cached) throw error;

    console.warn(
      `Serving cached "${key}" from ${cached.updatedAt?.toISOString?.() ?? 'unknown time'}`
    );
    return { data: cached.data, stale: true, updatedAt: cached.updatedAt };
  }
}

function defaultIsEmpty(data) {
  if (data === null || data === undefined) return true;
  if (Array.isArray(data)) return data.length === 0;
  if (typeof data === 'object') return Object.keys(data).length === 0;
  return false;
}

/**
 * Sends a scrape result, shortening the CDN cache when the data is stale so a
 * recovered source is picked up quickly rather than pinned for the full hour.
 */
function sendScrapeResult(res, result, freshCacheControl) {
  res.setHeader(
    'Cache-Control',
    result.stale ? 's-maxage=60, stale-while-revalidate=600' : freshCacheControl
  );
  if (result.stale) {
    res.setHeader('X-Scrape-Stale', '1');
  }
  return res.json(result.data);
}

module.exports = {
  withScrapeFallback,
  sendScrapeResult,
  readCached,
  writeCached,
  COLLECTION,
};
