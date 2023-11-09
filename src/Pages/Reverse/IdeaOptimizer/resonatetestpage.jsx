import React, { useState, useRef, useEffect } from 'react';
import './CSS/resonatepage.css'; // Assuming your styles are in a file called App.css
import { findBestCombinationAPI } from '../../../APIs/reverseIdeaAlgo';
import Reverse1999Sidebar from '../../components/Reverse1999Sidebar';
import Modal from 'react-modal';
import Swal from 'sweetalert2';
import { API_URL } from '../../../API_Config.js';

Modal.setAppElement('#root');

function IdeaPage() {
  const [grid, setGrid] = useState(
    Array(5)
      .fill(null)
      .map(() => Array(5).fill(false))
  );
  const [dragging, setDragging] = useState(false);
  const savedGrid = useRef([]);
  const fieldNames = [
    'Amount',
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

  const initValue = {
    Amount: 0,
    HP: 0,
    ATK: 0,
    'Reality DEF': 0,
    'Mental DEF': 0,
    'Crit Rate': 0,
    'Crit Resist': 0,
    'Crit DMG': 0,
    'DMG Bonus': 0,
    'DMG Reduction': 0,
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [gridGeneration, setGridGeneration] = useState(false);

  const [inputValues, setInputValues] = useState(initValue);

  const [selectedField, setSelectedField] = useState('');

  const [girdWidth, setGridWidth] = useState(0);
  const [gridHeight, setGridHeight] = useState(0);
  const [optimizedGrid, setOptimizedGrid] = useState([[]]);

  const [isWatchListModalOpen, setIsWatchListModalOpen] = useState(false);

  const [resonanceListData, setResonanceListData] = useState([]);

  useEffect(() => {
    fetchResonanceData('SummaryList');
  }, []);

  async function fetchResonanceData(characterFind) {
    // console.log(characterFind);
    try {
      const response = await fetch(
        `${API_URL}api/misc-commands?scrapeCommand=reverse1999resonancesummary&characterFind=${characterFind}`
      );
      const data = await response.json();
      if (characterFind === 'SummaryList') {
        setResonanceListData(data);
        return;
      } else {
        return data;
      }
    } catch (error) {
      console.error('Error fetching API usage data:', error);
    }
  }

  const handleSelectChange = (e) => {
    setSelectedField(e.target.value);
  };

  const handleInputChange = (fieldName, value) => {
    setInputValues((prevValues) => ({
      ...prevValues,
      [fieldName]: value,
    }));
  };

  const handleMouseDown = (row, col) => {
    const newGrid = [...grid];
    newGrid[row][col] = !newGrid[row][col]; // Toggle the state of the initial cell
    setGrid(newGrid);
    setDragging(true);
  };

  const handleMouseEnter = (row, col) => {
    if (dragging) {
      const newGrid = grid.map((rowArr, rowIndex) =>
        rowArr.map((cell, colIndex) =>
          rowIndex === row && colIndex === col ? true : cell
        )
      );
      setGrid(newGrid);
    }
  };

  const handleMouseUp = () => {
    setDragging(false);
  };

  const clearGrid = () => {
    const newGrid = grid.map((row) => row.map(() => false));
    setGrid(newGrid);
    setInputValues(initValue);
  };

  function removeEmptyRowsAndColumns(matrix) {
    const numRows = matrix.length;
    const numCols = matrix[0].length;

    // Find and mark empty rows and columns
    const emptyRows = new Array(numRows).fill(true);
    const emptyCols = new Array(numCols).fill(true);

    for (let i = 0; i < numRows; i++) {
      for (let j = 0; j < numCols; j++) {
        if (matrix[i][j] === true) {
          emptyRows[i] = false;
          emptyCols[j] = false;
        }
      }
    }

    // Create a new matrix without empty rows and columns
    const newMatrix = [];

    for (let i = 0; i < numRows; i++) {
      if (!emptyRows[i]) {
        const newRow = [];
        for (let j = 0; j < numCols; j++) {
          if (!emptyCols[j]) {
            newRow.push(matrix[i][j]);
          }
        }
        newMatrix.push(newRow);
      }
    }

    return newMatrix;
  }

  const handleSaveButton = () => {
    // console.log(grid);
    const downsizedMatrix = removeEmptyRowsAndColumns(grid);
    if (downsizedMatrix.length === 0) {
      alert('Empty grid!');
      return;
    } else if (downsizedMatrix.length > 5 || downsizedMatrix[0].length > 5) {
      alert('Grid too large!');
      return;
    }
    if (Object.keys(inputValues).length === 0) {
      alert('Empty input!');
      return;
    }

    const expectedProperties = [
      'Amount',
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

    for (const prop of expectedProperties) {
      if (!inputValues.hasOwnProperty(prop)) {
        if (prop === 'Amount') {
          alert('Amount is required!');
          return;
        }
        inputValues[prop] = 0;
      }
    }

    // console.log(inputValues);
    savedGrid.current.push({ form: downsizedMatrix, stats: inputValues });
    let matrixString = '';
    downsizedMatrix.forEach((row) => {
      matrixString += ',[';
      matrixString += row.join(',');
      matrixString += ']';
    });
    matrixString += ']';
    matrixString = matrixString.replace(',[', '[[');
      
    console.log(matrixString);
    clearGrid();
  };
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

  useEffect(() => {}, [savedGrid.current]);

  const handleSaveDelete = (index) => {
    savedGrid.current.splice(index, 1);
    // console.log(savedGrid.current);
    clearGrid();
  };
  const handleKeyDown = (e) => {
    // Allow only digits and a decimal point
    const isValidInput = /^[0-9.]$/.test(e.key) || e.key === 'Backspace';
    if (!isValidInput) {
      e.preventDefault();
    }
  };
  const handleKeyDownWidth = (e) => {
    // Allow only digits and a decimal point
    const isValidInput = /^[0-9]$/.test(e.key) || e.key === 'Backspace';
    if (girdWidth.length > 0 && e.key !== 'Backspace') {
      e.preventDefault();
    }
    if (!isValidInput) {
      e.preventDefault();
    }
  };
  const handleKeyDownHeight = (e) => {
    // Allow only digits and a decimal point
    const isValidInput = /^[0-9]$/.test(e.key) || e.key === 'Backspace';
    if (gridHeight.length > 0 && e.key !== 'Backspace') {
      e.preventDefault();
    }
    if (!isValidInput) {
      e.preventDefault();
    }
  };
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

  const handleWidthChange = (value) => {
    setGridWidth(value);
  };
  const handleHeightChange = (value) => {
    setGridHeight(value);
  };

  const generateGrid = async () => {
    const availableShapes = [];
    for (let i = 0; i < savedGrid.current.length; i++) {
      const value = parseInt(savedGrid.current[i]['stats'][selectedField]);
      const amount = parseInt(savedGrid.current[i]['stats']['Amount']);
      availableShapes.push({
        value: value,
        form: savedGrid.current[i]['form'],
        amount: amount,
        symbol: i,
        otherValues: savedGrid.current[i]['stats'],
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
  };

  const handleGenerateClear = () => {
    setGridGeneration(false);
    setOptimizedGrid([[]]);
    setSelectedField('');
  };

  const handleWatchListClick = () => {
    setIsWatchListModalOpen(true);
  };

  const closeWatchList = () => {
    setIsWatchListModalOpen(false);
  };

  async function updateResonanceData(character_name) {
    const requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        character_name: character_name,
        updateData: savedGrid,
        summaryList: resonanceListData,
      }),
    };
    const url = `${API_URL}api/misc-commands?scrapeCommand=reverse1999resonanceupdate`;

    try {
      await fetch(url, requestOptions);
    } catch (error) {
      console.error('Error fetching API usage data:', error);
    }
  }

  const handleGridSaveClick = () => {
    Swal.fire({
      title: `Save Resonance Grids\nEnter a name for this grid:`,
      input: 'text',
      inputValue: '', // Pre-fill the input with the current value
      showCancelButton: true,
      confirmButtonText: 'Save',
      cancelButtonText: 'Cancel',
      inputValidator: (inputValue) => {
        if (!inputValue) {
          return 'You need to provide a new value!';
        }
      },
    }).then((result) => {
      if (result.isConfirmed) {
        const newValue = result.value;
        if (newValue !== '') {
          updateResonanceData(newValue);
        }
      }
    });
  };

  async function handleResonanceListClick(item) {
    savedGrid.current = [];
    const loadedList = await fetchResonanceData(item);
    savedGrid.current = loadedList.current;
    closeWatchList();
    clearGrid();
  }

  return (
    <div className="App">
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
        <div style={{position:'absolute', top:'15vh', left:'28vw'}}>
          <div>
            <button
              className="genshin-wish-searcher-explorer-button no-selection"
              onClick={handleWatchListClick}
            >
              Resonance List
            </button>

            <Modal
              isOpen={isWatchListModalOpen}
              onRequestClose={closeWatchList}
              contentLabel="Watch List Modal"
              className="watchlist-modal"
              overlayClassName="watchlist-overlay"
            >
              <div className={`watchlist-modal-content`}>
                <h2 style={{ color: 'white', fontWeight: 'bold' }}>
                  Resonance List
                </h2>
                <div className="watchlist-item-1999-container">
                  {resonanceListData.map((item, index) => {
                    return (
                      <button
                        className="watchlist-item-1999-button"
                        key={index}
                        onClick={() => handleResonanceListClick(item)}
                      >
                        {item}
                      </button>
                    );
                  })}
                </div>
                <button
                  className="watchlist-close-button"
                  onClick={closeWatchList}
                >
                  x
                </button>
              </div>
            </Modal>
          </div>
          <div className="ideagrid-matrix-display">
            {savedGrid.current.map((grid, index) => (
              <div
                key={index}
                className="ideagrid-display-grid no-selection"
                title={
                  'Click to delete: \n' +
                  JSON.stringify(grid.stats)
                    .replaceAll(',', ',\n')
                    .replaceAll('{', '')
                    .replaceAll('}', '')
                    .replaceAll('"', '')
                    .replaceAll(':', ': ')
                }
                onClick={() => handleSaveDelete(index)}
              >
                {grid.form.map((row, rowIndex) => (
                  <div
                    key={rowIndex}
                    className="row"
                  >
                    {row.map((cell, colIndex) => (
                      <div
                        key={colIndex}
                        className={`ideagrid-display-cell ${
                          cell ? 'highlighted' : ''
                        }`}
                      ></div>
                    ))}
                  </div>
                ))}
              </div>
            ))}
          </div>
          <div className="ideagrid-center-container">
            <div>
              <button
                onClick={clearGrid}
                className="genshin-checkin-button-link"
                style={{ marginBottom: '10px' }}
              >
                Clear Grid
              </button>
              <div className="ideagrid-grid no-selection">
                {grid.map((row, rowIndex) => (
                  <div
                    key={rowIndex}
                    className="row"
                  >
                    {row.map((cell, colIndex) => (
                      <div
                        key={colIndex}
                        className={`ideagrid-cell ${cell ? 'highlighted' : ''}`}
                        onMouseDown={() => handleMouseDown(rowIndex, colIndex)}
                        onMouseEnter={() =>
                          handleMouseEnter(rowIndex, colIndex)
                        }
                        onMouseUp={handleMouseUp}
                      ></div>
                    ))}
                  </div>
                ))}
              </div>
              <button
                onClick={handleSaveButton}
                className="genshin-checkin-button-link"
                style={{ marginTop: '10px' }}
              >
                Save
              </button>
            </div>
            <div className="idea-input-text-container">
              {fieldNames.map((fieldName) => (
                <div key={fieldName}>
                  <label
                    htmlFor={fieldName}
                    className="idea-input-title"
                  >
                    {fieldName}:
                  </label>
                  <input
                    type="text"
                    id={fieldName}
                    name={fieldName}
                    value={inputValues[fieldName] || ''}
                    onChange={(e) =>
                      handleInputChange(fieldName, e.target.value)
                    }
                    onKeyDown={handleKeyDown}
                  />
                </div>
              ))}
            </div>
          </div>
          <div className="ideagrid-footer">
            {savedGrid.current.length > 0 && (
              <button
                className="genshin-checkin-button-link"
                style={{ marginTop: '10px' }}
                onClick={openModal}
              >
                Optimize
              </button>
            )}
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
                        Grid Size:
                      </h3>
                      <input
                        type="text"
                        value={girdWidth || ''}
                        className="ideagrid-input-gridsize"
                        onChange={(e) => handleWidthChange(e.target.value)}
                        onKeyDown={handleKeyDownWidth}
                      ></input>
                      <a
                        style={{
                          fontWeight: 'bold',
                          margin: '0',
                          marginTop: '10px',
                          color: 'white',
                        }}
                      >
                        {' '}
                        &times;{' '}
                      </a>
                      <input
                        type="text"
                        value={gridHeight || ''}
                        className="ideagrid-input-gridsize"
                        onChange={(e) => handleHeightChange(e.target.value)}
                        onKeyDown={handleKeyDownHeight}
                      ></input>
                      <h3
                        style={{
                          fontWeight: 'bold',
                          margin: '0',
                          marginTop: '10px',
                        }}
                      >
                        Select a Field:
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
                      {/* {grid.map((row, rowIndex) => (
                    <div
                      key={rowIndex}
                      className="row"
                    >
                      {row.map((cell, colIndex) => (
                        <div
                          key={colIndex}
                          className={`ideagrid-cell ${
                            cell ? 'highlighted' : ''
                          }`}
                          onMouseDown={() =>
                            handleMouseDown(rowIndex, colIndex)
                          }
                          onMouseEnter={() =>
                            handleMouseEnter(rowIndex, colIndex)
                          }
                          onMouseUp={handleMouseUp}
                        ></div>
                      ))}
                    </div>
                  ))} */}
                      <div className="optimized-grid-full-container">
                        {optimizedGrid.reverse().map((optimizedGridz) => {
                          // console.log(optimizedGridz);
                          return (
                            <div className="optimized-grid-container">
                              <span
                                className="optimized-grid-title"
                                title={JSON.stringify(
                                  optimizedGridz.otherValues
                                )
                                  .replaceAll(',', ',\n')
                                  .replaceAll('{', '')
                                  .replaceAll('}', '')
                                  .replaceAll('"', '')
                                  .replaceAll(':', ': ')}
                              >
                                Total Value: {optimizedGridz.value}
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
                                          savedGrid.current[groupIndex]['stats']
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
                          left: '15vw',
                          zIndex: '1002',
                        }}
                        onClick={handleGenerateClear}
                      >
                        Clear Generation
                      </button>
                      <button
                        className="genshin-checkin-button-link"
                        style={{
                          position: 'absolute',
                          top: '2.2vh',
                          right: '15vw',
                          zIndex: '1002',
                        }}
                        onClick={handleGridSaveClick}
                      >
                        Save
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default IdeaPage;
