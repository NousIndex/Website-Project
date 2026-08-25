# NousIndex

Gacha draw tracker for Genshin Impact, Honkai: Star Rail, Zenless Zone Zero,
Wuthering Waves and Reverse: 1999. React frontend built with Vite, Vercel
serverless functions, MongoDB Atlas for draw data, Supabase for auth and cached
draw history.

## Layout

```
index.html           Vite entry point
src/                 React app
  main.jsx           bootstraps React and loads the global stylesheets
  APIs/              client.js (fetch + auth), drawApi.js (tracker data), scrapers
  games/             per-game config: icons, sidebar navigation, tracker layout
  Pages/             one folder per game
    components/      the shared tracker, records table, randomiser, sidebar
  CSS/pages.css      aggregates every page stylesheet -- see the note in that file
  CSS/mobile.css     small-screen overrides, loaded last
api/                 Vercel serverless functions, CommonJS (one file per endpoint)
  _shared/           mongo, supabase, auth, rate limit, scrape cache helpers
scripts/             one-off maintenance scripts
```

The five game trackers are one component (`Pages/components/DrawTracker.jsx`)
driven by `games/trackerConfig.js`, and the five home pages are one component
(`Pages/components/GameHomePage.jsx`) driven by `games/homeConfig.js`. Stats
and inventory panels stay per game because each game scores pity and rarity
differently.

A home page renders a panel only when its config names a source for it. That
is deliberate: the pages were copies of each other, so ZZZ and Wuthering Waves
had been showing Star Rail's banners and Star Rail's redemption codes, and
Wuthering Waves offered a HoYoLAB check-in for a game HoYoverse does not make.
A game with no source now shows nothing there rather than another game's data.

## Running locally

```bash
npm install
npm start          # or npm run dev -- http://localhost:25565
npm test           # vitest
npm run lint       # eslint
npm run build      # production build into build/
npm run preview    # serve the production build
```

`npm start` serves the frontend only. It calls the deployed functions unless you
set `REACT_APP_API_URL`; to run the functions locally instead, use
`npx vercel dev` with a `.env.local` (see `.env.example`).

Env vars keep the `REACT_APP_` prefix from the Create React App days --
`vite.config.mjs` accepts both that and `VITE_`, so existing Vercel settings
keep working. Note `api/` is CommonJS and must stay that way: adding
`"type": "module"` to package.json would break every serverless function.

## Environment variables

Copy `.env.example` and fill it in. Server-side values are set in the Vercel
project dashboard; `REACT_APP_*` values are inlined into the browser bundle at
build time.

| Variable | Used by | Notes |
| --- | --- | --- |
| `MONGODB_URI` | `api/` | Atlas connection string. Server-side only. |
| `SUPABASE_URL` / `SUPABASE_KEY` | `api/` | `service_role` key. Bypasses RLS — never expose it to the client. |
| `REACT_APP_SUPABASE_URL` / `REACT_APP_SUPABASE_ANON_KEY` | frontend | Anon key; safe in the bundle, RLS applies. |
| `REACT_APP_API_URL` | frontend | Leave empty for same-origin requests. |

## API

All endpoints live under `/api`. Reads that browse public draw data are open;
anything that writes, or that touches the caller's own account, requires the
Supabase access token as `Authorization: Bearer <jwt>` and derives the user id
from the verified token.

| Endpoint | Auth | Purpose |
| --- | --- | --- |
| `draw-history?game=&userGameId=` | no | Draw history, served from the Supabase cache when `SummaryTable.total_items` matches. |
| `draw-icons?game=` | no | Item icons scraped from Fandom (array) or prydwen (dictionary). |
| `draw-database?game=` | no | Character and weapon reference data. |
| `draw-watchlist?game=&command=explore` | no | Known game UIDs for the explorer. |
| `draw-watchlist?game=&command=get\|update` | **yes** | The caller's own watchlist. |
| `draw-import` (POST) | **yes** | Imports draws. `{ game, authkey, cursor }` in the body — the authkey is a game credential and must not travel in a URL. |
| `misc-commands?scrapeCommand=` | write commands only | Wiki scrapes and the Reverse:1999 resonance data. |

Scrape commands: `genshinbanner`, `starrailbanner`, `wuwabanner`,
`genshincode`, `starrailcode`, `zzzcode`, `wuwacode`, `genshinbirthday`,
`reverse1999characterList`, `reverse1999resonancesummary`,
`reverse1999resonanceupdate`.

`draw-import` runs against a time budget; when it runs out it returns
`{ message: 'partial', cursor }` and the client calls again with that cursor
until it gets a final result.

## Maintenance

### Database indexes

The API filters on `UID`, `Game_UID` and `DrawID`, and sorts draw history by
`DrawTime`. Without indexes those are collection scans, and MongoDB aborts a
sort once it exceeds 32 MB — so this gets worse as the draw collections grow.

