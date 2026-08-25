import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Modal from 'react-modal';
import GameSidebar from './GameSidebar';
import ItemTable from './DrawRecordsTable';
import watchIcon from '../../assets/Icons/watch_icon.webp';
import watchNoIcon from '../../assets/Icons/no_watch_icon.webp';
import editIcon from '../../assets/Icons/edit_icon.webp';
import {
  getDrawHistory,
  getExploreList,
  getIcons,
  getItemDatabase,
  getWatchList,
  sameWatchList,
  saveWatchList,
} from '../../APIs/drawApi';

Modal.setAppElement('#root');

async function showAlert(options) {
  const { default: Swal } = await import('sweetalert2');
  return Swal.fire(options);
}

/**
 * The draw tracker page, shared by all five games.
 *
 * `config` comes from games/trackerConfig.js and carries everything that used
 * to make these five pages five separate ~450 line files: banner buttons,
 * wording, links, and which dataset to read. `StatsTable` stays a per-game
 * component because each game scores pity differently.
 */
function DrawTracker({ config, StatsTable, userID }) {
  const GAME = config.game;

  const [wishAPIData, setWishAPIData] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [searchValue, setSearchValue] = useState('');
  const [bannerFitler, setBannerFilter] = useState('all');
  const [userGameId, setUserGameId] = useState(userID);
  const [itemIcons, setItemIcons] = useState([]);
  const [itemsData, setItemsData] = useState({});
  const [isWatchIcon, setIsWatchIcon] = useState(false);
  const [watchList, setWatchList] = useState([]);
  const [exploreList, setExploreList] = useState([]);
  const [watchListOriginal, setWatchListOriginal] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalOpen2, setIsModalOpen2] = useState(false);

  const watchListDirty = !sameWatchList(watchList, watchListOriginal);

  const refreshWatchList = useCallback(async () => {
    const saved = await getWatchList(GAME);
    setWatchList(saved);
    setWatchListOriginal(saved);
  }, [GAME]);

  async function updateWatchList() {
    if (!watchListDirty) return;
    try {
      await saveWatchList(GAME, watchList);
      setWatchListOriginal(watchList);
    } catch (error) {
      console.error('Error saving watchlist:', error);
    }
  }

  useEffect(() => {
    getIcons(GAME).then(setItemIcons);
    getItemDatabase(GAME).then(setItemsData);
    refreshWatchList();
  }, [GAME, refreshWatchList]);

  useEffect(() => {
    let cancelled = false;

    getDrawHistory(GAME, userGameId).then((data) => {
      if (cancelled) return;
      setWishAPIData(data);
      setFilteredItems(data);
    });

    getExploreList(GAME).then((data) => {
      if (!cancelled) setExploreList(data);
    });

    return () => {
      cancelled = true;
    };
  }, [GAME, userGameId]);

  // Filter the table by banner. Some games split one banner across two draw
  // types (`... - 2`); selecting the first has to match both.
  const handleFilter = (type) => {
    if (type === 'all') {
      setFilteredItems(wishAPIData);
      return;
    }
    const merge = config.mergeBanner;
    setFilteredItems(
      wishAPIData.filter(
        (item) =>
          item.DrawType === type ||
          (merge && type === merge.primary && item.DrawType === merge.alias)
      )
    );
  };

  function renderBannerButtons() {
    return config.banners.map((banner, index) => (
      <button
        key={banner.text}
        className={`${config.buttonClass} no-selection ${
          bannerFitler === banner.text.toLowerCase() ? 'active' : ''
        }`}
        onClick={() => {
          setBannerFilter(banner.text.toLowerCase());
          handleFilter(banner.filter);
        }}
      >
        {config.wrapBannerButtons ? (
          <div className="starrail-wish-image-container">
            <img
              src={banner.icon}
              alt={`Button ${index + 1}`}
            />
            <p>{banner.text}</p>
          </div>
        ) : (
          <>
            <img
              src={banner.icon}
              alt={`Button ${index + 1}`}
            />
            <p>{banner.text}</p>
          </>
        )}
      </button>
    ));
  }

  const handleSearch = () => {
    setUserGameId(searchValue);
    setBannerFilter('all');
    setIsWatchIcon(watchList.some((item) => searchValue in item));
  };

  const handleModalItemClick = (clicked_object) => {
    setUserGameId(clicked_object);
    setBannerFilter('all');
    setIsWatchIcon(watchList.some((item) => clicked_object in item));
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

  const handleEditWatchListClick = (key, value) => {
    showAlert({
      title: `Nickname For ${key}`,
      input: 'text',
      inputValue: value,
      showCancelButton: true,
      confirmButtonText: 'Save',
      cancelButtonText: 'Cancel',
      inputValidator: (entered) => {
        if (!entered) {
          return 'You need to provide a new value!';
        }
        return undefined;
      },
    }).then((result) => {
      if (!result.isConfirmed) return;
      const newValue = result.value;
      if (newValue === value) return;
      setWatchList(
        watchList.map((item) => (key in item ? { [key]: newValue } : item))
      );
    });
  };

  return (
    <div className="wishpage-container">
      {/* Left Sidebar Navigation */}
      <GameSidebar
        game={config.sidebarGame}
        activeTab={config.sidebarTab}
      />

      {/* Main Content */}
      <div className="content">
        <h1 className="wishpage-main-title">
          {config.title}
          <Link
            to={config.importPath}
            className="genshin-checkin-button-link-container no-selection"
          >
            <button className="genshin-checkin-button-link no-selection animate__animated animate__pulse animate__delay-1s animate__fast animate__infinite">
              {config.importLabel}
            </button>
          </Link>
          <div className="genshin-wish-searcher-container">
            <button
              className="genshin-wish-searcher-reset-button no-selection"
              onClick={handleReset}
            >
              {config.ownDrawsLabel}
            </button>
            <span className="genshin-wish-searcher-text no-selection">
              Search UID:
            </span>
            <input
              type="text"
              placeholder="Enter UID..."
              className="genshin-wish-searcher-input no-selection"
              onChange={(e) => setSearchValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSearch();
              }}
            />
            <button
              className="genshin-wish-searcher-button no-selection"
              onClick={handleSearch}
            >
              Search
            </button>
          </div>

          <div className="genshin-wish-explorer-divider">
            <button
              className="genshin-wish-searcher-explorer-button no-selection"
              onClick={() => setIsModalOpen(true)}
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
              onRequestClose={() => setIsModalOpen(false)}
              contentLabel="Watch List Modal"
              className="watchlist-modal"
              overlayClassName="watchlist-overlay"
            >
              <div className="watchlist-modal-content">
                <h2 style={{ color: 'white', fontWeight: 'bold' }}>
                  Watch List
                </h2>
                <div className="watchlist-item-container">
                  {watchList.map((item) => {
                    const uid = Object.keys(item)[0];
                    return (
                      <div
                        key={uid}
                        className="watchlist-item-inside-container"
                      >
                        <button
                          className="watchlist-item-button"
                          onClick={() => {
                            handleModalItemClick(uid);
                            setIsModalOpen(false);
                          }}
                        >
                          {item[uid]}
                        </button>

                        <img
                          src={editIcon}
                          alt="Edit Icon"
                          className="watchlist-edit-icon"
                          onClick={() =>
                            handleEditWatchListClick(uid, item[uid])
                          }
                        />
                      </div>
                    );
                  })}
                </div>
                <button
                  className="watchlist-close-button"
                  onClick={() => setIsModalOpen(false)}
                >
                  x
                </button>
              </div>
            </Modal>
          </div>

          <div className="genshin-wish-explorer-divider">
            <button
              className="genshin-wish-searcher-explorer-button no-selection"
              onClick={updateWatchList}
              style={{ display: watchListDirty ? 'block' : 'none' }}
              disabled={!watchListDirty}
            >
              Save Watchlist Changes!
            </button>
          </div>

          <div className="genshin-wish-explorer-divider">
            <button
              className="genshin-wish-searcher-explorer-button no-selection"
              onClick={() => setIsModalOpen2(true)}
              disabled={!exploreList || exploreList.length === 0}
              title={
                !exploreList || exploreList.length === 0
                  ? 'No items in the watchlist'
                  : ''
              }
            >
              Explore List
            </button>

            <Modal
              isOpen={isModalOpen2}
              onRequestClose={() => setIsModalOpen2(false)}
              contentLabel="Explore List Modal"
              className="watchlist-modal"
              overlayClassName="watchlist-overlay"
            >
              <div className="watchlist-modal-content">
                <h2 style={{ color: 'white', fontWeight: 'bold' }}>
                  Explore List
                </h2>
                <div className="watchlist-item-container">
                  {exploreList.map((item) => (
                    <div
                      key={item}
                      className="watchlist-item-inside-container"
                    >
                      <button
                        className="watchlist-item-button"
                        onClick={() => {
                          handleModalItemClick(item);
                          setIsModalOpen2(false);
                        }}
                      >
                        {item}
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  className="watchlist-close-button"
                  onClick={() => setIsModalOpen2(false)}
                >
                  x
                </button>
              </div>
            </Modal>
          </div>
        </h1>

        <div className="wish-grid-container">
          <div className="wish-left-grid-container">
            <div className="wish-top-left">
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
              {config.wrapBannerButtons ? (
                <div className="starrail-button-containers">
                  {renderBannerButtons()}
                </div>
              ) : (
                renderBannerButtons()
              )}
            </div>
            <div className="wish-bottom-left">
              {filteredItems.length > 0 && (
                <ItemTable
                  game={GAME}
                  items={filteredItems}
                  itemIcons={itemIcons}
                />
              )}
            </div>
          </div>
          <div className="wish-right-content">
            <h2>{config.statsTitle}</h2>
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

export default DrawTracker;
