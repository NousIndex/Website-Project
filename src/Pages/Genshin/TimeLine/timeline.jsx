import React, { useState, useEffect } from 'react';
import { fetchWebsiteHtml, extractDataFromIGNHTMLFirstTwoTable, extractIGNImageUrls } from '../../../APIs/webscrapAPI';
import './CSS/timeline.css';
import GenshinSidebar from '../../components/GenshinSidebar';

function ImageGallery() {
  const [imageUrls, setImageUrls] = useState([]);

  useEffect(() => {
    const websiteUrl =
      'https://www.ign.com/wikis/genshin-impact/Banner_Schedule:_Current_and_Next_Genshin_Banners';

    fetchWebsiteHtml(websiteUrl)
      .then((html) => {
        const extractedData = extractIGNImageUrls(html);
        setImageUrls(extractedData);
        // console.log(extractedData);
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  }, []);

  return (
      <div>
        <h1 style={{ color: '#FFFFFF' }}>Image Gallery</h1>
        <div className="image-list-container">
          <div className="image-list">
            {imageUrls.map((imageUrl, index) => (
              <img
                key={index}
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