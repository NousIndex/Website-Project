import React, { useState, useRef, useEffect } from 'react';
import './CSS/resonatepage.css'; // Assuming your styles are in a file called App.css
import { findBestCombinationAPI } from '../../../APIs/reverseIdeaAlgo';
import Reverse1999Sidebar from '../../components/Reverse1999Sidebar';
import Modal from 'react-modal';
import {
  fetchR1999CharacterList,
  fetchR1999GetReso,
} from '../../../APIs/webscrapAPI.js';
import { API_URL } from '../../../API_Config.js';

Modal.setAppElement('#root');

function IdeaPage() {
  const [currentGrid, setCurrentGrid] = useState([[]]);
  const [loading, setLoading] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [gridGeneration, setGridGeneration] = useState(false);

  const [selectedField, setSelectedField] = useState('');
  const [selectedCharacterUrl, setSelectedCharacterUrl] = useState('');

  const [girdWidth, setGridWidth] = useState(7);
  const [gridHeight, setGridHeight] = useState(7);
  const [gridLevel, setGridLevel] = useState(1);
  const [optimizedGrid, setOptimizedGrid] = useState([[]]);

  const [characterList, setCharacterList] = useState([]);

  const resonanceLevelList = [
    '1',
    '2',
    '3',
    '4',
    '5',
    '6',
    '7',
    '8',
    '9',
    '10',
    '11',
    '12',
    '13',
    '14',
    '15',
  ];
  const dropDownList = [
    'HP',
    'ATK',
    'Reality DEF',
    'Mental DEF',
    'Crit Rate',
    'Crit Resist',
    'Crit DMG',
    'DMG Bonus',
    'DMG Reduction',
  ];
  const handleSelectChange = (e) => {
    setSelectedField(e.target.value);
  };

  const closeModalOnClickOutside = (e) => {
    if (e.target.classList.contains('draw-modal-overlay')) {
      closeModal();
    }
  };

  useEffect(() => {
    fetchR1999CharacterList().then((res) => setCharacterList(res));
  }, []);

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

  const modalAnimationClass = isModalOpen
    ? isClosing
      ? 'animate__fadeOut animate__faster'
      : 'animate__fadeIn animate__faster'
    : '';
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

  const handleGenerateClear = () => {
    setGridGeneration(false);
    setOptimizedGrid([[]]);
    setSelectedField('');
  };

  const generateGrid = async () => {
    // Set loading to true before starting the generation
    setLoading(true);
    const availableShapes = [];
    const reso = await fetchR1999GetReso(selectedCharacterUrl, gridLevel);
    setCurrentGrid(reso);
    for (let i = 0; i < reso.length; i++) {
      availableShapes.push({
        value: reso[i]['stats'][selectedField] + reso[i]['extraValue'],
        form: reso[i]['form'],
        amount: parseInt(reso[i]['amount']),
        symbol: i,
        otherValues: reso[i]['stats'],
      });
    }
    const girdWidthInt = parseInt(girdWidth);
    const gridHeightInt = parseInt(gridHeight);
    const optimizedGrids = await findBestCombinationAPI(
      girdWidthInt,
      gridHeightInt,
      availableShapes
    );
    // console.log(optimizedGrids);
    setOptimizedGrid(optimizedGrids);
    setGridGeneration(true);
    // After generation is complete, set loading back to false
    setLoading(false);
  };

  const handleCharacterClick = (url) => {
    setSelectedCharacterUrl(url);
    setGridGeneration(false);
    openModal();
  };

  const handleGridLevelClick = (level) => {
    setGridLevel(level);
    switch (level) {
      case '1':
        setGridWidth(4);
        setGridHeight(4);
        break;
      case '2':
        setGridWidth(4);
        setGridHeight(4);
        break;
      case '3':
        setGridWidth(5);
        setGridHeight(4);
        break;
      case '4':
        setGridWidth(5);
        setGridHeight(4);
        break;
      case '5':
        setGridWidth(5);
        setGridHeight(5);
        break;
      case '6':
        setGridWidth(5);
        setGridHeight(5);
        break;
      case '7':
        setGridWidth(6);
        setGridHeight(5);
        break;
      case '8':
        setGridWidth(6);
        setGridHeight(5);
        break;
      case '9':
        setGridWidth(6);
        setGridHeight(6);
        break;
      case '10':
        setGridWidth(7);
        setGridHeight(7);
        break;
      default:
        setGridWidth(7);
        setGridHeight(7);
        break;
    }
  };

  return (
    <div className="Ideagrid-app">
      <div>
        <h1 style={{ color: 'white', fontWeight: 'bold' }}>
          Reverse: 1999 Resonance
        </h1>
        {/* Left Sidebar Navigation */}
        <div className="ideagrid-sidebar">
          <div className="ideagrid-color-sidebar">
            <Reverse1999Sidebar activeTab={'Resonate Optimizer'} />
          </div>
        </div>
        <div style={{ position: 'absolute', top: '10vh', left: '15vw' }}>
          <div className="ideagrid-center-reso-container">
            {characterList.length > 0 &&
              characterList.map((character, index) => (
                <div
                  className="ideagrid-reso-character-container"
                  key={index}
                  onClick={() => handleCharacterClick(character.url)}
                >
                  <div className="ideagrid-character-rarity-image">
                    <img
                      src={character.rarity}
                      alt="Rarity"
                      style={{
                        position: 'absolute',
                        width: '106.3%',
                        top: 10,
                        left: -6,
                        zIndex: 10,
                      }}
                    />
                  </div>
                  <div className="ideagrid-character-element-image">
                    <img
                      src={character.element}
                      alt="Element"
                      style={{
                        position: 'absolute',
                        width: '20%',
                        top: 0,
                        left: 20,
                        zIndex: 10,
                      }}
                    />
                  </div>
                  <div>
                    <img
                      className="ideagrid-character-image"
                      src={character.character}
                      alt="Character"
                      style={{
                        width: '77%',
                      }}
                    />
                  </div>
                  <div className="ideagrid-reso-character-name">
                    {character.name}
                  </div>
                </div>
              ))}
          </div>
        </div>
        {isModalOpen && (
          <div
            className={`draw-modal-overlay animate__animated ${modalAnimationClass}`}
          >
            <div
              className={`draw-modal-content animate__animated ${modalAnimationClass}`}
              style={{ height: '60vh', width: '70vw' }}
            >
              <span
                className="draw-close-button"
                onClick={closeModal}
              >
                &times;
              </span>
              <div className="draw-modal-content-headers">
                <h3
                  style={{
                    fontWeight: 'bold',
                    margin: '0',
                    marginTop: '10px',
                  }}
                >
                  Optimizer {selectedField}:
                </h3>
              </div>
              {!gridGeneration && (
                <div>
                  <h3
                    style={{
                      fontWeight: 'bold',
                      margin: '0',
                      marginTop: '10px',
                    }}
                  >
                    Grid Level:
                  </h3>
                  {resonanceLevelList.map((level, index) => (
                    <button
                      key={index}
                      className="genshin-checkin-button-link"
                      style={{ margin: '5px' }}
                      onClick={() => {
                        handleGridLevelClick(level);
                      }}
                    >
                      {level}
                    </button>
                  ))}
                  <h3
                    style={{
                      fontWeight: 'bold',
                      margin: '0',
                      marginTop: '10px',
                    }}
                  >
                    Level Selected: {gridLevel}
                  </h3>
                  <select
                    value={selectedField}
                    onChange={handleSelectChange}
                  >
                    <option value="">Select a field</option>
                    {dropDownList.map((field, index) => (
                      <option
                        key={index}
                        value={field}
                      >
                        {field}
                      </option>
                    ))}
                  </select>
                  {selectedField && (
                    <div style={{ marginTop: '5px' }}>
                      <button
                        className="genshin-checkin-button-link"
                        onClick={generateGrid}
                      >
                        Generate!
                      </button>
                    </div>
                  )}
                </div>
              )}
              {gridGeneration && (
                <div className="ideagrid-gen-grid no-selection">
                  <div
                    className="optimized-grid-full-container"
                    style={{ marginTop: 20 }}
                  >
                    {optimizedGrid.map((optimizedGridz) => {
                      return (
                        <div className="optimized-grid-container">
                          <span
                            className="optimized-grid-title"
                            title={JSON.stringify(optimizedGridz.otherValues)
                              .replaceAll(',', ',\n')
                              .replaceAll('{', '')
                              .replaceAll('}', '')
                              .replaceAll('"', '')
                              .replaceAll(':', ': ')}
                          >
                            Total Value: {optimizedGridz.value-100}
                          </span>
                          {optimizedGridz.grid.map((row, rowIndex) => (
                            <div
                              key={rowIndex}
                              className="row"
                            >
                              {row.map((cell, colIndex) => {
                                const splitCell = cell.split(':');
                                const groupIndex = splitCell[0];
                                const group = splitCell[1];
                                const cellClass = `ideagrid-cell-gen-grid ideagrid-cell-gen-grid-${group}`;
                                return (
                                  <div
                                    key={colIndex}
                                    className={cellClass}
                                    title={JSON.stringify(
                                      currentGrid[groupIndex]['stats']
                                    )
                                      .replaceAll(',', ',\n')
                                      .replaceAll('{', '')
                                      .replaceAll('}', '')
                                      .replaceAll('"', '')
                                      .replaceAll(':', ': ')}
                                  ></div>
                                );
                              })}
                            </div>
                          ))}
                        </div>
                      );
                    })}
                  </div>
                  <button
                    className="genshin-checkin-button-link"
                    style={{
                      position: 'absolute',
                      top: '2.2vh',
                      left: '32vw',
                      zIndex: '1002',
                    }}
                    onClick={handleGenerateClear}
                  >
                    Clear Generation
                  </button>
                </div>
              )}
              {loading && (
                <div className="loading-overlay">
                  <div className="loading-spinner">Loading...</div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default IdeaPage;
