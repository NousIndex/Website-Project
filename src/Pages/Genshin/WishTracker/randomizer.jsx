import React, { useState } from 'react';
import './CSS/randomizer.css';

const RandomiserModal = ({
  isOpen,
  onClose,
  charaSet,
  ownedSet,
  itemIcons,
}) => {
  const [useOwned, setUseOwned] = useState(false);
  const [rollAmount, setRollAmount] = useState(1);

  if (!isOpen) return null;
  const keysArray = Object.keys(ownedSet).filter((key) =>
    charaSet.some((chara) => chara.name === key)
  );

  function generateCharacterImages(character) {
    let itemNameModified = character.name
      .replace(/\s+/g, '_')
      .replace(/'/g, '%27')
      .replace(/!/g, '%21')
      .replace(/,/g, '%2C');
    if (itemNameModified === 'Childe') {
      itemNameModified = 'Tartaglia';
    }

    const iconUrl =
      itemIcons.find((url) => url.includes(itemNameModified)) ||
      'default-image-url';

    return (
      <div className={`wish-character-inventory-div`}>
        <img
          src={iconUrl}
          className="wish-character-inventory-image no-selection"
          style={{
            backgroundImage: character.rarity.includes('5_Stars')
              ? 'linear-gradient(#71433f, #b89574)'
              : 'linear-gradient(#353455, #8754bf)',
          }}
        />
        <img
          src={character.rarity}
          className="wish-character-inventory-rarity no-selection"
        />
        <img
          src={character.element}
          className="wish-character-inventory-element no-selection"
        />
        <img
          src={character.weapon}
          className="wish-character-inventory-weapon no-selection"
        />
        <span className="wish-character-inventory-name">{character.name}</span>
      </div>
    );
  }
  const handleCheckboxChange = () => {
    setUseOwned(!useOwned);
  };
  // Function to handle the select option change
  const handleSelectChange = (event) => {
    setRollAmount(event.target.value);
  };

  const options = Array.from({ length: 8 }, (_, index) => index + 1);

  return (
    <div>
      <div
        className="random-modal-overlay"
        onClick={onClose}
      />
      <div className="random-modal-content">
        <div className="random-modal-content-container">
          <span
            className="random-close-button no-selection"
            onClick={onClose}
          >
            &times;
          </span>
          <h2 className="random-modal-title">Randomizer</h2>
          <div>
            <label>
              Include additional content
              <input
                type="checkbox"
                checked={useOwned}
                onChange={handleCheckboxChange}
              />
            </label>
          </div>
          <div>
            <label>
              Select an option:
              <select
                value={rollAmount}
                onChange={handleSelectChange}
              >
                {' '}
                {options.map((option) => (
                  <option
                    key={option}
                    value={option}
                  >
                    {option}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>
        <div className="random-modal-content-container">
          <h2 className="random-modal-title">Content</h2>
        </div>
      </div>
    </div>
  );
};

export default RandomiserModal;
