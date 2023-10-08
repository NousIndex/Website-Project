import React, { useState, useEffect } from 'react';
import * as routePaths from '../../../routePaths';
import './CSS/wishtracker.css';
import GenshinSidebar from '../../components/GenshinSidebar';
import banner1 from '../../../assets/Icons/genshin-wish-all.png';
import banner2 from '../../../assets/Icons/genshin-wish-character.png';
import banner3 from '../../../assets/Icons/genshin-wish-weapon.png';
import banner4 from '../../../assets/Icons/genshin-wish-standard.png';
import ItemTable from './wishrecords';
import StatsTable from './wishstats';
import './CSS/wishtable.css';

function WishTracker({ userID }) {
  const [wishAPIData, setWishAPIData] = useState([]);
  const [filterType, setFilterType] = useState('all'); // Default filter type is 'all'
  const [filteredItems, setFilteredItems] = useState([]); // Default filtered items is allItems
  const [searchValue, setSearchValue] = useState('');
  const [userGameId, setUserGameId] = useState(userID); // Default userGameId is empty string

  async function fetchData(userGameId) {
    try {
      const response = await fetch(
        `http://42.60.133.245:7777/api/genshin-draw?userGameId=${userGameId}`
      );
      const data = await response.json();
      setWishAPIData(data);
      setFilteredItems(data);
      // console.log(data);
    } catch (error) {
      console.error('Error fetching API usage data:', error);
    }
  }

  useEffect(() => {
    // 812517138 CL // 812650839 JY // 802199629 XH // 801235702 Hadi

    // Call the fetchData function when the component mounts
    fetchData(userGameId);
  }, [userGameId]); // Specify an empty dependency array to run only once

  // Function to filter items based on type
  const handleFilter = (type) => {
    if (type === 'all') {
      setFilteredItems(wishAPIData);
    } else {
      const filtered = wishAPIData.filter((item) => {
        // Check if DrawType is 'Character Event Wish' or 'Character Event Wish - 2'
        // Treat 'Character Event Wish - 2' as 'Character Event Wish'
        return (
          item.DrawType === type ||
          (type === 'Character Event Wish' &&
            item.DrawType === 'Character Event Wish - 2')
        );
      });
      setFilteredItems(filtered);
    }
    setFilterType(type);
  };

  // Sample image buttons data as an array (you can replace it with your data)
  const imageButtonsArray = [
    {
      imageUrl: banner1,
      text: 'All',
      onClick: () => {
        handleFilter('all');
      },
    },
    {
      imageUrl: banner2,
      text: 'Character',
      onClick: () => {
        handleFilter('Character Event Wish');
      },
    },
    {
      imageUrl: banner3,
      text: 'Weapon',
      onClick: () => {
        handleFilter('Weapon Event Wish');
      },
    },
    {
      imageUrl: banner4,
      text: 'Standard',
      onClick: () => {
        handleFilter('Permanent Wish');
      },
    },
  ];

  // Function to generate the HTML for the buttons in a grid format
  function generateButtonsGrid() {
    return imageButtonsArray.map((button, index) => (
      <button
        key={index}
        className="genshin-wish-image-button no-selection"
        onClick={button.onClick}
      >
        <img
          src={button.imageUrl}
          alt={`Button ${index + 1}`}
        />
        <p>{button.text}</p>
      </button>
    ));
  }

  const handleSearch = () => {
    setUserGameId(searchValue);
  };
  const handleReset = () => {
    setUserGameId(userID);
  };

  return (
    <div className="wishpage-container">
      {/* Left Sidebar Navigation */}
      <GenshinSidebar />

      {/* Main Content */}
      <div className="content">
        <h1 className="wishpage-main-title">
          Wish Tracker
          <a
            href={routePaths.GENSHIN_WISH_TRACKER_IMPORT_PATH}
            className="genshin-checkin-button-link-container no-selection"
          >
            <button className="genshin-checkin-button-link no-selection">
              Import Wish
            </button>
          </a>
          <div className="genshin-wish-searcher-container">
            <span className="genshin-wish-searcher-text">Search UID:</span>
            <input
              type="text"
              placeholder="Enter UID..."
              className="genshin-wish-searcher-input"
              onChange={(e) => setSearchValue(e.target.value)}
            />
            <button
              className="genshin-wish-searcher-button"
              onClick={handleSearch}
            >
              Search
            </button>
            <button
              className="genshin-wish-searcher-reset-button"
              onClick={handleReset}
            >
              My Wish
            </button>
          </div>
        </h1>
        <div class="wish-grid-container">
          <div class="wish-left-grid-container">
            <div class="wish-top-left">{generateButtonsGrid()}</div>
            <div class="wish-bottom-left">
              {filteredItems.length > 0 && <ItemTable items={filteredItems} />}
            </div>
          </div>
          <div class="wish-right-content">
            {wishAPIData.length > 0 && <StatsTable wishes={wishAPIData} />}
          </div>
        </div>
      </div>
    </div>
  );
}

export default WishTracker;
