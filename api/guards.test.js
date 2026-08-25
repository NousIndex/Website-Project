// @vitest-environment node
/**
 * Request-validation checks for every API function.
 *
 * These cover the guard clauses — unknown game, missing or invalid token,
 * wrong method — which is where an auth mistake would show up. None of them
 * reach Mongo or a scrape: a request with no token is rejected before any
 * connection is opened, and supabase-js rejects a malformed token locally
 * without a round trip.
 */
import { describe, test, expect, beforeAll, vi } from 'vitest';

beforeAll(() => {
  process.env.SUPABASE_URL = 'https://example.supabase.co';
  process.env.SUPABASE_KEY = 'stub-key';
  process.env.MONGODB_URI = 'mongodb://127.0.0.1:1/stub';
  vi.spyOn(console, 'error').mockImplementation(() => {});
  vi.spyOn(console, 'warn').mockImplementation(() => {});
});

function makeRes() {
  const res = { statusCode: 200, body: undefined, headers: {} };
  res.status = (code) => ((res.statusCode = code), res);
  res.json = (payload) => ((res.body = payload), res);
  res.setHeader = (k, v) => (res.headers[k] = v);
  return res;
}

async function call(modulePath, req) {
  const module = await import(modulePath);
  const handler = module.default ?? module;
  const res = makeRes();
  await handler(req, res);
  return res;
}

describe('draw-watchlist', () => {
  test('rejects an unknown game', async () => {
    const res = await call('./draw-watchlist.js', {
      query: { game: 'nope' },
      headers: {},
    });
    expect(res.statusCode).toBe(400);
  });

  test('requires a token to read the caller watchlist', async () => {
    const res = await call('./draw-watchlist.js', {
      query: { game: 'genshin', command: 'get' },
      headers: {},
    });
    expect(res.statusCode).toBe(401);
  });

  test('requires a token to write the caller watchlist', async () => {
    const res = await call('./draw-watchlist.js', {
      query: { game: 'genshin', command: 'update' },
      headers: {},
      body: { watchList: [] },
    });
    expect(res.statusCode).toBe(401);
  });
});

describe('draw-import', () => {
  test('rejects a request with no token', async () => {
    const res = await call('./draw-import.js', {
      method: 'POST',
      query: {},
      headers: {},
      body: { game: 'genshin', authkey: 'x' },
    });
    expect(res.statusCode).toBe(401);
  });

  test('rejects a token that does not verify', async () => {
    const res = await call('./draw-import.js', {
      method: 'POST',
      query: {},
      headers: { authorization: 'Bearer nonsense' },
      body: { game: 'genshin', authkey: 'x' },
    });
    expect(res.statusCode).toBe(401);
    expect(res.body.error).toMatch(/Invalid authentication token/);
  });
});

describe('public read endpoints', () => {
  test.each([
    ['./draw-history.js', { query: {}, headers: {} }],
    ['./draw-history.js', { query: { game: 'nope' }, headers: {} }],
    ['./draw-icons.js', { query: { game: 'nope' }, headers: {} }],
    ['./draw-database.js', { query: { game: 'nope' }, headers: {} }],
    ['./misc-commands.js', { query: { scrapeCommand: 'nope' }, headers: {} }],
  ])('%s rejects a bad request', async (modulePath, req) => {
    const res = await call(modulePath, req);
    expect(res.statusCode).toBe(400);
  });
});

describe('misc-commands writes', () => {
  test('resonance update requires a token', async () => {
    const res = await call('./misc-commands.js', {
      query: { scrapeCommand: 'reverse1999resonanceupdate' },
      headers: {},
      body: { character_name: 'x' },
    });
    expect(res.statusCode).toBe(401);
  });
});
