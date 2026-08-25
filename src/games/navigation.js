import * as routePaths from '../routePaths';

/**
 * Sidebar contents per game section.
 *
 * `tab` is the value pages pass as `activeTab` to highlight the current entry;
 * it is kept exactly as the pages already spell it (Reverse:1999 passes
 * 'Warp Tracker' for its summon tracker) so the highlighting does not change.
 *
 * The Farmable / TimeLine / Database / Achievements entries that used to sit
 * commented out in every sidebar are omitted -- their routes still live in
 * routePaths.js, so add an entry here when a page is built.
 */
export const GAME_NAV = {
  genshin: {
    title: 'Genshin Impact',
    items: [
      { tab: 'Home', label: 'Home', path: routePaths.GENSHIN_HOME_PATH },
      {
        tab: 'Wish Tracker',
        label: 'Wish Tracker',
        path: routePaths.GENSHIN_WISH_TRACKER_PATH,
      },
    ],
  },
  starrail: {
    title: 'Honkai: Star Rail',
    items: [
      { tab: 'Home', label: 'Home', path: routePaths.STARRAIL_HOME_PATH },
      {
        tab: 'Warp Tracker',
        label: 'Warp Tracker',
        path: routePaths.STARRAIL_WISH_TRACKER_PATH,
      },
    ],
  },
  zzz: {
    title: 'Zenless Zone Zero',
    items: [
      { tab: 'Home', label: 'Home', path: routePaths.ZZZ_HOME_PATH },
      {
        tab: 'Search Tracker',
        label: 'Search Tracker',
        path: routePaths.ZZZ_WISH_TRACKER_PATH,
      },
    ],
  },
  wuwa: {
    title: 'Wuthering Waves',
    items: [
      { tab: 'Home', label: 'Home', path: routePaths.WUWA_HOME_PATH },
      {
        tab: 'Convene Tracker',
        label: 'Convene Tracker',
        path: routePaths.WUWA_WISH_TRACKER_PATH,
      },
    ],
  },
  reverse1999: {
    title: 'Reverse: 1999',
    items: [
      { tab: 'Home', label: 'Home', path: routePaths.REVERSE_HOME_PATH },
      {
        tab: 'Resonate Optimizer',
        label: 'Resonate Optimizer',
        path: routePaths.REGISTER_PATH_RESONATE_OPTIMIZER,
      },
      {
        tab: 'Warp Tracker',
        label: 'Summon Tracker',
        path: routePaths.REVERSE_WISH_TRACKER_PATH,
      },
    ],
  },
};
