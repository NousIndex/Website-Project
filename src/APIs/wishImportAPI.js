import { apiFetch, ApiError } from './client';

const MAX_RESUME_ATTEMPTS = 12;

/**
 * Drives one import to completion.
 *
 * The function has a time budget per invocation, so a long history comes back
 * as `partial` plus a cursor; we keep calling until it reports a final result.
 * The authkey travels in the POST body -- it is a credential for the player's
 * game account and has no business in a URL.
 */
async function runResumableImport(game, authkey) {
  let cursor = null;

  for (let attempt = 0; attempt < MAX_RESUME_ATTEMPTS; attempt++) {
    const data = await apiFetch('api/draw-import', {
      method: 'POST',
      auth: true,
      body: cursor ? { game, authkey, cursor } : { game, authkey },
    });

    if (data.message === 'partial') {
      cursor = data.cursor;
      continue;
    }
    return data.message;
  }
  return 'API Timeout, Please Try Again Later';
}

function extractHoyoAuthkey(wishData) {
  const afterKey = String(wishData).split('authkey=')[1];
  if (!afterKey) return null;
  return afterKey.split('&game')[0];
}

async function runImport(game, authkey) {
  if (!authkey) {
    return 'Wrong Authentication Key';
  }
  try {
    return await runResumableImport(game, authkey);
  } catch (error) {
    if (error instanceof ApiError) {
      if (error.status === 401) return 'Please sign in again';
      if (error.status === 504) return 'API Timeout, Please Try Again Later';
      if (error.status >= 500) return 'Import failed, please try again';
    }
    console.error('Import failed:', error);
    return 'Wrong Authentication Key';
  }
}

export async function genshinWishImportAPI(wishData) {
  return runImport('genshin', extractHoyoAuthkey(wishData));
}

export async function starrailWishImportAPI(wishData) {
  return runImport('starrail', extractHoyoAuthkey(wishData));
}

export async function zzzWishImportAPI(wishData) {
  return runImport('zzz', extractHoyoAuthkey(wishData));
}

export async function wuwaWishImportAPI(wishData) {
  return runImport('wuwa', String(wishData || '').trim() || null);
}
