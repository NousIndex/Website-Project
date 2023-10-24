const cheerio = require('cheerio');

module.exports = async (req, res) => {
  const scrapeCommand = req.query.scrapeCommand;
  if (scrapeCommand === 'starrailbanner') {
    // console.log('Starting StarRail Banner API');
    // Define the URL of the MediaWiki API
    const apiUrl = 'https://honkai-star-rail.fandom.com/api.php';

    // Define the parameters for your API request
    const params = {
      action: 'parse', // You can use 'parse' to retrieve page content
      page: 'Honkai:_Star_Rail_Wiki', // The page you want to fetch data from
      format: 'json', // You can specify the format as JSON
    };
    try {
      // Construct the API URL with parameters
      const url = `${apiUrl}?${new URLSearchParams(params).toString()}`;
      // Fetch data from the API
      const response = await fetch(url);
      const data = await response.json();

      // Extract the content from the response
      const content = data.parse.text['*'];

      // Parse the HTML content using cheerio
      const $ = cheerio.load(content);

      // Find all <img> elements with the data-src attribute
      const firstTable = $('table').eq(3);
      const imageURLSet = new Set();

      firstTable.find('img').each((index, element) => {
        const imageUrl = $(element).attr('data-src');
        if (imageUrl) {
          if (
            !imageUrl.includes('Stellar') &&
            !imageUrl.includes('Departure')
          ) {
            const newImageUrl = imageUrl.split('.png')[0] + '.png';
            imageURLSet.add(newImageUrl);
          }
        }
      });

      let dateText;
      firstTable.find('.lightbox-caption').each((index, element) => {
        const text = $(element).text();
        if (text.includes('From') && text.includes('to')) {
          const re = new RegExp(String.fromCharCode(160), 'g');
          dateText = text
            .split('(')[0]
            .trim()
            .replace(re, ' ')
            .replace('From ', '')
            .replace('to ', ' - ')
            .replaceAll(',', '');
          return false; // Exit the loop once found
        }
      });

      // Convert the Set back to an array (if needed)
      const imageURLArray = Array.from(imageURLSet);

      res.json({ urls: imageURLArray, date: dateText });
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  } else {
    return res.status(400).json({ error: 'Invalid request' });
  }
};
