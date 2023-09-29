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
export function extractDataFromHTML(html) {
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
        // https://oyster.ignimgs.com/mediawiki/apis.ign.com/genshin-impact/2/24/Key_art_EN.png?width=200&quality=20&dpr=0.05
        // remove &quality=20&dpr=0.05 from image url
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
    
    if (src && alt === 'Key art EN.png' && src.startsWith('https://oyster.ignimgs.com/mediawiki/apis.ign.com/genshin-impact/')) {
      // Modify the image URL to the desired format
      imageUrl = src.split('?')[0] + '?width=1200';
      return false; // Exit the loop as soon as an image is found
    }
  });

  return imageUrl;
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
