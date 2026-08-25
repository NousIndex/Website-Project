import { apiFetch, apiFetchOr } from './client';

/**
 * Data access for the draw tracker pages.
 *
 * Every call funnels through apiFetch/apiFetchOr, so a failed request yields an
 * empty result rather than an error object landing in list state.
 */

const WATCH_FIELD = {
  genshin: 'Genshin_Watch',
  starrail: 'StarRail_Watch',
  zzz: 'Zzz_Watch',
  wuwa: 'Wuwa_Watch',
};

export async function getDrawHistory(game, userGameId) {
  if (!userGameId) return [];
  const data = await apiFetchOr(
    [],
    `api/draw-history?game=${game}&userGameId=${encodeURIComponent(userGameId)}`
  );
  return Array.isArray(data) ? data : [];
}

export async function getWatchList(game) {
  const data = await apiFetchOr(null, `api/draw-watchlist?game=${game}&command=get`, {
    auth: true,
  });
  const raw = data?.[WATCH_FIELD[game]];
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function saveWatchList(game, watchList) {
  return apiFetch(`api/draw-watchlist?game=${game}&command=update`, {
    method: 'POST',
    auth: true,
    body: { watchList },
  });
}

export async function getExploreList(game) {
  const data = await apiFetchOr([], `api/draw-watchlist?game=${game}&command=explore`);
  return Array.isArray(data) ? data : [];
}

export async function getIcons(game) {
  const data = await apiFetchOr([], `api/draw-icons?game=${game}`);
  return Array.isArray(data) ? data : [];
}

export async function getItemDatabase(game) {
  const data = await apiFetchOr({}, `api/draw-database?game=${game}`);
  return data && typeof data === 'object' ? data : {};
}

/** Order-insensitive comparison used to skip no-op watchlist saves. */
export function sameWatchList(a, b) {
  if (a === b) return true;
  if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) return false;
  const sortedA = [...a].sort();
  const sortedB = [...b].sort();
  return sortedA.every((value, index) => value === sortedB[index]);
}
