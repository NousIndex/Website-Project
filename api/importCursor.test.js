// @vitest-environment node
/**
 * A resume cursor that outlives its import used to strand an account.
 *
 * The importer walks banners in order and, when it runs out of time, saves
 * "carry on from index N". That cursor is only deleted when a run completes, so
 * an abandoned run left it behind and every later import started at N -- never
 * re-checking the banners before it. The newest banners sit at the front, so
 * new pulls stopped being imported and the app reported "no new data" every
 * time, permanently.
 */
import { describe, test, expect, beforeAll, vi } from 'vitest';

beforeAll(() => {
  process.env.SUPABASE_URL = 'https://example.supabase.co';
  process.env.SUPABASE_KEY = 'stub';
  process.env.MONGODB_URI = 'mongodb://127.0.0.1:1/stub';
  vi.spyOn(console, 'warn').mockImplementation(() => {});
});

const { usableSavedCursor } = await import('./draw-import.js');

const NOW = Date.parse('2026-08-25T12:00:00Z');
const secondsAgo = (n) => new Date(NOW - n * 1000).toISOString();

describe('usableSavedCursor', () => {
  test('resumes a cursor from the run happening right now', () => {
    const saved = { cursor: { b: 3, e: '123' }, updatedAt: secondsAgo(5) };
    expect(usableSavedCursor(saved, { now: NOW, bannerCount: 6 })).toEqual({
      b: 3,
      e: '123',
    });
  });

  test('ignores a cursor left behind by an abandoned run', () => {
    const saved = { cursor: { b: 3, e: '123' }, updatedAt: secondsAgo(3600) };
    expect(usableSavedCursor(saved, { now: NOW, bannerCount: 6 })).toBeNull();
  });

  test('ignores a cursor pointing past the end of the banner list', () => {
    // a banner type was added or removed since the cursor was written
    const saved = { cursor: { b: 9 }, updatedAt: secondsAgo(5) };
    expect(usableSavedCursor(saved, { now: NOW, bannerCount: 6 })).toBeNull();
  });

  test('ignores a cursor with no timestamp at all', () => {
    expect(
      usableSavedCursor({ cursor: { b: 2 } }, { now: NOW, bannerCount: 6 })
    ).toBeNull();
  });

  test('handles a missing or empty record', () => {
    expect(usableSavedCursor(null, { now: NOW })).toBeNull();
    expect(usableSavedCursor({}, { now: NOW })).toBeNull();
  });

  test('index 0 is a real position, not a falsy value', () => {
    const saved = { cursor: { b: 0, e: '0' }, updatedAt: secondsAgo(2) };
    expect(usableSavedCursor(saved, { now: NOW, bannerCount: 6 })).toEqual({
      b: 0,
      e: '0',
    });
  });
});
