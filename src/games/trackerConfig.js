import * as routePaths from '../routePaths';

import genshinAll from '../assets/Icons/genshin-wish-all.webp';
import genshinCharacter from '../assets/Icons/genshin-wish-character.webp';
import genshinWeapon from '../assets/Icons/genshin-wish-weapon.webp';
import genshinStandard from '../assets/Icons/genshin-wish-standard.webp';

import starrailAll from '../assets/Icons/starrail-pompom.webp';
import starrailCharacter from '../assets/Icons/starrail-character.webp';
import starrailLightCone from '../assets/Icons/starrail-lc.webp';
import starrailStandard from '../assets/Icons/starrail-standard.webp';

import zzzAll from '../assets/Icons/zzz-eous.png';
import zzzAgent from '../assets/Icons/zzz-char.webp';
import zzzEngine from '../assets/Icons/zzz-wep.webp';
import zzzStandard from '../assets/Icons/zzz-standard.webp';
import zzzBangboo from '../assets/Icons/zzz-boo.webp';

import wuwaAll from '../assets/Icons/wuwa-all.webp';
import wuwaCharacter from '../assets/Icons/wuwa-character.webp';
import wuwaWeapon from '../assets/Icons/wuwa-weapon.webp';
import wuwaStandard from '../assets/Icons/wuwa-standard.webp';

/**
 * Everything that differs between the five draw tracker pages.
 *
 * The pages themselves were five copies of the same ~450 line component; what
 * actually changed between them was this data — which banners exist, what they
 * are called, and where the page links to.
 *
 * - `game`        which dataset the API calls ask for
 * - `sidebarGame` which sidebar to show (Reverse:1999 reads Star Rail data)
 * - `mergeBanner` some games split a banner in two (`... - 2`); selecting the
 *                 first must also match the second
 * - `buttonClass` Genshin's banner buttons use their own class and flatter
 *                 markup than the other four
 */
export const TRACKERS = {
  genshin: {
    game: 'genshin',
    sidebarGame: 'genshin',
    sidebarTab: 'Wish Tracker',
    title: 'Wish Tracker',
    importLabel: 'Import Wish',
    importPath: routePaths.GENSHIN_WISH_TRACKER_IMPORT_PATH,
    ownDrawsLabel: 'My Wish',
    statsTitle: 'Wish Stats',
    buttonClass: 'genshin-wish-image-button',
    wrapBannerButtons: false,
    mergeBanner: {
      primary: 'Character Event Wish',
      alias: 'Character Event Wish - 2',
    },
    banners: [
      { icon: genshinAll, text: 'All', filter: 'all' },
      {
        icon: genshinCharacter,
        text: 'Character',
        filter: 'Character Event Wish',
      },
      { icon: genshinWeapon, text: 'Weapon', filter: 'Weapon Event Wish' },
      { icon: genshinStandard, text: 'Standard', filter: 'Permanent Wish' },
    ],
  },

  starrail: {
    game: 'starrail',
    sidebarGame: 'starrail',
    sidebarTab: 'Warp Tracker',
    title: 'Warp Tracker',
    importLabel: 'Import Warp',
    importPath: routePaths.STARRAIL_WISH_TRACKER_IMPORT_PATH,
    ownDrawsLabel: 'My Warps',
    statsTitle: 'Warp Stats',
    buttonClass: 'starrail-wish-image-button',
    wrapBannerButtons: true,
    mergeBanner: {
      primary: 'Character Event Wish',
      alias: 'Character Event Wish - 2',
    },
    banners: [
      { icon: starrailAll, text: 'All', filter: 'all' },
      { icon: starrailCharacter, text: 'Character', filter: 'Character Warp' },
      {
        icon: starrailLightCone,
        text: 'Light Cone',
        filter: 'Light Cone Warp',
      },
      { icon: starrailStandard, text: 'Standard', filter: 'Standard Warp' },
    ],
  },

  zzz: {
    game: 'zzz',
    sidebarGame: 'zzz',
    sidebarTab: 'Search Tracker',
    title: 'Search Tracker',
    importLabel: 'Import Search',
    importPath: routePaths.ZZZ_WISH_TRACKER_IMPORT_PATH,
    ownDrawsLabel: 'My Searches',
    statsTitle: 'Search Stats',
    buttonClass: 'starrail-wish-image-button',
    wrapBannerButtons: true,
    mergeBanner: {
      primary: 'Agent Event Wish',
      alias: 'Agent Event Wish - 2',
    },
    banners: [
      { icon: zzzAll, text: 'All', filter: 'all' },
      { icon: zzzAgent, text: 'Agent', filter: 'Agent Search' },
      { icon: zzzEngine, text: 'W-Engine', filter: 'W-Engine Search' },
      { icon: zzzStandard, text: 'Standard', filter: 'Standard Search' },
      { icon: zzzBangboo, text: 'Bangboo', filter: 'Bangboo Search' },
    ],
  },

  wuwa: {
    game: 'wuwa',
    sidebarGame: 'wuwa',
    sidebarTab: 'Convene Tracker',
    title: 'Convene Tracker',
    importLabel: 'Import Convene',
    importPath: routePaths.WUWA_WISH_TRACKER_IMPORT_PATH,
    ownDrawsLabel: 'My Convenes',
    statsTitle: 'Convene Stats',
    buttonClass: 'starrail-wish-image-button',
    wrapBannerButtons: true,
    mergeBanner: null,
    banners: [
      { icon: wuwaAll, text: 'All', filter: 'all' },
      {
        icon: wuwaCharacter,
        text: 'Featured Resonator',
        filter: 'Featured Resonator Convene',
      },
      {
        icon: wuwaWeapon,
        text: 'Featured Weapon',
        filter: 'Featured Weapon Convene',
      },
      {
        icon: wuwaStandard,
        text: 'Standard Resonator',
        filter: 'Standard Resonator Convene',
      },
      {
        icon: wuwaStandard,
        text: 'Standard Weapon',
        filter: 'Standard Weapon Convene',
      },
    ],
  },

  // Reverse: 1999 has no gacha backend of its own; this page is a Star Rail
  // clone and reads Star Rail data, which is why its wording still says Warp
  // and why its import button leads to the Star Rail importer. Renaming it
  // would only disguise where the data comes from. See "Known gaps" in README.
  reverse1999: {
    game: 'starrail',
    sidebarGame: 'reverse1999',
    sidebarTab: 'Warp Tracker',
    title: 'Warp Tracker',
    importLabel: 'Import Warp',
    importPath: routePaths.STARRAIL_WISH_TRACKER_IMPORT_PATH,
    ownDrawsLabel: 'My Warps',
    statsTitle: 'Warp Stats',
    buttonClass: 'starrail-wish-image-button',
    wrapBannerButtons: true,
    mergeBanner: {
      primary: 'Character Event Wish',
      alias: 'Character Event Wish - 2',
    },
    banners: [
      { icon: starrailAll, text: 'All', filter: 'all' },
      { icon: starrailCharacter, text: 'Character', filter: 'Character Warp' },
      {
        icon: starrailLightCone,
        text: 'Light Cone',
        filter: 'Light Cone Warp',
      },
      { icon: starrailStandard, text: 'Standard', filter: 'Standard Warp' },
    ],
  },
};
