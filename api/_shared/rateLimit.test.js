// @vitest-environment node
import { describe, test, expect, beforeEach, afterAll, vi } from 'vitest';

const WINDOW_MS = 60_000;
const docs = new Map();
let dbBroken = false;
let now = 1_000_000;

const { checkRateLimit, enforceRateLimit } = await import('./rateLimit.js');

// stands in for the aggregation pipeline update: reset the counter when the
// window has expired, otherwise increment it
const resolveDb = async () => {
  if (dbBroken) throw new Error('mongo unreachable');
  return {
    collection: () => ({
      findOneAndUpdate: async ({ _id }) => {
        const existing = docs.get(_id);
        const next =
          !existing || existing.windowStart < now - WINDOW_MS
            ? { _id, windowStart: now, count: 1 }
            : { ...existing, count: existing.count + 1 };
        docs.set(_id, next);
        return next;
      },
    }),
  };
};

const OPTS = { limit: 3, windowMs: WINDOW_MS, resolveDb };
const realNow = Date.now;

function makeRes() {
  const res = { statusCode: 200, body: undefined, headers: {} };
  res.status = (c) => ((res.statusCode = c), res);
  res.json = (b) => ((res.body = b), res);
  res.setHeader = (k, v) => (res.headers[k] = v);
  return res;
}

describe('rate limiting', () => {
  beforeEach(() => {
    docs.clear();
    dbBroken = false;
    now = 1_000_000;
    Date.now = () => now;
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterAll(() => {
    Date.now = realNow;
  });

  test('allows requests up to the limit and blocks the next one', async () => {
    for (let i = 0; i < OPTS.limit; i++) {
      expect((await checkRateLimit('user:a', OPTS)).allowed).toBe(true);
    }
    expect((await checkRateLimit('user:a', OPTS)).allowed).toBe(false);
  });

  test('counts each caller separately', async () => {
    for (let i = 0; i < OPTS.limit + 1; i++) {
      await checkRateLimit('user:a', OPTS);
    }
    expect((await checkRateLimit('user:b', OPTS)).allowed).toBe(true);
  });

  test('starts a fresh window once the old one expires', async () => {
    for (let i = 0; i < OPTS.limit + 1; i++) {
      await checkRateLimit('user:a', OPTS);
    }

    now += WINDOW_MS + 1;

    const result = await checkRateLimit('user:a', OPTS);
    expect(result.allowed).toBe(true);
    expect(result.count).toBe(1);
  });

  test('enforce writes a 429 with Retry-After once over the limit', async () => {
    for (let i = 0; i < OPTS.limit; i++) {
      await checkRateLimit('user:a', OPTS);
    }

    const res = makeRes();
    const proceed = await enforceRateLimit(res, 'user:a', OPTS);

    expect(proceed).toBe(false);
    expect(res.statusCode).toBe(429);
    expect(Number(res.headers['Retry-After'])).toBeGreaterThan(0);
  });

  test('fails open when the database is unreachable', async () => {
    dbBroken = true;

    const res = makeRes();
    expect((await checkRateLimit('user:a', OPTS)).allowed).toBe(true);
    expect(await enforceRateLimit(res, 'user:a', OPTS)).toBe(true);
    expect(res.statusCode).toBe(200);
  });
});
