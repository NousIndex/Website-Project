import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import GameHomePage from './GameHomePage';
import { HOME_PAGES } from '../../games/homeConfig';

const RESPONSES = {
  genshinbanner: {
    urls: ['https://wiki.test/Swans_Shadow.png'],
    date: 'August 12 2026 - September 01 2026',
  },
  genshincode: [{ code: 'GENSHINGIFT', region: 'All', reward: 'Primogem ×60' }],
  genshinbirthday: [
    { name: 'Klee', birthday: 'July 27th', month: 7, day: 27, icon: 'k.png' },
  ],
  zzzcode: [{ code: 'ZZZMEIJI', region: 'All', reward: 'Polychrome ×50' }],
  wuwacode: [{ code: 'WUWA4PC', region: 'All', reward: 'Astrite ×50' }],
  wuwabanner: {
    urls: ['https://wiki.test/False_Promise.jpg'],
    date: 'August 20 2026 - September 10 2026',
  },
};

const requested = [];

vi.mock('../../APIs/client', () => ({
  apiFetchOr: vi.fn(async (fallback, path) => {
    requested.push(path);
    const command = path.split('scrapeCommand=')[1];
    return RESPONSES[command] ?? fallback;
  }),
}));

function renderHome(key) {
  return render(
    <MemoryRouter>
      <GameHomePage config={HOME_PAGES[key]} />
    </MemoryRouter>
  );
}

describe('GameHomePage', () => {
  beforeEach(() => {
    requested.length = 0;
  });

  test('each game asks for its own codes, not another game', async () => {
    renderHome('zzz');
    await waitFor(() => expect(requested.length).toBeGreaterThan(0));

    expect(requested.some((p) => p.includes('zzzcode'))).toBe(true);
    expect(requested.some((p) => p.includes('starrailcode'))).toBe(false);
    expect(await screen.findByText('ZZZMEIJI')).toBeInTheDocument();
  });

  test('codes link to that game redemption site when it has one', async () => {
    renderHome('genshin');
    const link = await screen.findByRole('link', { name: 'GENSHINGIFT' });
    expect(link).toHaveAttribute(
      'href',
      'https://genshin.hoyoverse.com/en/gift?code=GENSHINGIFT'
    );
  });

  test('in-game-only codes render as copyable text, not a dead link', async () => {
    renderHome('wuwa');
    const code = await screen.findByText('WUWA4PC');

    expect(code.tagName).toBe('BUTTON');
    expect(screen.queryByRole('link', { name: 'WUWA4PC' })).toBeNull();
  });

  test('no banner source means no carousel, rather than another game banners', async () => {
    renderHome('zzz');
    await waitFor(() => expect(requested.length).toBeGreaterThan(0));

    expect(requested.some((p) => p.includes('banner'))).toBe(false);
    expect(screen.queryByRole('img', { name: /banner/i })).toBeNull();
  });

  test('Wuthering Waves has no HoYoLAB check-in button', async () => {
    renderHome('wuwa');
    await screen.findByText('WUWA4PC');
    expect(screen.queryByText('Check-In')).toBeNull();
  });

  test('HoYo games keep their check-in link', async () => {
    renderHome('starrail');
    const link = await screen.findByRole('link', { name: /Check-In/ });
    expect(link.getAttribute('href')).toContain('hkrpg');
  });

  test('birthdays show only for the game that has a source', async () => {
    renderHome('genshin');
    expect(await screen.findByText(/Klee/)).toBeInTheDocument();

    requested.length = 0;
    renderHome('starrail');
    await waitFor(() => expect(requested.length).toBeGreaterThan(0));
    expect(requested.some((p) => p.includes('birthday'))).toBe(false);
  });

  test('renders the reset timer for every game with its own label', async () => {
    renderHome('wuwa');
    expect(
      await screen.findByText(/Tower of Adversity Reset/)
    ).toBeInTheDocument();
  });
});
