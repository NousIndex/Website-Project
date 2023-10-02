import axios from 'axios';
import cheerio from 'cheerio';

export async function scrapeWebsite() {
    try {
        const response = await axios.get('https://www.pcgamesn.com/genshin-impact/codes-redeem-promo');
        const $ = cheerio.load(response.data);

        // Extract the title
        const title = $('title').text();
        return title;

    } catch (error) {
      console.error('Error:', error);
    }
  }
