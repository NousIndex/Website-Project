/**
 * Per-game home page contents.
 *
 * The five home pages were copies of one another, which is why Zenless Zone
 * Zero and Wuthering Waves were showing Star Rail's banners, Star Rail's
 * redemption codes, and (for Wuthering Waves) a HoYoLAB check-in link for a
 * game that is not made by HoYoverse.
 *
 * A section is rendered only when this config gives it a source. Nothing here
 * falls back to another game's data: a missing source means the panel is left
 * out, which is honest and makes the gap obvious.
 *
 *   banner    api/misc-commands scrape command, or null when the wiki has no
 *             page listing the banners currently running
 *   codes     scrape command plus the site that redeems them; `redeemUrl: null`
 *             means the game only accepts codes in-game, so codes render as
 *             plain text instead of dead links
 *   birthdays only Genshin's wiki publishes a birthday table
 *   reset     the repeating endgame-mode reset, as an anchor plus a cycle
 */
export const HOME_PAGES = {
  genshin: {
    sidebarGame: 'genshin',
    title: 'Genshin Impact',
    checkInUrl:
      'https://act.hoyolab.com/ys/event/signin-sea-v3/index.html?act_id=e202102251931481',
    banner: 'genshinbanner',
    codes: {
      command: 'genshincode',
      redeemUrl: 'https://genshin.hoyoverse.com/en/gift?code=',
    },
    birthdays: 'genshinbirthday',
    reset: {
      label: 'Spiral Abyss',
      anchor: '2023-09-30T19:59:59Z',
      cycleDays: 14,
    },
  },

  starrail: {
    sidebarGame: 'starrail',
    title: 'Honkai: Star Rail',
    checkInUrl:
      'https://act.hoyolab.com/bbs/event/signin/hkrpg/index.html?act_id=e202303301540311',
    banner: 'starrailbanner',
    codes: {
      command: 'starrailcode',
      redeemUrl: 'https://hsr.hoyoverse.com/gift?code=',
    },
    birthdays: null,
    reset: {
      label: 'Memory of Chaos',
      anchor: '2023-10-15T19:59:59Z',
      cycleDays: 14,
    },
  },

  zzz: {
    sidebarGame: 'zzz',
    title: 'Zenless Zone Zero',
    checkInUrl:
      'https://act.hoyolab.com/bbs/event/signin/zzz/index.html?act_id=e202406031448091',
    // no wiki page lists the running signal searches
    banner: null,
    codes: {
      command: 'zzzcode',
      redeemUrl: 'https://zenless.hoyoverse.com/redemption?code=',
    },
    birthdays: null,
    reset: {
      label: 'Shiyu Defense',
      anchor: '2023-10-15T19:59:59Z',
      cycleDays: 14,
    },
  },

  wuwa: {
    sidebarGame: 'wuwa',
    title: 'Wuthering Waves',
    // Kuro Games, not HoYoverse -- there is no HoYoLAB check-in for it
    checkInUrl: null,
    banner: 'wuwabanner',
    codes: {
      command: 'wuwacode',
      // redeemed in-game only
      redeemUrl: null,
    },
    birthdays: null,
    reset: {
      label: 'Tower of Adversity',
      anchor: '2023-10-15T19:59:59Z',
      cycleDays: 14,
    },
  },

  reverse1999: {
    sidebarGame: 'reverse1999',
    title: 'Reverse: 1999',
    checkInUrl: null,
    banner: null,
    // the wiki has no redemption code page
    codes: null,
    birthdays: null,
    reset: {
      label: 'Limbo',
      anchor: '2023-10-15T19:59:59Z',
      cycleDays: 14,
    },
  },
};

/**
 * The three server regions and how far each sits behind the anchor, which is
 * written in Asia server time.
 */
export const RESET_REGIONS = [
  { label: 'Asia', offsetHours: 0 },
  { label: 'Europe', offsetHours: 7 },
  { label: 'America', offsetHours: 13 },
];
