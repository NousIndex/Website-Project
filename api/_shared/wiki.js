const cheerio = require('cheerio');

// Some sources (prydwen in particular) answer a bare fetch with 403, which is
// what leaves the ZZZ and Wuthering Waves icon and character data empty. A
// User-Agent on its own gets through; adding a partial set of the other browser
// headers does not, since a half-complete browser fingerprint looks more
// automated than none at all. This is best effort -- when it does get blocked
// the last good scrape is served instead (see _shared/scrapeCache.js).
const SCRAPE_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36',
};

async function fetchWikiPage(apiUrl, page) {
  const params = { action: 'parse', page, format: 'json' };
  const url = `${apiUrl}?${new URLSearchParams(params).toString()}`;
  const response = await fetch(url, { headers: SCRAPE_HEADERS });
  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`);
  }
  const data = await response.json();
  if (!data?.parse?.text?.['*']) {
    throw new Error(`Wiki page "${page}" returned no content`);
  }
  return cheerio.load(data.parse.text['*']);
}

async function fetchHtml(url) {
  const response = await fetch(url, { headers: SCRAPE_HEADERS });
  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`);
  }
  return cheerio.load(await response.text());
}

module.exports = { fetchWikiPage, fetchHtml, SCRAPE_HEADERS };
