import { API_URL } from '../API_Config.js';

const MAX_RESUME_ATTEMPTS = 12;

async function runResumableImport(baseUrl) {
  let cursor = null;

  for (let attempt = 0; attempt < MAX_RESUME_ATTEMPTS; attempt++) {
    const url = cursor
      ? `${baseUrl}&cursor=${encodeURIComponent(JSON.stringify(cursor))}`
      : baseUrl;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();

    if (data.message === 'partial') {
      cursor = data.cursor;
      continue;
    }
    return data.message;
  }
  return 'API Timeout, Please Try Again Later';
}

function extractHoyoAuthkey(wishData) {
  const res = wishData.split('authkey=');
  const res2 = res[1].split('&game');
  return encodeURI(res2[0]);
}

async function runImport(game, authkey, userID) {
  try {
    const baseUrl = `${API_URL}api/draw-import?authkey=${authkey}&userID=${userID}&game=${game}`;
    return await runResumableImport(baseUrl);
  } catch (err) {
    console.log(err);
    if (err.message === 'HTTP error! Status: 504') {
      return 'API Timeout, Please Try Again Later';
    }
    return 'Wrong Authentication Key';
  }
}

export async function genshinWishImportAPI(wishData, userID) {
  return runImport('genshin', extractHoyoAuthkey(wishData), userID);
}

export async function starrailWishImportAPI(wishData, userID) {
  return runImport('starrail', extractHoyoAuthkey(wishData), userID);
}

export async function zzzWishImportAPI(wishData, userID) {
  return runImport('zzz', extractHoyoAuthkey(wishData), userID);
}

export async function wuwaWishImportAPI(wishData, userID) {
  return runImport('wuwa', encodeURIComponent(wishData), userID);
}
