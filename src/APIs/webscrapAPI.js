import axios from 'axios';
import cheerio from 'cheerio';

// Function to fetch website HTML content
export async function fetchWebsiteHtml(url) {
  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching website content:', error);
    throw error;
  }
}

// Function to extract image URLs and text from HTML for first 2 tables
export function extractDataFromIGNHTMLFirstTwoTable(html) {
  const $ = cheerio.load(html);
  const firstTableData = { imageUrls: [], boldText: [] };
  const secondTableData = { imageUrls: [], boldText: [] };

  // Select the first two tables using CSS selectors
  const firstTable = $('table').eq(0);
  const secondTable = $('table').eq(1);

  // Extract <img> elements and <b> elements from the first table
  firstTable.find('img').each((index, element) => {
    const imageUrl = $(element).attr('src');
    if (imageUrl) {
      if (
        imageUrl.startsWith(
          'https://oyster.ignimgs.com/mediawiki/apis.ign.com/genshin-impact/'
        )
      ) {
        const imageUrl = $(element).attr('src').split('?')[0] + '?width=1200';
        firstTableData.imageUrls.push(imageUrl);
      }
    }
  });

  firstTable.find('b').each((index, element) => {
    const text = $(element).text();
    if (text) {
      firstTableData.boldText.push(text);
    }
  });

  // Extract <img> elements and <b> elements from the second table
  secondTable.find('img').each((index, element) => {
    const imageUrl = $(element).attr('src');
    if (imageUrl) {
      if (
        imageUrl.startsWith(
          'https://oyster.ignimgs.com/mediawiki/apis.ign.com/genshin-impact/'
        )
      ) {
        // https://oyster.ignimgs.com/mediawiki/apis.ign.com/genshin-impact/2/24/Key_art_EN.png?width=200&quality=20&dpr=0.05
        // remove &quality=20&dpr=0.05 from image url
        const imageUrl = $(element).attr('src').split('?')[0] + '?width=1200';
        secondTableData.imageUrls.push(imageUrl);
      }
    }
  });

  secondTable.find('b').each((index, element) => {
    const text = $(element).text();
    if (text) {
      secondTableData.boldText.push(text);
    }
  });

  // Log the extracted image URLs and bold text for each table
  // console.log('Data from First Table:');
  // console.log(firstTableData);

  // console.log('\nData from Second Table:');
  // console.log(secondTableData);

  return { firstTableData, secondTableData };
}

// Function to extract the newest Key Art image URL from HTML
export function extractNewestKeyArt(html) {
  const $ = cheerio.load(html);
  let imageUrl = null;

  // Use CSS selectors to find image elements
  $('img').each((index, element) => {
    const src = $(element).attr('src');
    const alt = $(element).attr('alt');

    if (
      src &&
      alt === 'Key art EN.png' &&
      src.startsWith(
        'https://oyster.ignimgs.com/mediawiki/apis.ign.com/genshin-impact/'
      )
    ) {
      // Modify the image URL to the desired format
      imageUrl = src.split('?')[0] + '?width=1200';
      return false; // Exit the loop as soon as an image is found
    }
  });

  return imageUrl;
}

function IGNGenshinBannerDateFormater(date) {
  // Define month names mapping
  const monthNames = {
    Jan: 0,
    January: 0,
    Feb: 1,
    February: 1,
    Mar: 2,
    March: 2,
    Apr: 3,
    April: 3,
    May: 4,
    Jun: 5,
    June: 5,
    Jul: 6,
    July: 6,
    Aug: 7,
    August: 7,
    Sep: 8,
    September: 8,
    Sept: 8,
    Oct: 9,
    October: 9,
    Nov: 10,
    November: 10,
    Dec: 11,
    December: 11,
  };
  if (date === 'October 14 - November 1, 202') {
    date = 'October 14 - November 1, 2020';
  }
  // Regular expression patterns for both date formats
  const datePattern1 =
    /^(\w{3,20}) (\d{1,2}), (\d{4}) - (\w{3,20}) (\d{1,2}), (\d{4})$/;
  const datePattern2 = /^(\w{3,20} \d{1,2}) - (\w{3,20} \d{1,2}, \d{4})$/;

  // Try to match both patterns
  const match1 = date.match(datePattern1);
  const match2 = date.match(datePattern2);

  if (match1) {
    // Format 1: Month Day, Year - Month Day, Year
    const [, startMonth, startDay, startYear, endMonth, endDay, endYear] =
      match1;
    const startDate = new Date(
      startYear,
      monthNames[startMonth],
      parseInt(startDay)
    );
    const endDate = new Date(endYear, monthNames[endMonth], parseInt(endDay));
    return { startDate, endDate };
  } else if (match2) {
    // Format 2: Month Day, Year - Month Day, Year
    const [, startDateStr, endDateStr] = match2;
    const [endDateStr2, YearDateStr] = endDateStr.split(', ');
    const startDate = new Date(startDateStr + ' ' + YearDateStr);
    const endDate = new Date(endDateStr2 + ' ' + YearDateStr);
    return { startDate, endDate };
  } else {
    // Invalid date format
    console.error('Invalid date format:', date);
    return null;
  }
}

// Function to extract image URLs from HTML
export function extractIGNImageUrls(html) {
  const $ = cheerio.load(html);
  let firstTableData = '';
  const bannerDates = [];

  // Select the first two tables using CSS selectors
  const firstTable = $('table').eq(0);
  firstTable.find('b').each((index, element) => {
    const text = $(element).text();
    if (text) {
      if (index === 1) {
        firstTableData = text;
        return;
      }
    }
  });
  
  // Create a temporary div element to parse the HTML content
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;

  // Find all table elements within the div
  const tables = tempDiv.querySelectorAll('table');
  bannerDates.push(IGNGenshinBannerDateFormater(firstTableData));

  // Iterate through all tables
  tables.forEach((table) => {
    // Find all rows within the table
    const rows = table.querySelectorAll('tr');

    // Iterate through rows and extract the date information
    rows.forEach((row) => {
      // Find all cells within the row
      const cells = row.querySelectorAll('td');

      if (cells.length >= 3) {
        // Ensure there are at least 3 cells in the row
        let date = cells[2].textContent.trim(); // Extract and trim the text from the third cell (index 2)
        const dates = IGNGenshinBannerDateFormater(date);
        bannerDates.push(dates);
      }
    });
  });

  return bannerDates;
}

// // Function to extract image URLs from HTML
// export function extractImageUrls(html) {
//   const $ = cheerio.load(html);
//   const imageUrls = [];

//   // Use CSS selectors to find image elements
//   $('img').each((index, element) => {
//     const imageUrl = $(element).attr('src');
//     const altTitle = $(element).attr('alt');
//     if (imageUrl) {
//       if (imageUrl.startsWith('https://oyster.ignimgs.com/mediawiki/apis.ign.com/genshin-impact/')) {
//           // https://oyster.ignimgs.com/mediawiki/apis.ign.com/genshin-impact/2/24/Key_art_EN.png?width=200&quality=20&dpr=0.05
//           // remove &quality=20&dpr=0.05 from image url
//           const imageUrl = $(element).attr('src').split('?')[0] + '?width=1200';
//           console.log(altTitle);
//           console.log(imageUrl);
//           imageUrls.push(imageUrl);
//       }
//     }
//   });

//   return imageUrls;
// }
