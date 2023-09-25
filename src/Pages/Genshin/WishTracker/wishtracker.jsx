import React, { useState } from 'react';
import '../CSS/wishtracker.css';
import GenshinSidebar from '../../components/GenshinSidebar';
import banner1 from '../../../assets/Icons/genshin-wish-all.png';
import banner2 from '../../../assets/Icons/genshin-wish-character.png';
import banner3 from '../../../assets/Icons/genshin-wish-weapon.png';
import banner4 from '../../../assets/Icons/genshin-wish-standard.png';
import ItemTable from './wishrecords';
import './CSS/wishtable.css';
function WishTracker() {  
  
  const allItems = [
    {
        number: 1,
        image1: 'image1.jpg',
        name: 'Item 1',
        text: 'Description of Item 1',
        image2: 'image2.jpg',
        type: 'character',
        time: '10:00 AM',
    },
    {
        number: 2,
        image1: 'image3.jpg',
        name: 'Item 2',
        text: 'Description of Item 2',
        image2: 'image4.jpg',
        type: 'standard',
        time: '2:30 PM',
    },
    // Add more items as needed
  ];

  const [filterType, setFilterType] = useState('all'); // Default filter type is 'all'
  const [filteredItems, setFilteredItems] = useState(allItems);

  const handleFilter = (type) => {
    if (type === 'all') {
      setFilteredItems(allItems);
    } else {
      const filtered = allItems.filter((item) => item.type === type);
      setFilteredItems(filtered);
    }
    setFilterType(type);
  };

  const imageButtonsArray = [
    {
      imageUrl: banner1,
      text: 'All',
      onClick: () => {
        handleFilter('all')
      },
    },
    {
      imageUrl: banner2,
      text: 'Character',
      onClick: () => {
        handleFilter('character')
      }
    },
    {
      imageUrl: banner3,
      text: 'Weapon',
      onClick: () => {
        handleFilter('weapon')
      }
    },
    {
      imageUrl: banner4,
      text: 'Standard',
      onClick: () => {
        handleFilter('standard')  
      }
    },
  ];

  // Function to generate the HTML for the buttons in a grid format
  function generateButtonsGrid() {
    return imageButtonsArray.map((button, index) => (
      <button key={index} className="genshin-wish-image-button" onClick={button.onClick}>
        <img src={button.imageUrl} alt={`Button ${index + 1}`} />
        <p>{button.text}</p>
      </button>
    ));
  }

    return (
      <div className="wishpage-container">
        {/* Left Sidebar Navigation */}
        <GenshinSidebar />
  
        {/* Main Content */}
        <div className="content">
          <h1 className='wishpage-main-title'>Wish Tracker</h1>
          <div class="wish-grid-container">
            <div class="wish-left-grid-container">
              <div class="wish-top-left">
                {generateButtonsGrid()}
              </div>
              <div class="wish-bottom-left">
                  <ItemTable items={filteredItems} />
              </div>
            </div>
            <div class="wish-right-content">
              STATS
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  export default WishTracker;