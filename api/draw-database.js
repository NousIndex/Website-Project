const cheerio = require('cheerio');

module.exports = async (req, res) => {
  const game = req.query.game;
  console.log(game);
  if (!game) {
    return res.status(400).json({ error: 'Invalid request' });
  }
  if (game === 'genshin') {
    // console.log('Starting Genshin Database API');
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

      const tableRow = $('tr');
      const tableRow2 = $2('tr');
      const extractedDataCharacter = [];
      const extractedDataWeapon = [];

      tableRow.each((index, element) => {
        const rowData = $(element).find('td');

        const column2Text = rowData.eq(1).find('a').text();
        const column3DataSrc = rowData.eq(2).find('img').attr('data-src');
        const column4Text = rowData.eq(3).text();
        let column5Text = rowData.eq(4).text();
        const column6Text = rowData.eq(5).text();

        if (column2Text && column2Text !== 'Prized Isshin Blade') {
          const existingData = extractedDataWeapon.find(
            (data) => data.name === column2Text
          );

          if (column5Text.toLowerCase().includes('elemental mastery')) {
            column5Text = column5Text.replace('Elemental Mastery', 'EM');
          }
          if (column5Text.toLowerCase().includes('physical dmg bonus')) {
            column5Text = column5Text.replace('Physical DMG Bonus', 'Phys DMG');
          }
          if (column5Text.toLowerCase().includes('energy recharge')) {
            column5Text = column5Text.replace('Energy Recharge', 'ER');
          }

          if (!existingData) {
            const data = {
              name: column2Text,
              rarity: column3DataSrc.split('.png')[0] + '.png',
              atk: column4Text,
              sub: column5Text,
              passive: column6Text,
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
        const column8Text = rowData.eq(7).text().trim();

        if (column8Text && column2Text && column2Text !== 'Traveler') {
          const existingData = extractedDataCharacter.find(
            (data) => data.name === column2Text
          );

          if (!existingData) {
            const data = {
              name: column2Text,
              rarity: column3DataSrc.split('.png')[0] + '.png',
              element: column4DataSrc.split('.png')[0] + '.png',
              weapon: column5DataSrc.split('.png')[0] + '.png',
              release: column8Text,
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
          release: data.release,
        })
      );

      // Sort the characterArray by release date (newest first)
      characterArray.sort((a, b) => new Date(b.release) - new Date(a.release));

      res.json({
        characters: characterArray,
        weapons: extractedDataWeapon,
      });
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  } else if (game === 'starrail') {
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
      const typeURLArray = [];
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

        // Find the <img> element inside the current character container
        const typeElement = $(element).find(
          '.floating-element picture img[data-main-image]'
        );
        // Extract the src and alt attributes
        let elementType = '';
        if (typeElement.attr('data-src') === undefined) {
          elementType = 'undefined';
        } else {
          elementType = 'https://www.prydwen.gg' + typeElement.attr('data-src');
        }

        if (!characterName.toLowerCase().includes('rover')) {
          imageURLSet.add(src);
          altTextSet.add(characterName);
          typeURLArray.push(elementType);
        }
      });
      const $2 = cheerio.load(responseData2);
      const imageURLSet2 = new Set();
      const altTextSet2 = new Set();
      const rarityArray = [];
      const attackStats = [];
      const otherStatsName = [];
      const otherStats = [];
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

        const rarElement = $2(element).find('.ww-info strong');
        const weaponRar = rarElement.text()[0];

        const statsElement = $2(element).find('.ww-stats p');
        const weaponStats = statsElement.text().split(': ', 3);
        const attackStat = weaponStats[1].match(/\d{3}/)[0];

        let otherStatName = 'undefined';
        try {
          otherStatName = weaponStats[1].match(/\d+(\w+\s\w+)/)[1];
        } catch (error) {
          otherStatName = weaponStats[1].match(/\d+(\w+)/)[1];
        }
        const otherStat = weaponStats[2];

        imageURLSet2.add(src);
        altTextSet2.add(weaponName);
        rarityArray.push(weaponRar);
        attackStats.push(attackStat);
        otherStatsName.push(otherStatName);
        otherStats.push(otherStat);
      });

      const rarityClasses = $('span a .avatar')
        .filter((index, element) => {
          const empName = $(element).find('.emp-name').text().toLowerCase();
          return !empName.includes('rover');
        })
        .map((index, p) => {
          const classList = $(p).attr('class').split(/\s+/);
          return classList.find((className) => className.startsWith('rarity'));
        })
        .get()
        .filter(Boolean);

      // Convert the Set back to an array (if needed)
      const imageURLArray = Array.from(imageURLSet);
      const altTextArray = Array.from(altTextSet);
      const imageURLArray2 = Array.from(imageURLSet2);
      const altTextArray2 = Array.from(altTextSet2);
      const imageAltDictionary = [];
      const imageAltDictionary2 = [];

      // Iterate over the arrays and create key-value pairs
      for (
        let i = 0;
        i < Math.min(imageURLArray.length, altTextArray.length);
        i++
      ) {
        imageAltDictionary[i] = {
          name: altTextArray[i],
          url: imageURLArray[i],
          type: typeURLArray[i],
          rarity: rarityClasses[i].split('-')[1],
        };
      }

      for (
        let i = 0;
        i < Math.min(imageURLArray2.length, altTextArray2.length);
        i++
      ) {
        let otherStatsName2 = otherStatsName[i];
        if (otherStatsName2.toLowerCase().includes('energy reg')) {
          otherStatsName2 = otherStatsName2.replace('Energy Reg', 'ER');
        }
        otherStatsCombined = otherStatsName2 + ' ' + otherStats[i];
        imageAltDictionary2[i] = {
          name: altTextArray2[i],
          url: imageURLArray2[i],
          rarity: rarityArray[i],
          attack: attackStats[i],
          otherStat: otherStatsCombined,
        };
      }

      res.json({
        characters: imageAltDictionary,
        weapons: imageAltDictionary2,
      });
      // console.log(imageAltDictionary);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  } else {
    return res.status(400).json({ error: 'Invalid request' });
  }
};
