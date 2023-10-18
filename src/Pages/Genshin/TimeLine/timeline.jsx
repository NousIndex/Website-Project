import React, { useState, useEffect } from 'react';
import {
  fetchWebsiteHtml,
  extractDataFromIGNHTMLFirstTwoTable,
  extractIGNImageUrls,
} from '../../../APIs/webscrapAPI';
import { scrapeWebsite } from '../../../APIs/genshinCodeAPI';
import './CSS/timeline.css';
import { API_URL } from '../../../API_Config.js';

function ImageGallery() {
  const [imageUrls, setImageUrls] = useState([]);
  const [title, setTitle] = useState('');

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch(
          `${API_URL}api/starrail-banner-get`
        );
        const data = await response.json();
        console.log(data);
      } catch (error) {
        console.error('Error fetching API usage data:', error);
      }
    }
    fetchData();
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
      <div>
        <h2 style={{ color: '#FFFFFF' }}>Table Content</h2>
        <p style={{ color: '#FFFFFF' }}>{title}</p>
      </div>
    </div>
  );
}

export default ImageGallery;
