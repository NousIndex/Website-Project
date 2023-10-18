const cheerio = require('cheerio');

module.exports = async (req, res) => {
  // console.log('Starting StarRail Draw Icons API');
  // Define the URL of the MediaWiki API
  const apiUrl = 'https://honkai-star-rail.fandom.com/api.php';

  // Define the parameters for your API request
  const params = {
    action: 'parse', // You can use 'parse' to retrieve page content
    page: 'Light_Cone/List', // The page you want to fetch data from
    format: 'json', // You can specify the format as JSON
  };
  // Define the URL of the MediaWiki API
  const apiUrl2 = 'https://honkai-star-rail.fandom.com/api.php';

  // Define the parameters for your API request
  const params2 = {
    action: 'parse', // You can use 'parse' to retrieve page content
    page: 'Character/List', // The page you want to fetch data from
    format: 'json', // You can specify the format as JSON
  };
  try {
    // Construct the API URL with parameters
    const url = `${apiUrl}?${new URLSearchParams(params).toString()}`;
    // Construct the API URL with parameters
    const url2 = `${apiUrl2}?${new URLSearchParams(params2).toString()}`;

    // Fetch data from the API
    const response = await fetch(url);
    const data = await response.json();
    // Fetch data from the API
    const response2 = await fetch(url2);
    const data2 = await response2.json();

    // Extract the content from the response
    const content = data.parse.text['*'];
    // Extract the content from the response
    const content2 = data2.parse.text['*'];

    // Parse the HTML content using cheerio
    const $ = cheerio.load(content);
    // Parse the HTML content using cheerio
    const $2 = cheerio.load(content2);

    // Find all <img> elements with the data-src attribute
    const imgElements = $('img[data-src]');

    // Find all <img> elements with the data-src attribute
    const imgElements2 = $2('img[data-src]');

    // Initialize a Set to store filtered data-src values (automatically removes duplicates)
    const filteredDataSrcSet = new Set();

    // Iterate through each matching element
    imgElements2.each((index, element) => {
      // Get the value of the data-src attribute for each element
      const dataSrc2 = $(element).attr('data-src');
      const filteredDataSrc2 = dataSrc2.split('.png')[0] + '.png';
      if (!filteredDataSrcSet.has(filteredDataSrc2)) {
        if (filteredDataSrc2 && filteredDataSrc2.includes('Icon')) {
          // If it contains "weapon," add it to the Set
          filteredDataSrcSet.add(filteredDataSrc2);
        }
      }
    });
    // Iterate through each matching element
    imgElements.each((index, element) => {
      // Get the value of the data-src attribute for each element
      const dataSrc = $(element).attr('data-src');

      // Check if the data-src value contains the word "weapon"
      if (dataSrc && dataSrc.includes('Light_Cone')) {
        // Remove any characters after .png
        const filteredDataSrc = dataSrc.split('.png')[0] + '.png';

        // If it contains "weapon," add it to the Set
        filteredDataSrcSet.add(filteredDataSrc);
      }
    });

    // Convert the Set back to an array (if needed)
    const filteredDataSrcValues = Array.from(filteredDataSrcSet);

    res.json(filteredDataSrcValues);
  } catch (error) {
    console.error('Error fetching data:', error);
  }
};
