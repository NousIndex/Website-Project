const cheerio = require('cheerio');

module.exports = async (req, res) => {
  // console.log('Starting StarRail Database API');
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

    const tableRow = $('tr');
    const tableRow2 = $2('tr');
    const extractedDataCharacter = [];
    const extractedDataWeapon = [];

    tableRow.each((index, element) => {
      const rowData = $(element).find('td');

      const column1Text = rowData.eq(0).find('a').text().trim();
      const column2DataSrc = rowData.eq(1).find('img').attr('data-src');
      const column3DataSrc = rowData.eq(2).find('img').attr('data-src');
      const column4Text = rowData.eq(3).text().trim();
      const column5Text = rowData.eq(4).text().trim();

      if (column1Text) {
        const existingData = extractedDataWeapon.find(
          (data) => data.name === column1Text
        );

        if (!existingData) {
          let hpStat = '';
          let atkStat = '';
          let dfStat = '';

          if (column4Text.toLowerCase() === 'unknown') {
            hpStat = column4Text;
          } else {
            hpStat = column4Text.split('ATK:')[0];
            atkStat = 'ATK:' + column4Text.split('ATK:')[1].split('DEF:')[0];
            dfStat = 'DEF:' + column4Text.split('DEF:')[1];
          }
          const data = {
            name: column1Text,
            rarity: column2DataSrc.split('.png')[0] + '.png',
            type: column3DataSrc.split('.png')[0] + '.png',
            hp: hpStat,
            atk: atkStat,
            df: dfStat,
            passive: column5Text,
          };

          extractedDataWeapon.push(data);
        }
      }
    });

    tableRow2.each((index, element) => {
      const rowData = $(element).find('td');

      const column2Text = rowData.eq(1).find('a').text().trim();
      const column3DataSrc = rowData.eq(2).find('img').attr('data-src');
      const column4DataSrc = rowData.eq(3).find('a img').attr('data-src');
      const column5DataSrc = rowData.eq(4).find('a img').attr('data-src');

      if (column2Text && column2Text !== 'Trailblazer') {
        const existingData = extractedDataCharacter.find(
          (data) => data.name === column2Text
        );

        if (!existingData) {
          const data = {
            name: column2Text,
            rarity: column3DataSrc.split('.png')[0] + '.png',
            element: column4DataSrc.split('.png')[0] + '.png',
            weapon: column5DataSrc.split('.png')[0] + '.png',
          };
          extractedDataCharacter.push(data);
        }
      }
    });
    // Create an array of character objects with keys and release dates
    const characterArray = Object.entries(extractedDataCharacter).map(
      ([name, data]) => ({
        name: data.name,
        rarity: data.rarity,
        element: data.element,
        weapon: data.weapon,
      })
    );

    res.json({
      characters: characterArray,
      weapons: extractedDataWeapon,
    });
  } catch (error) {
    console.error('Error fetching data:', error);
  }
};
