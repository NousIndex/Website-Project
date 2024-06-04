import React, { useState } from 'react';
import './CSS/conveneinventory.css';

const RandomiserModal = ({
  isOpen,
  onClose,
  charaSet,
  ownedSet,
  itemIcons,
}) => {
  const [useOwned, setUseOwned] = useState(false);
  const [skipAni, setSkipAni] = useState(false);
  const [rollAmount, setRollAmount] = useState(1);
  const [rollingCharacters, setRollingCharacters] = useState([]);
  const [rollingDone, setRollingDone] = useState(false);
  let randomArray = [];

  if (!isOpen) return null;
  const keysArray = Object.keys(ownedSet).filter((key) =>
    charaSet.some((chara) => chara.name === key)
  );

  const keyArrayAll = charaSet.map(function (obj) {
    return obj.name;
  });

  function generateCharacterImages(characterName) {
    const character = charaSet.find(
      (character) => character.name === characterName
    );
    let itemNameModified = character.name
      .replace(/\s+/g, '_')
      .replace(/'/g, '%27')
      .replace(/!/g, '%21')
      .replace(/,/g, '%2C');
    if (itemNameModified === 'Childe') {
      itemNameModified = 'Tartaglia';
    }

    const iconUrl =
      itemIcons[character.name.toLowerCase()] || 'default-image-url';

    return (
      <div className={`random-character-inventory-div`}>
        <img
          src={iconUrl}
          className="random-character-inventory-image no-selection"
          style={{
            backgroundImage: character.rarity.includes('5')
              ? 'linear-gradient(#71433f, #b89574)'
              : 'linear-gradient(#353455, #8754bf)',
          }}
        />
        <img
          src={
            character.rarity.includes('4')
              ? 'https://static.wikia.nocookie.net/wutheringwaves/images/7/77/Icon_4_Stars.png'
              : character.rarity.includes('5')
              ? 'https://static.wikia.nocookie.net/wutheringwaves/images/2/2b/Icon_5_Stars.png'
              : 'default-src-for-other-rarities'
          }
          cla
          className="random-character-inventory-rarity no-selection"
        />
        {character.type !== 'undefined' && (
          <img
            src={character.type}
            className="convene-character-inventory-element no-selection"
          />
        )}
        <span className="random-wuwa-character-inventory-name">
          {character.name}
        </span>
      </div>
    );
  }
  const handleCheckboxChange = () => {
    setUseOwned(!useOwned);
  };
  const handleCheckbox2Change = () => {
    setSkipAni(!skipAni);
  };
  // Function to handle the select option change
  const handleSelectChange = (event) => {
    setRollAmount(event.target.value);
  };

  let rollCounter = 0;

  function cycleThroughArrayRandomly(index, cycleTime) {
    let selectedCharacter;
    if (useOwned) {
      while (
        selectedCharacter === undefined ||
        randomArray.includes(selectedCharacter)
      ) {
        const randomIndex = Math.floor(Math.random() * keysArray.length);
        selectedCharacter = keysArray[randomIndex];
      }
    } else {
      while (
        selectedCharacter === undefined ||
        randomArray.includes(selectedCharacter)
      ) {
        const randomIndex = Math.floor(Math.random() * keyArrayAll.length);
        selectedCharacter = keyArrayAll[randomIndex];
      }
    }
    setRollingCharacters((prevCharacters) => {
      // Check if an item with the same index already exists
      const itemIndex = prevCharacters.findIndex((item) => item.key === index);

      if (itemIndex !== -1) {
        // If it exists, update the value
        prevCharacters[itemIndex].value = selectedCharacter;
        return [...prevCharacters];
      } else {
        // If it doesn't exist, add a new item
        return [...prevCharacters, { key: index, value: selectedCharacter }];
      }
    });
    if (cycleTime < 600) {
      setTimeout(
        () => cycleThroughArrayRandomly(index, cycleTime),
        Math.floor(Math.random() * 60 + 10)
      );
      cycleTime += Math.floor(Math.random() * 10 + 10);
    } else if (cycleTime < 800) {
      setTimeout(
        () => cycleThroughArrayRandomly(index, cycleTime),
        Math.floor(Math.random() * 20 + 10)
      );
      cycleTime += Math.floor(Math.random() * 20 + 25);
    } else if (cycleTime < 1000) {
      setTimeout(() => cycleThroughArrayRandomly(index, cycleTime), cycleTime);
      cycleTime += Math.floor(Math.random() * 70 + 25);
    } else {
      randomArray.push(selectedCharacter);
      // console.log(randomArray);
      rollCounter += 1;

      // Check if all rolls are done
      if (rollCounter === Number(rollAmount)) {
        console.log('All rolls are complete.');
        setRollingDone(true);

        setTimeout(() => {
          // This code will run after 1000 milliseconds (1 second)
          setRollingDone(false);
        }, 1000);
      }
    }
  }

  const handleRandomize = () => {
    randomArray = [];
    rollCounter = 0;
    setRollingCharacters([]);
    if (skipAni) {
      for (let i = 0; i < rollAmount; i++) {
        let selectedCharacter;
        if (useOwned) {
          while (
            selectedCharacter === undefined ||
            randomArray.includes(selectedCharacter)
          ) {
            const randomIndex = Math.floor(Math.random() * keysArray.length);
            selectedCharacter = keysArray[randomIndex];
          }
          randomArray.push(selectedCharacter);
        } else {
          while (
            selectedCharacter === undefined ||
            randomArray.includes(selectedCharacter)
          ) {
            const randomIndex = Math.floor(Math.random() * keyArrayAll.length);
            selectedCharacter = keyArrayAll[randomIndex];
          }
          randomArray.push(selectedCharacter);
        }
      }
      // generate the images base on the randomArray
      setRollingCharacters(
        randomArray.map((characterName, index) => ({
          key: index,
          value: characterName,
        }))
      );
      console.log('All rolls are complete.');
      setRollingDone(true);

      setTimeout(() => {
        // This code will run after 1000 milliseconds (1 second)
        setRollingDone(false);
      }, 1000);
    } else {
      for (let i = 0; i < rollAmount; i++) {
        const cycleTime2 = i * -300; // Reset cycle time to fast
        setTimeout(() => cycleThroughArrayRandomly(i, cycleTime2), i * 100);
      }
    }
  };

  const options = Array.from({ length: 9 }, (_, index) => index + 1);

  return (
    <div>
      <div
        className="random-modal-overlay"
        onClick={onClose}
      />
      <div className="random-wuwa-modal-content">
        <div className="random-modal-content-container">
          <span
            className="random-close-button no-selection"
            onClick={onClose}
          >
            &times;
          </span>
          <div>
            <h2 className="random-modal-title">Randomizer</h2>
          </div>
          <div className="random-modal-selection-container">
            <div className="random-modal-selection-item no-selection">
              <label className="random-modal-selection-label">
                Use Owned
                <input
                  className="random-modal-checkbox"
                  type="checkbox"
                  checked={useOwned}
                  onChange={handleCheckboxChange}
                />
              </label>
            </div>
            <div className="random-modal-selection-item no-selection">
              <label className="random-modal-selection-label">
                Skip
                <input
                  className="random-modal-checkbox"
                  type="checkbox"
                  checked={skipAni}
                  onChange={handleCheckbox2Change}
                />
              </label>
            </div>
            <div className="random-modal-selection-item no-selection">
              <label className="random-modal-selection-label">
                No. of Rolls:
                <select
                  className="random-modal-select"
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
          <div className="random-modal-selection-item no-selection">
            <button
              className="random-modal-randomize-button no-selection"
              onClick={handleRandomize}
            >
              Randomize!
            </button>
          </div>
        </div>
        <div className="random-modal-content-container">
          <h2 className="random-modal-title">Content</h2>
          <div
            className={`random-result-container ${
              rollingDone
                ? 'animate__animated animate__bounce animate__fast'
                : ''
            }`}
          >
            {rollingCharacters.map((character, index) => (
              <div key={index}>{generateCharacterImages(character.value)}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RandomiserModal;
