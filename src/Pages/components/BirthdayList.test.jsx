import { describe, test, expect } from 'vitest';
import { upcomingBirthdays } from './BirthdayList';

const CAST = [
  { name: 'Wanderer', birthday: 'January 3rd', month: 1, day: 3 },
  { name: 'Thoma', birthday: 'January 9th', month: 1, day: 9 },
  { name: 'Klee', birthday: 'July 27th', month: 7, day: 27 },
  { name: 'Nahida', birthday: 'October 27th', month: 10, day: 27 },
  { name: 'Furina', birthday: 'October 13th', month: 10, day: 13 },
];

const names = (list) => list.map((entry) => entry.name);

describe('upcomingBirthdays', () => {
  test('starts from today and runs forward', () => {
    const list = upcomingBirthdays(CAST, new Date('2026-10-01T09:00:00Z'));
    expect(names(list).slice(0, 2)).toEqual(['Furina', 'Nahida']);
  });

  test('wraps around the end of the year', () => {
    const list = upcomingBirthdays(CAST, new Date('2026-12-20T09:00:00Z'));
    expect(names(list).slice(0, 2)).toEqual(['Wanderer', 'Thoma']);
  });

  test("flags today's birthday", () => {
    const list = upcomingBirthdays(CAST, new Date('2026-07-27T09:00:00Z'));
    expect(list[0].name).toBe('Klee');
    expect(list[0].isToday).toBe(true);
    expect(list[1].isToday).toBe(false);
  });

  test('honours the limit', () => {
    expect(upcomingBirthdays(CAST, new Date('2026-01-01T00:00:00Z'), 2)).toHaveLength(2);
  });

  test('ignores entries with no usable date, such as the Traveler', () => {
    const withTraveler = [
      ...CAST,
      { name: 'Traveler', birthday: "Player's Choice" },
    ];
    expect(names(upcomingBirthdays(withTraveler, new Date('2026-01-01T00:00:00Z')))).not.toContain(
      'Traveler'
    );
  });

  test('survives a failed fetch', () => {
    expect(upcomingBirthdays(null)).toEqual([]);
    expect(upcomingBirthdays([])).toEqual([]);
  });
});
