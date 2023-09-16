import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import LandingPage from './Pages/LandingPage.jsx';
import ParticlesBackground from './Pages/ParticlesBackground.js';
import GenshinHomePage from './Pages/Genshin/homepage.jsx';

function App() {
  useEffect(() => {
    // Change the background color to transparent after a slight delay
    setTimeout(() => {
      document.body.style.backgroundColor = 'transparent';
    }, 100);
  }, []);
  
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/genshin" element={<GenshinHomePage />} />
        </Routes>
      </div>
    <ParticlesBackground />
    </Router>
  );
}

export default App;
