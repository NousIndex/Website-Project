import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import DrawTracker from './DrawTracker';
import { TRACKERS } from '../../games/trackerConfig';

const DRAWS = [
  {
    DrawID: '1',
    Item_Name: 'Silver Wolf',
    DrawType: 'Character Warp',
    Rarity: '5',
    DrawTime: '2024-01-02T03:04:05.000Z',
    drawNumber: 2,
    rarity5Pity: 40,
  },
  {
    DrawID: '2',
    Item_Name: 'Sleep Like the Dead',
    DrawType: 'Light Cone Warp',
    Rarity: '4',
    DrawTime: '2024-01-02T03:04:04.000Z',
    drawNumber: 1,
    rarity4Pity: 3,
  },
];

vi.mock('../../APIs/drawApi', () => ({
  getDrawHistory: vi.fn(async () => DRAWS),
  getExploreList: vi.fn(async () => ['801903001']),
  getIcons: vi.fn(async () => ['https://example.test/Silver_Wolf.png']),
  getItemDatabase: vi.fn(async () => ({ characters: [], weapons: [] })),
  getWatchList: vi.fn(async () => []),
  saveWatchList: vi.fn(async () => ({ message: 'success' })),
  sameWatchList: (a, b) => JSON.stringify(a) === JSON.stringify(b),
}));

const StatsStub = () => <div data-testid="stats">stats</div>;

function renderTracker(configKey) {
  return render(
    <MemoryRouter>
      <DrawTracker
        config={TRACKERS[configKey]}
        StatsTable={StatsStub}
        userID="11111111-2222-3333-4444-555555555555"
      />
    </MemoryRouter>
  );
}

describe('DrawTracker', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders a game using its configured wording and links', async () => {
    renderTracker('starrail');

    expect(
      await screen.findByRole('heading', { name: /Warp Tracker/ })
    ).toBeInTheDocument();
    expect(screen.getByText('Import Warp')).toBeInTheDocument();
    expect(screen.getByText('My Warps')).toBeInTheDocument();
    expect(screen.getByText('Warp Stats')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Import Warp/ })).toHaveAttribute(
      'href',
      '/starrail/warp_tracker/import'
    );
  });

  test('renders one button per configured banner', async () => {
    renderTracker('zzz');

    for (const banner of TRACKERS.zzz.banners) {
      expect(await screen.findByText(banner.text)).toBeInTheDocument();
    }
    // ZZZ is the game with the extra Bangboo banner
    expect(TRACKERS.zzz.banners).toHaveLength(5);
  });

  test('shows the fetched draws in the records table', async () => {
    renderTracker('starrail');

    expect(await screen.findByText('Silver Wolf')).toBeInTheDocument();
    expect(screen.getByText('Sleep Like the Dead')).toBeInTheDocument();
  });

  test('filtering by banner narrows the table', async () => {
    const user = userEvent.setup();
    renderTracker('starrail');

    await screen.findByText('Silver Wolf');
    await user.click(screen.getByText('Light Cone'));

    await waitFor(() => {
      expect(screen.queryByText('Silver Wolf')).not.toBeInTheDocument();
    });
    expect(screen.getByText('Sleep Like the Dead')).toBeInTheDocument();
  });

  test('reads the dataset named in the config, not the page name', async () => {
    const { getDrawHistory } = await import('../../APIs/drawApi');
    renderTracker('reverse1999');

    // Reverse:1999 has no gacha backend and reads Star Rail data on purpose.
    await waitFor(() => expect(getDrawHistory).toHaveBeenCalled());
    expect(getDrawHistory.mock.calls[0][0]).toBe('starrail');
  });

  test('saving is offered only once the watchlist actually changes', async () => {
    const user = userEvent.setup();
    renderTracker('starrail');

    const saveButton = await screen.findByText('Save Watchlist Changes!');
    expect(saveButton).toBeDisabled();

    // watching the currently viewed UID marks the list dirty
    await user.click(screen.getByAltText('No Watch Icon'));
    await waitFor(() => expect(saveButton).toBeEnabled());
  });
});
