const cheerio = require('cheerio');

module.exports = async (req, res) => {
  const game = req.query.game;
  if (!game) {
    return res.status(400).json({ error: 'Invalid request' });
  }

  if (game === 'genshin') {
    // console.log('Starting Genshin Draw Icons API');
    // Define the URL of the MediaWiki API
    const apiUrl = 'https://genshin-impact.fandom.com/api.php';

    // Define the parameters for your API request
    const params = {
      action: 'parse', // You can use 'parse' to retrieve page content
      page: 'Weapon/List', // The page you want to fetch data from
      format: 'json', // You can specify the format as JSON
    };
    // Define the URL of the MediaWiki API
    const apiUrl2 = 'https://genshin-impact.fandom.com/api.php';

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
        if (dataSrc && dataSrc.includes('Weapon')) {
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
  } else if (game === 'starrail') {
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
  } else if (game === 'zzz') {
    const apiUrl = 'https://www.prydwen.gg/zenless/characters';
    const apiUrl2 = 'https://www.prydwen.gg/zenless/w-engines';
    const apiUrl3 = 'https://www.prydwen.gg/zenless/bangboo';

    try {
      // Construct the API URL with parameters
      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const response2 = await fetch(apiUrl2);
      if (!response2.ok) {
        throw new Error(`HTTP error! Status: ${response2.status}`);
      }

      const response3 = await fetch(apiUrl3);
      if (!response3.ok) {
        throw new Error(`HTTP error! Status: ${response3.status}`);
      }

      // Log the entire response
      // console.log(response);
      const responseData = await response.text();
      const responseData2 = await response2.text();
      const responseData3 = await response3.text();

      // Parse the HTML content using cheerio
      const $ = cheerio.load(responseData);

      const imageURLSet = new Set();
      const altTextSet = new Set();
      // Find all <img> elements with the data-src attribute
      const charactersList = $('.avatar-card');
      charactersList.each((index, element) => {
        // Find the <img> element inside the current character container
        const imgElement = $(element).find(
          'div[data-gatsby-image-wrapper] img[data-main-image]'
        );
        // Extract the src and alt attributes
        const src = 'https://www.prydwen.gg' + imgElement.attr('data-src');

        const nameElement = $(element).find('span[class="emp-name"]');
        const characterName = nameElement.text();
        if (!characterName.toLowerCase().includes('rover')) {
          imageURLSet.add(src);
          altTextSet.add(characterName);
        }
      });

      const $2 = cheerio.load(responseData2);
      const imageURLSet2 = new Set();
      const altTextSet2 = new Set();
      // Find all <img> elements with the data-src attribute
      const weaponList = $2('.zzz-engine');
      weaponList.each((_index, element) => {
        // Find the <img> element inside the current character container
        const imgElement = $2(element).find(
          'div[data-gatsby-image-wrapper] img[data-main-image]'
        );
        // Extract the src and alt attributes
        const src = 'https://www.prydwen.gg' + imgElement.attr('data-src');

        const nameElement = $2(element).find('.zzz-info h5');
        const weaponName = nameElement.text();

        imageURLSet2.add(src);
        altTextSet2.add(weaponName);
      });

      const $3 = cheerio.load(responseData3);
      const imageURLSet3 = new Set();
      const altTextSet3 = new Set();
      // Find all <img> elements with the data-src attribute
      const bangbooList = $3('.avatar-card');
      bangbooList.each((_index, element) => {
        // Find the <img> element inside the current character container
        const imgElement = $3(element).find(
          'div[data-gatsby-image-wrapper] img[data-main-image]'
        );
        // Extract the src and alt attributes
        const src = 'https://www.prydwen.gg' + imgElement.attr('data-src');

        const nameElement = $3(element).find('span[class="emp-name"]');
        const characterName = nameElement.text();
        if (!characterName.toLowerCase().includes('rover')) {
          imageURLSet3.add(src);
          altTextSet3.add(characterName);
        }
      });

      // Convert the Set back to an array (if needed)
      const imageURLArray = Array.from(imageURLSet);
      const altTextArray = Array.from(altTextSet);
      const imageURLArray2 = Array.from(imageURLSet2);
      const altTextArray2 = Array.from(altTextSet2);
      const imageURLArray3 = Array.from(imageURLSet3);
      const altTextArray3 = Array.from(altTextSet3);
      const imageAltDictionary = {};
      const imageAltDictionary2 = {};
      const imageAltDictionary3 = {};

      // Iterate over the arrays and create key-value pairs
      for (
        let i = 0;
        i < Math.min(imageURLArray.length, altTextArray.length);
        i++
      ) {
        imageAltDictionary[altTextArray[i].toLowerCase()] = imageURLArray[i];
      }

      for (
        let i = 0;
        i < Math.min(imageURLArray2.length, altTextArray2.length);
        i++
      ) {
        imageAltDictionary2[altTextArray2[i].toLowerCase()] = imageURLArray2[i];
      }
      for (
        let i = 0;
        i < Math.min(imageURLArray3.length, altTextArray3.length);
        i++
      ) {
        imageAltDictionary3[altTextArray3[i].toLowerCase()] = imageURLArray3[i];
      }
      combinedDictionary = {
        ...imageAltDictionary,
        ...imageAltDictionary2,
        ...imageAltDictionary3,
      };
      res.json(combinedDictionary);
      // console.log(imageAltDictionary);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  } else if (game === 'wuwa') {
    const apiUrl = 'https://www.prydwen.gg/wuthering-waves/characters';
    const apiUrl2 = 'https://www.prydwen.gg/wuthering-waves/weapons';

    try {
      // Construct the API URL with parameters
      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const response2 = await fetch(apiUrl2);
      if (!response2.ok) {
        throw new Error(`HTTP error! Status: ${response2.status}`);
      }

      // Log the entire response
      // console.log(response);
      const responseData = await response.text();
      const responseData2 = await response2.text();

      // Parse the HTML content using cheerio
      const $ = cheerio.load(responseData);

      const imageURLSet = new Set();
      const altTextSet = new Set();
      // Find all <img> elements with the data-src attribute
      const charactersList = $('.avatar-card');
      charactersList.each((index, element) => {
        // Find the <img> element inside the current character container
        const imgElement = $(element).find(
          'div[data-gatsby-image-wrapper] img[data-main-image]'
        );
        // Extract the src and alt attributes
        const src = 'https://www.prydwen.gg' + imgElement.attr('data-src');

        const nameElement = $(element).find('span[class="emp-name"]');
        const characterName = nameElement.text();

        if (!characterName.toLowerCase().includes('rover')) {
          imageURLSet.add(src);
          altTextSet.add(characterName);
        }
      });
      const $2 = cheerio.load(responseData2);
      const imageURLSet2 = new Set();
      const altTextSet2 = new Set();
      // Find all <img> elements with the data-src attribute
      const weaponList = $2('.ww-weapon-box');
      weaponList.each((_index, element) => {
        // Find the <img> element inside the current character container
        const imgElement = $2(element).find(
          'div[data-gatsby-image-wrapper] img[data-main-image]'
        );
        // Extract the src and alt attributes
        const src = 'https://www.prydwen.gg' + imgElement.attr('data-src');

        const nameElement = $2(element).find('.ww-data h4');
        const weaponName = nameElement.text();

        imageURLSet2.add(src);
        altTextSet2.add(weaponName);
      });

      // Convert the Set back to an array (if needed)
      const imageURLArray = Array.from(imageURLSet);
      const altTextArray = Array.from(altTextSet);
      const imageURLArray2 = Array.from(imageURLSet2);
      const altTextArray2 = Array.from(altTextSet2);
      const imageAltDictionary = {};
      const imageAltDictionary2 = {};

      // Iterate over the arrays and create key-value pairs
      for (
        let i = 0;
        i < Math.min(imageURLArray.length, altTextArray.length);
        i++
      ) {
        imageAltDictionary[altTextArray[i].toLowerCase()] = imageURLArray[i];
      }

      for (
        let i = 0;
        i < Math.min(imageURLArray2.length, altTextArray2.length);
        i++
      ) {
        imageAltDictionary2[altTextArray2[i].toLowerCase()] = imageURLArray2[i];
      }
      combinedDictionary = { ...imageAltDictionary, ...imageAltDictionary2 };
      res.json(combinedDictionary);
      // console.log(imageAltDictionary);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }
};
