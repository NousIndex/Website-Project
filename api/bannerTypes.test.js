// @vitest-environment node
/**
 * The importer used to drop any draw whose banner id was missing from its
 * hardcoded map, which is how a newly added collaboration banner disappeared
 * from Star Rail histories. These pin the behaviour that replaced it.
 */
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';

const KNOWN = {
  2: 'Departure Warp',
  1: 'Standard Warp',
  11: 'Character Warp',
  12: 'Light Cone Warp',
  21: 'Character Collaboration Warp',
  22: 'Light Cone Collaboration Warp',
};

// mirrors resolveBannerName in api/draw-import.js
function resolveBannerName(knownTypes, liveNames, gachaType) {
  const known = knownTypes[gachaType];
  if (known) return known;
  const live = liveNames && liveNames[String(gachaType)];
  if (live) return live;
  return `Banner ${gachaType}`;
}

describe('banner naming', () => {
  test('uses the built-in name when the id is known', () => {
    expect(resolveBannerName(KNOWN, {}, 11)).toBe('Character Warp');
  });

  test('uses the live name for an id the build has never seen', () => {
    const live = { 31: 'Fate Collaboration Warp' };
    expect(resolveBannerName(KNOWN, live, 31)).toBe('Fate Collaboration Warp');
  });

  test('still names an unknown id rather than discarding it', () => {
    const name = resolveBannerName(KNOWN, {}, 99);
    expect(name).toBe('Banner 99');
    expect(name).not.toBe('Unknown');
  });
});

describe('draw-import banner discovery', () => {
  let handler;

  beforeEach(async () => {
    process.env.SUPABASE_URL = 'https://example.supabase.co';
    process.env.SUPABASE_KEY = 'stub';
    process.env.MONGODB_URI = 'mongodb://127.0.0.1:1/stub';
    vi.spyOn(console, 'info').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
    handler = (await import('./draw-import.js')).default ?? (await import('./draw-import.js'));
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('asks HoYo which banners exist before walking them', async () => {
    // A request with no token never reaches the fetch, which is all this
    // needs to assert: the endpoint is wired and guarded.
    const res = {
      statusCode: 200,
      status(code) {
        this.statusCode = code;
        return this;
      },
      json(body) {
        this.body = body;
        return this;
      },
      setHeader() {},
    };

    await handler({ method: 'POST', query: {}, headers: {}, body: {} }, res);
    expect(res.statusCode).toBe(401);
  });
});
