import React from 'react';

// Placeholder for the banner timeline. The previous version imported the whole
// scraping API and fired a request whose result it only logged, so the page
// paid for a serverless call and a parser it never used. Wire the gallery to
// api/misc-commands?scrapeCommand=...banner when the feature is built out.
function ImageGallery() {
  const imageUrls = [];
  const title = '';

  return (
    <div>
      <h1 style={{ color: '#FFFFFF' }}>Image Gallery</h1>
      <div className="image-list-container">
        <div className="image-list">
          {imageUrls.map((imageUrl, index) => (
            <img
              key={index}
              src={imageUrl}
              alt={`Banner ${index}`}
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
