const cheerio = require('cheerio');

// Create a function to fetch data from the API
async function fetchData() {
  // Define the URL of the MediaWiki API
  const apiUrl = 'https://genshin-impact.fandom.com/api.php';

  // Define the parameters for your API request
  const params = {
    action: 'parse', // You can use 'parse' to retrieve page content
    page: 'Character/List', // The page you want to fetch data from
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
    const imgElements = $('img[data-src]');

    // Initialize a Set to store filtered data-src values (automatically removes duplicates)
    const filteredDataSrcSet = new Set();

    // Iterate through each matching element
    imgElements.each((index, element) => {
      // Get the value of the data-src attribute for each element
      const dataSrc = $(element).attr('data-src');
      const filteredDataSrc = dataSrc.split('.png')[0] + '.png';
      if (!filteredDataSrcSet.has(filteredDataSrc)) {
        if (filteredDataSrc && filteredDataSrc.includes('Icon')) {
          // If it contains "weapon," add it to the Set
          filteredDataSrcSet.add(filteredDataSrc);
        }
      }
    });

    // Convert the Set back to an array (if needed)
    const filteredDataSrcValues = Array.from(filteredDataSrcSet);
    console.log(filteredDataSrcValues.length);

    // Print the filtered data-src values
    console.log(filteredDataSrcValues);
  } catch (error) {
    console.error('Error fetching data:', error);
  }
}

// Call the fetchData function to retrieve data
fetchData();
