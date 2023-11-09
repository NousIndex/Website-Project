import React, { useState, useRef, useEffect } from 'react';
import './CSS/resonatepage.css'; // Assuming your styles are in a file called App.css
import { findBestCombinationAPI } from '../../../APIs/reverseIdeaAlgo';
import Reverse1999Sidebar from '../../components/Reverse1999Sidebar';
import Modal from 'react-modal';
import { API_URL } from '../../../API_Config.js';

Modal.setAppElement('#root');

function IdeaPage() {
  const savedGrid = useRef([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [gridGeneration, setGridGeneration] = useState(false);


  const [selectedField, setSelectedField] = useState('');

  const [girdWidth, setGridWidth] = useState(0);
  const [gridHeight, setGridHeight] = useState(0);
  const [optimizedGrid, setOptimizedGrid] = useState([[]]);

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
        <div style={{ position: 'absolute', top: '15vh', left: '28vw' }}>
          <div className="ideagrid-center-container"></div>
        </div>
      </div>
    </div>
  );
}

export default IdeaPage;
