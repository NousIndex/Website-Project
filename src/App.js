import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import * as routePaths from './routePaths';
import LandingPage from './Pages/LandingPage.jsx';
import ParticlesBackground from './Pages/ParticlesBackground.js';
import GenshinHomePage from './Pages/Genshin/HomePage/homepage.jsx';
import GenshinWishTrackerPage from './Pages/Genshin/WishTracker/wishtracker';
import GeshinImportWish from './Pages/Genshin/WishTracker/importwish';
import GenshinTimeLine from './Pages/Genshin/TimeLine/timeline';

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
          <Route
            path={routePaths.HOME_PATH}
            element={<LandingPage />}
          />
          <Route
            path={routePaths.GENSHIN_HOME_PATH}
            element={<GenshinHomePage />}
          />
          <Route
            path={routePaths.GENSHIN_WISH_TRACKER_PATH}
            element={<GenshinWishTrackerPage />}
          />
          <Route
            path={routePaths.GENSHIN_WISH_TRACKER_IMPORT_PATH}
            element={<GeshinImportWish />}
          />
          <Route
            path={routePaths.GENSHIN_TIMELINE_PATH}
            element={<GenshinTimeLine />}
          />
        </Routes>
      </div>
      <ParticlesBackground />
    </Router>
  );
}

export default App;
