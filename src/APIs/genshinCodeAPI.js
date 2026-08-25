import axios from 'axios';

export async function scrapeWebsite() {
  try {
    const response = await axios.get(
      'https://www.pcgamesn.com/genshin-impact/codes-redeem-promo'
    );
    // The browser parses the HTML natively, so this no longer needs cheerio.
    const document_ = new DOMParser().parseFromString(
      response.data,
      'text/html'
    );
    return document_.title;
  } catch (error) {
    console.error('Error:', error);
  }
}
