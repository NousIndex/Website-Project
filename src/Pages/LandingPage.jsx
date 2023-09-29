import React, { useState, useEffect } from 'react';
import '../fonts/fonts.css';
import '../CSS/LandingPage.css';
// import genshinImage from '../assets/landing_page/genshin.jpg';
import starrailImage from '../assets/landing_page/starrail.webp';
import { useNavigate } from 'react-router-dom';
import { extractNewestKeyArt, fetchWebsiteHtml } from '../APIs/webscrapAPI';

// LandingPage component
const LandingPage = () => {
  const [genshinKeyArtUrl, setgenshinKeyArtUrl] = useState();

  const genshinwebsiteUrl =
    'https://www.ign.com/wikis/genshin-impact/Banner_Schedule:_Current_and_Next_Genshin_Banners';
  const navigate = useNavigate();
  
  useEffect(() => {
    // Change the background color to transparent once the DOM content is loaded
    document.addEventListener('DOMContentLoaded', () => {
      document.body.style.backgroundColor = 'transparent';
    });

    fetchWebsiteHtml(genshinwebsiteUrl)
      .then((html) => {
        const GenshinKeyArt = extractNewestKeyArt(html);
        setgenshinKeyArtUrl(GenshinKeyArt);
        //setCarouselItems((prevCodeItems) => [...prevCodeItems, newItem]);
      })
      .catch((error) => {
        console.error('Error:', error);
      });

  }, []);


  // Define the array of image buttons with image URLs and onClick functions
  const imageButtonsArray = [
    {
      imageUrl: genshinKeyArtUrl,
      onClick: () => {
        navigate('/genshin');
      },
    },
    {
      imageUrl: starrailImage,
      onClick: () => {
        console.log('Button 2 clicked!');
      },
    },
  ];

  // Function to generate the HTML for the buttons in a grid format
  function generateButtonsGrid() {
    return imageButtonsArray.map((button, index) => (
      <button
        key={index}
        className="image-button"
        onClick={button.onClick}
      >
        <img
          src={button.imageUrl}
          alt={`Button ${index + 1}`}
        />
      </button>
    ));
  }

  return (
    <div className="container">
      <h1 className="page-title">NousIndex</h1>
      <div className="buttons-container">{generateButtonsGrid()}</div>
    </div>
  );
};

export default LandingPage;
