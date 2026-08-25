import { describe, test, expect } from 'vitest';
import { nextResetAt, splitDuration } from './ResetTimer';

const ANCHOR = '2023-10-15T19:59:59Z';
const CYCLE = 14;
const at = (iso) => new Date(iso).getTime();

describe('nextResetAt', () => {
  test('returns the anchor itself before the first reset', () => {
    expect(nextResetAt(ANCHOR, CYCLE, 0, at('2023-10-01T00:00:00Z'))).toBe(
      at(ANCHOR)
    );
  });

  test('lands on the next cycle boundary, not the anchor', () => {
    // one day after the anchor -> the reset 13 days later
    const next = nextResetAt(ANCHOR, CYCLE, 0, at('2023-10-16T19:59:59Z'));
    expect(next).toBe(at('2023-10-29T19:59:59Z'));
  });

  test('is correct years later without stepping through every cycle', () => {
    // the bug this replaces: the old timer started at the 2023 anchor and
    // advanced one cycle per tick, so a page opened in 2026 showed nonsense
    // until it had ticked ~70 times
    const now = at('2026-08-25T12:00:00Z');
    const next = nextResetAt(ANCHOR, CYCLE, 0, now);

    expect(next).toBeGreaterThan(now);
    expect(next - now).toBeLessThanOrEqual(CYCLE * 24 * 60 * 60 * 1000);

    const sinceAnchor = next - at(ANCHOR);
    expect(sinceAnchor % (CYCLE * 24 * 60 * 60 * 1000)).toBe(0);
  });

  test('applies the region offset', () => {
    const now = at('2026-08-25T12:00:00Z');
    const asia = nextResetAt(ANCHOR, CYCLE, 0, now);
    const europe = nextResetAt(ANCHOR, CYCLE, 7, now);

    expect(europe - asia).toBe(7 * 60 * 60 * 1000);
  });

  test('returns null for an unusable config', () => {
    expect(nextResetAt('not-a-date', CYCLE, 0)).toBeNull();
    expect(nextResetAt(ANCHOR, 0, 0)).toBeNull();
  });
});

describe('splitDuration', () => {
  test('breaks milliseconds into d/h/m/s', () => {
    const ms = ((2 * 24 + 3) * 60 * 60 + 4 * 60 + 5) * 1000;
    expect(splitDuration(ms)).toEqual({
      days: 2,
      hours: 3,
      minutes: 4,
      seconds: 5,
    });
  });

  test('never goes negative', () => {
    expect(splitDuration(-5000)).toEqual({
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
    });
  });
});
