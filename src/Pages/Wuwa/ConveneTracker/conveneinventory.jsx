import React, { useState, useEffect } from 'react';
import randomIcon from '../../../assets/Icons/random_icon.webp';
import RandomiserModal from './randomizer';
import './CSS/conveneinventory.css';
import 'animate.css/animate.min.css';

const WishInventory = ({ itemIcons, itemsData, itemCounter }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [activeTab, setActiveTab] = useState('Character'); // Initialize with 'Character'
  const [isRandomModalOpen, setIsRandomModalOpen] = useState(false);

  const weaponIgnoreList = [
    'Thunderbolt',
    'Augment',
    'Stonard',
    'Lumingloss',
    'Autumntrace',
  ];

  function generateCharacterImages() {
    return itemsData.characters.map((character) => {
      // if (character.name === 'Aloy') {
      //   return;
      // }

      const iconUrl =
        itemIcons[character.name.toLowerCase()] || 'default-image-url';

      const characterConstallation = (
        itemCounter[character.name] - 1
      ).toString();

      return (
        <div
          className={`wish-character-inventory-div ${
            isNaN(characterConstallation) ? 'wish-not-owned' : ''
          }`}
        >
          <img
            src={iconUrl}
            className="wish-character-inventory-image no-selection"
            style={{
              backgroundImage: character.rarity.includes('5')
                ? 'linear-gradient(#71433f, #b89574)'
                : 'linear-gradient(#353455, #8754bf)',
            }}
          />
          <img
            src={
              character.rarity.includes('4')
                ? 'https://static.wikia.nocookie.net/wutheringwaves/images/7/77/Icon_4_Stars.png/revision/latest/scale-to-width-down/115?cb=20240429134633'
                : character.rarity.includes('5')
                ? 'https://static.wikia.nocookie.net/wutheringwaves/images/2/2b/Icon_5_Stars.png/revision/latest/scale-to-width-down/115?cb=20240429134545'
                : 'default-src-for-other-rarities'
            }
            className="wish-character-inventory-rarity no-selection"
          />
          <img
            src={character.type}
            className="wish-character-inventory-element no-selection"
          />
          {/* <img
            src={character.weapon}
            className="wish-character-inventory-weapon no-selection"
          /> */}
          <span className="wish-character-inventory-name">
            {character.name}
          </span>
          {isNaN(characterConstallation) ? null : (
            <span className="wish-character-inventory-constallation no-selection">
              C{characterConstallation}
            </span>
          )}
        </div>
      );
    });
  }

  function generateWeaponImages() {
    return itemsData.weapons.map((weapon) => {
      if (
        weapon.rarity.includes('3') ||
        weapon.rarity.includes('2') ||
        weapon.rarity.includes('1')
      ) {
        return;
      }

      if (weaponIgnoreList.includes(weapon.name)) {
        return;
      }

      const iconUrl =
        itemIcons[weapon.name.toLowerCase()] || 'default-image-url';

      if (iconUrl === 'default-image-url') {
        return;
      }

      const weaponConstallation = (itemCounter[weapon.name] - 1).toString();
      return (
        <div
          className={`wish-weapon-inventory-div ${
            isNaN(weaponConstallation) ? 'wish-not-owned' : ''
          }`}
          // title={weapon.passive}
        >
          <img
            src={iconUrl}
            className="wish-weapon-inventory-image no-selection"
            style={{
              backgroundImage: weapon.rarity.includes('5')
                ? 'linear-gradient(#71433f, #b89574)'
                : weapon.rarity.includes('4')
                ? 'linear-gradient(#353455, #8754bf)'
                : 'linear-gradient(#003B7D, #207cdd)',
            }}
          />

          {/* <img
            src={weapon.type}
            className="warp-weapon-inventory-type no-selection"
          /> */}
          <img
            src={
              weapon.rarity.includes('4')
                ? 'https://static.wikia.nocookie.net/wutheringwaves/images/7/77/Icon_4_Stars.png/revision/latest/scale-to-width-down/115?cb=20240429134633'
                : weapon.rarity.includes('5')
                ? 'https://static.wikia.nocookie.net/wutheringwaves/images/2/2b/Icon_5_Stars.png/revision/latest/scale-to-width-down/115?cb=20240429134545'
                : 'default-src-for-other-rarities'
            }
            className="wish-weapon-inventory-rarity no-selection"
          />
          <span className="warp-weapon-inventory-atk no-selection">
            {' '}
            {weapon.attack}{' '}
          </span>
          <span className="wish-weapon-inventory-sub no-selection   ">
            {' '}
            {weapon.otherStat}{' '}
          </span>
          <span className="wish-weapon-inventory-name">{weapon.name}</span>
          {isNaN(weaponConstallation) ? null : (
            <span className="wish-weapon-inventory-refinement no-selection">
              R{weaponConstallation}
            </span>
          )}
        </div>
      );
    });
  }

  const modalAnimationClass = isModalOpen
    ? isClosing
      ? 'animate__fadeOut animate__faster'
      : 'animate__fadeIn animate__faster'
    : '';

  // Close the modal when the user clicks outside of it
  const closeModalOnClickOutside = (e) => {
    if (e.target.classList.contains('draw-modal-overlay')) {
      closeModal();
    }
  };

  useEffect(() => {
    // Add the click event listener when the modal is open
    if (isModalOpen) {
      document.addEventListener('click', closeModalOnClickOutside);
    } else {
      // Remove the event listener when the modal is closed
      document.removeEventListener('click', closeModalOnClickOutside);
    }

    return () => {
      // Cleanup: remove the event listener when the component unmounts
      document.removeEventListener('click', closeModalOnClickOutside);
    };
  }, [isModalOpen]);

  const openModal = () => {
    setIsModalOpen(true);
    setIsClosing(false);
  };

  const closeModal = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsModalOpen(false);
      setIsClosing(false);
    }, 275);
  };

  const switchTab = (tab) => {
    setActiveTab(tab);
  };
  const openRandomModal = () => {
    setIsRandomModalOpen(true);
  };

  const closeRandomModal = () => {
    setIsRandomModalOpen(false);
  };

  return (
    <div>
      <button
        className="draw-modal-open-button no-selection"
        onClick={openModal}
      >
        Warp Inventory
      </button>
      {isModalOpen && (
        <div
          className={`draw-modal-overlay animate__animated ${modalAnimationClass}`}
        >
          <div
            className={`draw-modal-content animate__animated ${modalAnimationClass}`}
          >
            <span
              className="draw-close-button"
              onClick={closeModal}
            >
              &times;
            </span>
            <div className="draw-modal-content-headers">
              <h3
                style={{ fontWeight: 'bold', margin: '0', marginTop: '10px' }}
              >
                Warp Inventory
                <button
                  className="team-randomiser-button"
                  onClick={openRandomModal}
                >
                  <img src={randomIcon} />
                </button>
              </h3>
              <RandomiserModal
                isOpen={isRandomModalOpen}
                onClose={closeRandomModal}
                charaSet={itemsData.characters}
                ownedSet={itemCounter}
                itemIcons={itemIcons}
              />
              <div className="draw-tab-container">
                <div
                  className={`draw-tab-container-tab ${
                    activeTab === 'Character' ? 'active' : ''
                  }`}
                  onClick={() => switchTab('Character')}
                >
                  Character
                </div>
                <div
                  className={`draw-tab-container-tab ${
                    activeTab === 'Weapon' ? 'active' : ''
                  }`}
                  onClick={() => switchTab('Weapon')}
                >
                  Light Cone
                </div>
              </div>
            </div>
            {activeTab === 'Character' ? (
              <div className="draw-modal-content-container">
                {generateCharacterImages()}
              </div>
            ) : (
              <div className="draw-modal-content-container">
                {generateWeaponImages()}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default WishInventory;
