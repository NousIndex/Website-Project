import React, { useState, useEffect } from 'react';
import axios from 'axios';
import cheerio from 'cheerio';
import './CSS/timeline.css';

function ImageGallery() {
  const [imageUrls, setImageUrls] = useState([]);

  async function fetchWebsiteHtml(url) {
    try {
      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      console.error('Error fetching website content:', error);
      throw error;
    }
  }

  function extractImageUrls(html) {
    const $ = cheerio.load(html);
    const imageUrls = [];

    // Use CSS selectors to find image elements
    $('img').each((index, element) => {
      const imageUrl = $(element).attr('src');
      if (imageUrl) {
        if (imageUrl.startsWith('https://oyster.ignimgs.com/mediawiki/apis.ign.com/genshin-impact/')) {
            // https://oyster.ignimgs.com/mediawiki/apis.ign.com/genshin-impact/2/24/Key_art_EN.png?width=200&quality=20&dpr=0.05
            // remove &quality=20&dpr=0.05 from image url
            const imageUrl = $(element).attr('src').split('?')[0] + '?width=1200';
            console.log(imageUrl);
            imageUrls.push(imageUrl);
        }
      }
    });

    return imageUrls;
  }

  useEffect(() => {
    const websiteUrl =
      'https://www.ign.com/wikis/genshin-impact/Banner_Schedule:_Current_and_Next_Genshin_Banners'; // Replace with the target website URL

    fetchWebsiteHtml(websiteUrl)
      .then((html) => {
        const urls = extractImageUrls(html);
        setImageUrls(urls);
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  }, []);

  return (
    <div>
      <h1>Image Gallery</h1>
      <div className="image-list-container">
        <div className="image-list">
          {imageUrls.map((imageUrl, index) => (
              <img
                src={imageUrl}
                alt={`Image ${index}`}
                className="timeline-images"
              />
          ))}
        </div>
      </div>
    </div>
  );
}

export default ImageGallery;
