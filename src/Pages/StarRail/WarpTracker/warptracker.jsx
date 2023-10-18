import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import * as routePaths from '../../../routePaths';
import './CSS/warptracker.css';
import StarRailSidebar from '../../components/StarRailSidebar';
import banner1 from '../../../assets/Icons/starrail-pompom.webp';
import banner2 from '../../../assets/Icons/starrail-character.webp';
import banner3 from '../../../assets/Icons/starrail-lc.webp';
import banner4 from '../../../assets/Icons/starrail-standard.webp';
import watchIcon from '../../../assets/Icons/watch_icon.webp';
import watchNoIcon from '../../../assets/Icons/no_watch_icon.webp';
import editIcon from '../../../assets/Icons/edit_icon.webp';
import ItemTable from './warprecords';
import StatsTable from './warpstats';
import './CSS/wishtable.css';
import { API_URL } from '../../../API_Config.js';
import Modal from 'react-modal';

Modal.setAppElement('#root');
// 812517138 CL // 812650839 JY // 802199629 XH // 801235702 Hadi

function WishTracker({ userID }) {
  const [wishAPIData, setWishAPIData] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]); // Default filtered items is allItems
  const [searchValue, setSearchValue] = useState('');
  const [bannerFitler, setBannerFilter] = useState('all');
  const [userGameId, setUserGameId] = useState(userID); // Default userGameId is empty string
  const [itemIcons, setItemIcons] = useState([]);
  const [itemsData, setItemsData] = useState({});
  const [isWatchIcon, setIsWatchIcon] = useState(false);
  const [watchList, setWatchList] = useState([]); // Default watchList is empty array
  const [watchListOriginal, setWatchListOriginal] = useState([]); // Default watchList is empty array
  const [isModalOpen, setIsModalOpen] = useState(false);

  async function updateWatchList() {
    if (watchListOriginal !== watchList) {
      const requestOptions = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userGameId: userID, watchList: watchList }),
      };
      const url = `${API_URL}api/genshin-draw-watchlist-update`;

      try {
        await fetch(url, requestOptions);
        setWatchListOriginal(watchList);
      } catch (error) {
        console.error('Error fetching API usage data:', error);
      }
    }
  }

  async function getWatchList() {
    try {
      const response = await fetch(
        `${API_URL}api/genshin-draw-watchlist-get?userGameId=${userGameId}`
      );
      const data = await response.json();
      console.log(data);
      if (data.error) {
        setWatchList([]);
        setWatchListOriginal([]);
      } else if (data.Genshin_Watch === null) {
        setWatchList([]);
        setWatchListOriginal([]);
      } else {
        setWatchList(data.Genshin_Watch);
        setWatchListOriginal(data.Genshin_Watch);
      }
    } catch (error) {
      console.error('Error fetching API usage data:', error);
    }
  }

  async function fetchData(userGameId) {
    try {
      const response = await fetch(
        `${API_URL}api/genshin-draw?userGameId=${userGameId}`
      );
      const data = await response.json();
      setWishAPIData(data);
      setFilteredItems(data);
      // console.log(data);
    } catch (error) {
      console.error('Error fetching API usage data:', error);
    }
  }

  // async function fetchExploreList() {
  //   try {
  //     const response = await fetch(`${API_URL}api/genshin-draw-explorer`);
  //     const data = await response.json();
  //     console.log(data);
  //   } catch (error) {
  //     console.error('Error fetching API usage data:', error);
  //   }
  // }

  useEffect(() => {
    async function fetchData2() {
      try {
        const response = await fetch(`${API_URL}api/genshin-draw-icons`);
        const data = await response.json();
        setItemIcons(data);
      } catch (error) {
        console.error('Error fetching API usage data:', error);
      }
    }

    // Call the fetchData function when the component mounts
    fetchData2();
    getWatchList();
  }, []); // Specify an empty dependency array to run only once

  useEffect(() => {
    async function fetchData3() {
      try {
        const response = await fetch(`${API_URL}api/genshin-draw-database`);
        const data = await response.json();
        setItemsData(data);
      } catch (error) {
        console.error('Error fetching API usage data:', error);
      }
    }

    // Call the fetchData function when the component mounts
    fetchData3();
  }, []);

  useEffect(() => {
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
  };

  // Sample image buttons data as an array (you can replace it with your data)
  const imageButtonsArray = [
    {
      imageUrl: banner1,
      text: 'All',
      onClick: () => {
        setBannerFilter('all');
        handleFilter('all');
      },
    },
    {
      imageUrl: banner2,
      text: 'Character',
      onClick: () => {
        setBannerFilter('character');
        handleFilter('Character Event Wish');
      },
    },
    {
      imageUrl: banner3,
      text: 'Light Cone',
      onClick: () => {
        setBannerFilter('weapon');
        handleFilter('Weapon Event Wish');
      },
    },
    {
      imageUrl: banner4,
      text: 'Standard',
      onClick: () => {
        setBannerFilter('standard');
        handleFilter('Permanent Wish');
      },
    },
  ];

  // Function to generate the HTML for the buttons in a grid format
  function generateButtonsGrid() {
    return imageButtonsArray.map((button, index) => (
      <button
        key={index}
        className={`starrail-wish-image-button no-selection ${
          bannerFitler === button.text.toLowerCase() ? 'active' : ''
        }`}
        onClick={button.onClick}
      >
        <div className="starrail-wish-image-container">
          <img
            src={button.imageUrl}
            alt={`Button ${index + 1}`}
          />
          <p>{button.text}</p>
        </div>
      </button>
    ));
  }

  const handleSearch = () => {
    setUserGameId(searchValue);
    setBannerFilter('all');
    if (watchList.some((item) => searchValue in item)) {
      setIsWatchIcon(true);
    } else {
      setIsWatchIcon(false);
    }
  };
  const handleModalItemClick = (clicked_object) => {
    setUserGameId(clicked_object);
    setBannerFilter('all');
    if (watchList.some((item) => clicked_object in item)) {
      setIsWatchIcon(true);
    } else {
      setIsWatchIcon(false);
    }
  };
  const handleReset = () => {
    setUserGameId(userID);
    setBannerFilter('all');
  };
  const watchButtonClick = () => {
    if (isWatchIcon) {
      setWatchList(watchList.filter((item) => !(userGameId in item)));
    } else {
      setWatchList((current) => [...current, { [userGameId]: userGameId }]);
    }
    setIsWatchIcon(!isWatchIcon);
  };

  const handleWatchListClick = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleSaveWatchListClick = () => {
    updateWatchList();
  };

  const handleEditWatchListClick = (key, value) => {
    Swal.fire({
      title: `Nickname For ${key}`,
      input: 'text',
      inputValue: value, // Pre-fill the input with the current value
      showCancelButton: true,
      confirmButtonText: 'Save',
      cancelButtonText: 'Cancel',
      inputValidator: (value) => {
        if (!value) {
          return 'You need to provide a new value!';
        }
      },
    }).then((result) => {
      if (result.isConfirmed) {
        const newValue = result.value;
        if (newValue !== value) {
          setWatchList(
            watchList.map((item) => {
              // Check if the targetKey exists in the item object
              if (key in item) {
                // If the targetKey exists, update its value with newValue
                return { [key]: newValue };
              } else {
                // If the targetKey doesn't exist, keep the item unchanged
                return item;
              }
            })
          );
        }
      }
    });
  };

  return (
    <div className="wishpage-container">
      {/* Left Sidebar Navigation */}
      <StarRailSidebar activeTab={'Warp Tracker'} />

      {/* Main Content */}
      <div className="content">
        <h1 className="wishpage-main-title">
          Wish Tracker
          <a
            href={routePaths.GENSHIN_WISH_TRACKER_IMPORT_PATH}
            className="genshin-checkin-button-link-container no-selection"
          >
            <button className="genshin-checkin-button-link no-selection animate__animated animate__pulse animate__delay-1s animate__fast animate__infinite">
              Import Wish
            </button>
          </a>
          <div className="genshin-wish-searcher-container">
            <button
              className="genshin-wish-searcher-reset-button no-selection"
              onClick={handleReset}
            >
              My Wish
            </button>
            <span className="genshin-wish-searcher-text no-selection">
              Search UID:
            </span>
            <input
              type="text"
              placeholder="Enter UID..."
              className="genshin-wish-searcher-input no-selection"
              onChange={(e) => setSearchValue(e.target.value)}
            />
            <button
              className="genshin-wish-searcher-button no-selection"
              onClick={handleSearch}
            >
              Search
            </button>
          </div>
          <div className="genshin-wish-explorer-divider">
            {/* <button
                className="genshin-wish-searcher-explorer-button no-selection"
                onClick={handleExplore}
              >
                Explorer
              </button> */}
            <button
              className="genshin-wish-searcher-explorer-button no-selection"
              onClick={handleWatchListClick}
              disabled={!watchList || watchList.length === 0}
              title={
                !watchList || watchList.length === 0
                  ? 'No items in the watchlist'
                  : ''
              }
            >
              My Watchlist
            </button>

            <Modal
              isOpen={isModalOpen}
              onRequestClose={closeModal}
              contentLabel="Watch List Modal"
              className="watchlist-modal"
              overlayClassName="watchlist-overlay"
            >
              <div className={`watchlist-modal-content`}>
                <h2 style={{ color: 'white', fontWeight: 'bold' }}>
                  Watch List
                </h2>
                {watchList.map((item, index) => (
                  <div className="watchlist-item-container">
                    <button
                      className="watchlist-item-button"
                      onClick={() => {
                        handleModalItemClick(Object.keys(item)[0]);
                        closeModal(); // Call closeModal to close the modal
                      }}
                    >
                      {item[Object.keys(item)[0]]}
                    </button>

                    <img
                      src={editIcon}
                      alt="Edit Icon"
                      className="watchlist-edit-icon"
                      onClick={() =>
                        handleEditWatchListClick(
                          Object.keys(item)[0],
                          item[Object.keys(item)[0]]
                        )
                      }
                    />
                  </div>
                ))}
                <button
                  className="watchlist-close-button"
                  onClick={closeModal}
                >
                  x
                </button>
              </div>
            </Modal>
          </div>
          <div className="genshin-wish-explorer-divider">
            <button
              className="genshin-wish-searcher-explorer-button no-selection"
              onClick={handleSaveWatchListClick}
              style={{
                display: watchList === watchListOriginal ? 'none' : 'block',
              }}
              disabled={watchList === watchListOriginal}
            >
              Save Watchlist Changes!
            </button>
          </div>
        </h1>
        <div class="wish-grid-container">
          <div class="wish-left-grid-container">
            <div class="wish-top-left">
              <img
                src={isWatchIcon ? watchIcon : watchNoIcon}
                alt={isWatchIcon ? 'Watch Icon' : 'No Watch Icon'}
                onClick={watchButtonClick}
                style={{
                  display: userGameId.includes(userID) ? 'none' : 'block',
                }}
                className="wish-watch-icon"
              />
              <h3
                className="wish-watch-id"
                style={{ display: userGameId.length > 16 ? 'none' : 'block' }}
              >
                UID: {userGameId}
              </h3>
              <div className="starrail-button-containers">
                {generateButtonsGrid()}
              </div>
            </div>
            <div class="wish-bottom-left">
              {filteredItems.length > 0 && (
                <ItemTable
                  items={filteredItems}
                  itemIcons={itemIcons}
                />
              )}
            </div>
          </div>
          <div class="wish-right-content">
            <h2>Wish Stats</h2>
            {wishAPIData.length > 0 && Object.keys(itemsData).length > 0 && (
              <StatsTable
                wishes={wishAPIData}
                itemIcons={itemIcons}
                itemsData={itemsData}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default WishTracker;
