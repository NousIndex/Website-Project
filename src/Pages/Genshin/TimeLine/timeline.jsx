import React, { useState, useEffect } from 'react';
import { fetchWebsiteHtml, extractDataFromHTML, scrapeWeaponData } from '../../../APIs/webscrapAPI';
import './CSS/timeline.css';
import GenshinSidebar from '../../components/GenshinSidebar';

function ImageGallery() {
  const [imageUrls, setImageUrls] = useState([]);

  useEffect(() => {
    const websiteUrl =
      'https://wiki.hoyolab.com/pc/genshin/aggregate/weapon';

    fetchWebsiteHtml(websiteUrl)
      .then((html) => {
        const extractedData = scrapeWeaponData(html);
        console.log(extractedData);
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