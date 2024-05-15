const cheerio = require('cheerio');
require('dotenv').config();
const { MongoClient, ServerApiVersion } = require('mongodb');

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(process.env.MONGODB_URI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
  ssl: true,
  tlsAllowInvalidCertificates: true, // Set to false in production
  tlsAllowInvalidHostnames: true, // Optional, set to true only for testing
});

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
      const firstTable = $('table').eq(0);
      const imageURLSet = new Set();

      firstTable.find('img').each((index, element) => {
        const imageUrl = $(element).attr('data-src');
        const imageUrl2 = $(element).attr('src');
        if (imageUrl && imageUrl.includes('png')) {
          if (
            !imageUrl.includes('Stellar') &&
            !imageUrl.includes('Departure') &&
            !imageUrl.includes('Item_Unknown.png')
          ) {
            const newImageUrl = imageUrl.split('.png')[0] + '.png';
            imageURLSet.add(newImageUrl);
          }
        } else if (imageUrl2 && imageUrl2.includes('png')) {
          if (
            !imageUrl2.includes('Stellar') &&
            !imageUrl2.includes('Departure') &&
            !imageUrl2.includes('Item_Unknown.png')
          ) {
            const newImageUrl = imageUrl2.split('.png')[0] + '.png';
            imageURLSet.add(newImageUrl);
          }
        }
      });

      let dateText;
      firstTable.find('th').each((index, element) => {
        const text = $(element).text();
        if (text.includes('—')) {
          const re = new RegExp(String.fromCharCode(160), 'g');
          dateText = text.trim().replace('—', '-');
          return false; // Exit the loop once found
        }
      });

      // Convert the Set back to an array (if needed)
      const imageURLArray = Array.from(imageURLSet);

      res.json({ urls: imageURLArray, date: dateText });
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  } else if (scrapeCommand === 'reverse1999banner') {
    // console.log('Starting StarRail Banner API');
    // Define the URL of the MediaWiki API
    const apiUrl = 'https://reverse1999.fandom.com/api.php';

    // Define the parameters for your API request
    const params = {
      action: 'parse', // You can use 'parse' to retrieve page content
      page: 'Reverse:_1999_Wiki', // The page you want to fetch data from
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
      const firstTable = $('table').eq(4);
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
  } else if (scrapeCommand === 'genshincode') {
    // console.log('Starting Genshin Draw Code API');
    // Define the URL of the MediaWiki API
    const apiUrl = 'https://genshin-impact.fandom.com/api.php';

    // Define the parameters for your API request
    const params = {
      action: 'parse', // You can use 'parse' to retrieve page content
      page: 'Promotional_Code', // The page you want to fetch data from
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

      // Find all <table> elements with the data-src attribute
      const table = $('table').eq(0);

      // Extract table rows from the selected table
      const tableRows = table.find('tr');

      // Create an array to store the table data
      const tableData = [];

      // Iterate over the rows and extract cell data
      tableRows.each((index, element) => {
        const columns = $(element).find('td');

        const codeText = columns.eq(0).find('code').eq(0).text().trim();
        //console.log(codeText);
        if (codeText.length > 0) {
          let validText = '';
          columns
            .eq(3)
            .contents()
            .each(function () {
              validText += $(this).text().trim() + ' ';
            });

          if (!validText.toLowerCase().includes('expired')) {
            const regionText = columns.eq(1).text().trim();

            let rewardText = '';
            columns
              .eq(2)
              .find('span.item-text')
              .each(function () {
                rewardText += $(this).text().trim() + '\n';
              });

            const rowData = {
              code: codeText,
              region: regionText,
              reward: rewardText,
              // valid: validText,
            };

            tableData.push(rowData);
          }
        }
      });

      res.json(tableData);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  } else if (scrapeCommand === 'starrailcode') {
    console.log('Starting StarRail Code API');
    // Define the URL of the MediaWiki API
    const apiUrl = 'https://honkai-star-rail.fandom.com/api.php';

    // Define the parameters for your API request
    const params = {
      action: 'parse', // You can use 'parse' to retrieve page content
      page: 'Redemption_Code', // The page you want to fetch data from
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

      // Find all <table> elements with the data-src attribute
      const table = $('table').eq(0);

      // Extract table rows from the selected table
      const tableRows = table.find('tr');

      // Create an array to store the table data
      const tableData = [];

      // Iterate over the rows and extract cell data
      tableRows.each((index, element) => {
        const columns = $(element).find('td');

        const codeText = columns.eq(0).find('code').eq(0).text().trim();
        // console.log(codeText);
        if (codeText.length > 0) {
          let validText = '';
          columns
            .eq(3)
            .contents()
            .each(function () {
              validText += $(this).text().trim() + ' ';
            });
          // console.log(validText);
          if (!validText.toLowerCase().includes('expired')) {
            const regionText = columns.eq(1).text().trim();

            let rewardText = '';
            columns
              .eq(2)
              .find('span.item-text')
              .each(function () {
                rewardText += $(this).text().trim() + '\n';
              });

            const rowData = {
              code: codeText,
              region: regionText,
              reward: rewardText,
              // valid: validText,
            };

            tableData.push(rowData);
          }
        }
      });

      res.json(tableData);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  } else if (scrapeCommand === 'reverse1999resonancesummary') {
    try {
      // Connect the client to the server
      await client.connect();
      // Access the database
      const database = client.db('NousIndex');

      const characterFind = req.query.characterFind;
      // Access the "Reverse1999_Resonance" collection
      const reverse1999ResonanceCollection = database.collection(
        'Reverse1999_Resonance'
      );

      // Find the document with the specified Character_Resonance
      const summary = await reverse1999ResonanceCollection.findOne({
        Character_Resonance: characterFind,
      });
      const resonance = summary.Resonance;
      return res.json(resonance);
    } finally {
      await client.close();
    }
  } else if (scrapeCommand === 'reverse1999resonanceupdate') {
    try {
      // Connect the client to the server
      await client.connect();
      // Access the database
      const database = client.db('NousIndex');

      const { character_name, updateData, summaryList } = req.body;
      let summaryList2 = [];
      if (summaryList) {
        summaryList2 = summaryList;
      }

      summaryList2.push(character_name);

      // Access the "Reverse1999_Resonance" collection
      const reverse1999ResonanceCollection = database.collection(
        'Reverse1999_Resonance'
      );

      // Update the document with the specified Character_Resonance
      await reverse1999ResonanceCollection.updateOne(
        { Character_Resonance: 'SummaryList' }, // Filter condition
        { $set: { Resonance: summaryList2 } } // Update operation
      );

      // Upsert the document with the specified Character_Resonance
      await reverse1999ResonanceCollection.findOneAndUpdate(
        { Character_Resonance: character_name }, // Filter condition
        {
          $setOnInsert: { Character_Resonance: character_name }, // Set character name on insert
          $set: { Resonance: updateData }, // Set/update resonance data
        },
        { upsert: true, returnDocument: 'after' } // Options: upsert if not found, return the updated document
      );
    } finally {
      await client.close();
    }
  } else if (scrapeCommand === 'reverse1999characterList') {
    // console.log('Starting StarRail Banner API');
    // Define the URL of the MediaWiki API
    const apiUrl = 'https://www.prydwen.gg/re1999/characters';

    try {
      // Construct the API URL with parameters
      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      // Log the entire response
      // console.log(response);
      const responseData = await response.text();

      // Parse the HTML content using cheerio
      const $ = cheerio.load(responseData);

      const imageURLSet = new Set();
      const altTextSet = new Set();
      // Find all <img> elements with the data-src attribute
      const charactersList = $('.avatar-card');
      charactersList.each((index, element) => {
        // Find the <img> element inside the current character container
        const imgElement = $(element).find(
          'div[data-gatsby-image-wrapper] picture img'
        );

        // Extract the src and alt attributes
        const src = 'https://www.prydwen.gg' + imgElement.attr('data-src');
        let alt = imgElement.attr('alt').trim().toLowerCase();
        if (alt.includes('6')) {
          alt = 'six';
        } else if (alt.includes('37')) {
          alt = 'thirty-seven';
        } else if (alt.includes('matilda')) {
          alt = 'matilda bouanich';
        }

        imageURLSet.add(src);
        altTextSet.add(alt);
      });

      // Convert the Set back to an array (if needed)
      const imageURLArray = Array.from(imageURLSet);
      const altTextArray = Array.from(altTextSet);
      const imageAltDictionary = {};

      // Iterate over the arrays and create key-value pairs
      for (
        let i = 0;
        i < Math.min(imageURLArray.length, altTextArray.length);
        i++
      ) {
        imageAltDictionary[altTextArray[i]] = imageURLArray[i];
      }

      res.json(imageAltDictionary);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  } else {
    return res.status(400).json({ error: 'Invalid request' });
  }
};
