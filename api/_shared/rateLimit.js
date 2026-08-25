const { getDb } = require('./mongo');

const COLLECTION = 'RateLimits';

/**
 * Per-user rate limiting, stored in MongoDB.
 *
 * Serverless functions have no shared memory between invocations, so the
 * counter has to live somewhere both instances can see. `draw-import` proxies
 * to HoYo's gacha API, and without a cap a single signed-in account can loop it
 * hard enough to get the deployment's IP throttled upstream — which breaks
 * imports for everybody.
 *
 * The window is fixed rather than sliding: simple, one round trip, and precise
 * enough for abuse protection.
 */
async function checkRateLimit(key, { limit, windowMs, resolveDb }) {
  const now = Date.now();

  try {
    const db = await (resolveDb || getDb)();
    const collection = db.collection(COLLECTION);

    const doc = await collection.findOneAndUpdate(
      { _id: key },
      [
        {
          $set: {
            windowStart: {
              $cond: [
                {
                  $or: [
                    { $eq: [{ $type: '$windowStart' }, 'missing'] },
                    { $lt: ['$windowStart', now - windowMs] },
                  ],
                },
                now,
                '$windowStart',
              ],
            },
            count: {
              $cond: [
                {
                  $or: [
                    { $eq: [{ $type: '$windowStart' }, 'missing'] },
                    { $lt: ['$windowStart', now - windowMs] },
                  ],
                },
                1,
                { $add: [{ $ifNull: ['$count', 0] }, 1] },
              ],
            },
          },
        },
      ],
      { upsert: true, returnDocument: 'after' }
    );

    const record = doc?.value ?? doc;
    const count = record?.count ?? 1;
    const windowStart = record?.windowStart ?? now;
    const retryAfterSec = Math.max(
      1,
      Math.ceil((windowStart + windowMs - now) / 1000)
    );

    return {
      allowed: count <= limit,
      count,
      limit,
      retryAfterSec,
    };
  } catch (error) {
    // Never let the limiter itself take the endpoint down.
    console.error('Rate limit check failed, allowing request:', error);
    return { allowed: true, count: 0, limit, retryAfterSec: 0 };
  }
}

/**
 * Applies a limit and writes the 429 response itself when it is exceeded.
 * @returns true when the caller should continue handling the request.
 */
async function enforceRateLimit(res, key, options) {
  const result = await checkRateLimit(key, options);
  if (result.allowed) return true;

  console.warn(`Rate limit hit for ${key}: ${result.count}/${result.limit}`);
  res.setHeader('Retry-After', String(result.retryAfterSec));
  res.status(429).json({
    error: 'Too many requests, please wait a moment and try again',
  });
  return false;
}

module.exports = { checkRateLimit, enforceRateLimit, COLLECTION };