```bash
MONGODB_URI="mongodb+srv://..." node scripts/create-indexes.js           # report
MONGODB_URI="mongodb+srv://..." node scripts/create-indexes.js --apply   # create
```

The script skips collections that do not exist, leaves existing indexes alone,
and refuses to build the unique `DrawID` index if duplicates are already stored
(it reports the count and builds a non-unique index instead).

### Keeping Supabase awake

Supabase pauses free projects after 7 days of inactivity, and that clock
watches **database** activity. The previous keep-alive listed a storage bucket,
which returned 200 while the project paused anyway, and nothing was scheduled
to call it in the first place.

`/api/keepalive` now writes a timestamp to a table and pings storage, reporting
each separately -- `alive` reflects the database alone. `vercel.json` runs it
daily (Vercel crons only fire on production deployments).
`draw-history?game=keepalive` still works and does the same thing, for any
external pinger already pointed at it.

It needs a table, created once in the Supabase SQL editor:

```sql
create table if not exists public.keepalive (
  id int primary key default 1,
  pinged_at timestamptz not null default now()
);
insert into public.keepalive (id) values (1) on conflict do nothing;
alter table public.keepalive enable row level security;
```

No RLS policy is added on purpose: the anon key then has no access, while the
service_role key the functions use bypasses RLS. Set
`SUPABASE_KEEPALIVE_TABLE` if you name it something else. `pinged_at` in the
dashboard is the proof the cron is really running.

### Rate limits

`draw-import` is capped at 40 requests per user per 5 minutes (one import can
legitimately need a dozen resumed calls), and `draw-history` at 60 per client
per minute. Counters live in the `RateLimits` collection because serverless
instances share no memory. If the database is unreachable the limiter fails
open rather than locking everyone out.

### Where each game's data comes from

| Game | Icons + database | Banners | Codes |
| --- | --- | --- | --- |
| Genshin | genshin fandom | `Wish` page | `Promotional_Code` |
| Star Rail | starrail fandom | `Warp` page | `Redemption_Code` |
| ZZZ | zzz fandom (`Agent/List`, `W-Engine/List`, `Bangboo/List`) | none | `Redemption_Code` |
| Wuthering Waves | wuwa fandom (`Resonator/List`, `Weapon/List`) | `Convene` page | `Redemption_Code` |
| Reverse: 1999 | prydwen (resonance tools only) | none | none |

ZZZ and Wuthering Waves used to read icons and character data from prydwen.gg,
which answers a plain server-side fetch with 403 — so both games had no item
icons and an empty inventory. They read their fandom wikis now
(`api/_shared/wikiList.js`), and scrapers send a browser User-Agent, which is
what prydwen (still used for the Reverse: 1999 resonance data) needs.

### Scraped data

`draw-icons`, `draw-database` and the banner/code commands read from Fandom and
prydwen. Each successful scrape is stored in the `ScrapeCache` collection, and a
scrape that fails or returns nothing usable is served from that last-good copy
with `X-Scrape-Stale: 1` and a shortened CDN cache, so an outage upstream
degrades to slightly stale data instead of an empty tracker. An empty code table
is treated as a legitimate result rather than a failure.

## Adding a game

Most of the tracker UI is shared. For a new game you generally need:

1. an entry in `src/games/config.js` (how `draw-icons` returns icons for it)
2. an entry in `src/games/navigation.js` (sidebar title and links)
3. a `GAME_CONFIG` entry in `api/draw-history.js` and `api/draw-import.js`
4. routes in `src/routePaths.js` and `src/App.js`

## Known gaps

- The Reverse: 1999 summon tracker and its import page are unmodified copies of
  the Star Rail ones: they call `game=starrail` and show Star Rail data. There
  is no Reverse: 1999 gacha import on the backend.
- Inventory and stats panels are still one copy per game (their pity and
  rarity logic genuinely differs); the tracker page, records table, randomiser
  and sidebar are now single shared components.
- The small-screen layout in `src/CSS/mobile.css` has not been checked on a
  real device -- it is a first pass over a layout that previously refused to
  render below 768px at all.
- `src/CSS/pages.css` exists because page styles are global and unscoped;
  scoping them per game would let it go away.
- `api/_shared/drawHistory.js` clamps four-star pity above the 10-draw
  guarantee and reports how often it had to. A non-zero count means draws are
  missing from the stored history, which is worth investigating rather than
  clamping forever.
- ZZZ and Reverse: 1999 have no wiki page listing the banners currently
  running, so those two home pages show no carousel. Adding a source is one
  entry in `games/homeConfig.js`.
- Only the Genshin wiki publishes character birthdays, so the birthday panel
  appears on that game alone.
- `src/Pages/Genshin/TimeLine/timeline.jsx` is a placeholder with no data
  source wired up.
- `npm run lint` reports ~50 warnings in the older pages (unused variables,
  effect dependencies, state mutated in place). CI fails on errors only.
