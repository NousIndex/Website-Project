const cheerio = require('cheerio');

async function fetchWikiPage(apiUrl, page) {
  const params = { action: 'parse', page, format: 'json' };
  const url = `${apiUrl}?${new URLSearchParams(params).toString()}`;
  const response = await fetch(url);
  const data = await response.json();
  return cheerio.load(data.parse.text['*']);
}

async function fetchHtml(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`);
  }
  return cheerio.load(await response.text());
}

module.exports = { fetchWikiPage, fetchHtml };
