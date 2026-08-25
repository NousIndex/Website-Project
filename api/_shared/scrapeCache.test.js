// @vitest-environment node
import { describe, test, expect, beforeEach, vi } from 'vitest';

const store = new Map();
let dbBroken = false;

const { withScrapeFallback, sendScrapeResult } = await import('./scrapeCache.js');

// The helper takes its database handle as an option, so the test supplies an
// in-memory stand-in for the ScrapeCache collection.
const resolveDb = async () => {
  if (dbBroken) throw new Error('mongo unreachable');
  return {
    collection: () => ({
      findOne: async ({ _id }) => store.get(_id) ?? null,
      updateOne: async ({ _id }, { $set }) => {
        store.set(_id, { _id, ...$set });
        return { acknowledged: true };
      },
    }),
  };
};

const FRESH = 's-maxage=3600, stale-while-revalidate=86400';

function makeRes() {
  const res = { statusCode: 200, body: undefined, headers: {} };
  res.status = (c) => ((res.statusCode = c), res);
  res.json = (b) => ((res.body = b), res);
  res.setHeader = (k, v) => (res.headers[k] = v);
  return res;
}

describe('withScrapeFallback', () => {
  beforeEach(() => {
    store.clear();
    dbBroken = false;
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  test('serves a successful scrape and stores it', async () => {
    const result = await withScrapeFallback(
      'icons:starrail',
      async () => ['a.png', 'b.png'],
      { resolveDb }
    );

    expect(result.stale).toBe(false);
    expect(result.data).toHaveLength(2);
    expect(store.has('icons:starrail')).toBe(true);
  });

  test('falls back to the stored copy when the source fails', async () => {
    await withScrapeFallback('icons:starrail', async () => ['a.png'], {
      resolveDb,
    });

    const result = await withScrapeFallback(
      'icons:starrail',
      async () => {
        throw new Error('fandom returned 503');
      },
      { resolveDb }
    );

    expect(result.stale).toBe(true);
    expect(result.data).toEqual(['a.png']);
  });

  test('treats an empty scrape as a failure by default', async () => {
    await withScrapeFallback('icons:starrail', async () => ['a.png'], {
      resolveDb,
    });

    const result = await withScrapeFallback(
      'icons:starrail',
      async () => [],
      { resolveDb }
    );

    expect(result.stale).toBe(true);
    expect(result.data).toEqual(['a.png']);
  });

  test('respects a custom isEmpty, so an empty code table is legitimate', async () => {
    const result = await withScrapeFallback(
      'codes:genshin',
      async () => [],
      { isEmpty: () => false, resolveDb }
    );

    expect(result.stale).toBe(false);
    expect(result.data).toEqual([]);
  });

  test('throws when the scrape fails and nothing was ever cached', async () => {
    await expect(
      withScrapeFallback(
        'database:never-run',
        async () => {
          throw new Error('prydwen down');
        },
        { resolveDb }
      )
    ).rejects.toThrow('prydwen down');
  });

  test('a working scrape survives an unreachable cache', async () => {
    dbBroken = true;

    const result = await withScrapeFallback(
      'icons:genshin',
      async () => ['x.png'],
      { resolveDb }
    );

    expect(result.stale).toBe(false);
    expect(result.data).toEqual(['x.png']);
  });
});

describe('sendScrapeResult', () => {
  test('caches fresh data for the full window', () => {
    const res = makeRes();
    sendScrapeResult(res, { data: [1], stale: false }, FRESH);

    expect(res.headers['Cache-Control']).toBe(FRESH);
    expect(res.headers['X-Scrape-Stale']).toBeUndefined();
  });

  test('shortens the cache and flags the response while stale', () => {
    const res = makeRes();
    sendScrapeResult(res, { data: [1], stale: true }, FRESH);

    expect(res.headers['Cache-Control']).toContain('s-maxage=60');
    expect(res.headers['X-Scrape-Stale']).toBe('1');
  });
});
