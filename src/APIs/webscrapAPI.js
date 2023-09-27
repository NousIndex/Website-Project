import axios from "axios";
import cheerio from "cheerio";

// Function to fetch website HTML content
export async function fetchWebsiteHtml(url) {
  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error("Error fetching website content:", error);
    throw error;
  }
}

// Function to extract image URLs from HTML
export function extractImageUrls(html) {
  const $ = cheerio.load(html);
  const imageUrls = [];

  // Use CSS selectors to find image elements
  $("img").each((index, element) => {
    const imageUrl = $(element).attr("src");
    if (imageUrl) {
      imageUrls.push(imageUrl);
    }
  });

  return imageUrls;
}
