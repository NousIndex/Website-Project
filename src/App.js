import React, { useEffect, useState } from 'react';
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from 'react-router-dom';
import './App.css';
import * as routePaths from './routePaths';
import supabase from './Pages/Supabase';
import LoginPage from './Pages/LoginPage';
import RegisterPage from './Pages/RegistrationPage';
import LandingPage from './Pages/LandingPage.jsx';
import ParticlesBackground from './Pages/ParticlesBackground.js';

import GenshinHomePage from './Pages/Genshin/HomePage/homepage.jsx';
import GenshinWishTrackerPage from './Pages/Genshin/WishTracker/wishtracker';
import GeshinImportWish from './Pages/Genshin/WishTracker/importwish';
import GenshinTimeLine from './Pages/Genshin/TimeLine/timeline';

import StarRailHomePage from './Pages/StarRail/HomePage/homepage.jsx';
import StarRailWishTrackerPage from './Pages/StarRail/WarpTracker/warptracker';
import StarRailImportWish from './Pages/StarRail/WarpTracker/importwarp';

import ReverseHomePage from './Pages/Reverse/HomePage/homepage.jsx';
import ReverseWishTrackerPage from './Pages/Reverse/SummonTracker/summontracker';
import ReverseImportWish from './Pages/Reverse/SummonTracker/importsummon';
import ReverseIdeaPage from './Pages/Reverse/IdeaOptimizer/resonatepage';

function App() {
  const [authenticated, setAuthenticated] = useState(false);
  const [userID, setUserID] = useState('');
  const [loading, setLoading] = useState(true); // Add loading state

  useEffect(() => {
    setTimeout(() => {
      document.body.style.backgroundColor = 'transparent';
    }, 100);
    // Check if the user is authenticated
    checkAuth();
  }, []);

  async function checkAuth() {
    // Implement your authentication logic here to determine if the user is authenticated
    const currentUser = await supabase.auth.getUser();
    // console.log(currentUser);
    if (currentUser.error) {
      setAuthenticated(false);
    } else {
      setUserID(currentUser.data.user.id);
      setAuthenticated(true);
    }
    setLoading(false); // Set loading to false once the check is complete
  }

  // Check if the viewport width is less than a certain threshold (e.g., 768px for mobile devices)
  const isMobile = window.innerWidth < 768;

  // If loading, display a loading indicator
  if (loading) {
    return <div>Loading...</div>;
  }

  // If it's a mobile device, you can redirect to a mobile-specific route or show a message
  if (isMobile) {
    return (
      <div>
        {' '}
        <span style={{ color: 'white', fontWeight: 'bold' }}>
          This website is not accessible on mobile devices.
        </span>
      </div>
    );
  }

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route
            path={routePaths.LOGIN_PATH}
            element={
              <LoginPage
                setAuthenticated={setAuthenticated}
                setUserID={setUserID}
              />
            }
          />
          <Route
            path={routePaths.REGISTER_PATH}
            element={<RegisterPage />}
          />

          {/* Protected routes */}
          {authenticated ? (
            <>
              <Route
                path={routePaths.GENSHIN_HOME_PATH}
                element={<GenshinHomePage />}
              />
              <Route
                path={routePaths.GENSHIN_WISH_TRACKER_PATH}
                element={<GenshinWishTrackerPage userID={userID} />}
              />
              <Route
                path={routePaths.GENSHIN_WISH_TRACKER_IMPORT_PATH}
                element={<GeshinImportWish userID={userID} />}
              />
              <Route
                path={routePaths.GENSHIN_TIMELINE_PATH}
                element={<GenshinTimeLine />}
              />
              <Route
                path={routePaths.HOME_PATH}
                element={<LandingPage />}
              />
              <Route
                path={routePaths.STARRAIL_HOME_PATH}
                element={<StarRailHomePage />}
              />
              <Route
                path={routePaths.STARRAIL_WISH_TRACKER_PATH}
                element={<StarRailWishTrackerPage userID={userID} />}
              />
              <Route
                path={routePaths.STARRAIL_WISH_TRACKER_IMPORT_PATH}
                element={<StarRailImportWish userID={userID} />}
              />
              <Route
                path={routePaths.REVERSE_HOME_PATH}
                element={<ReverseHomePage />}
              />
              <Route
                path={routePaths.REVERSE_WISH_TRACKER_PATH}
                element={<ReverseWishTrackerPage userID={userID} />}
              />
              <Route
                path={routePaths.REVERSE_WISH_TRACKER_IMPORT_PATH}
                element={<ReverseImportWish userID={userID} />}
              />
              <Route
                path={routePaths.REGISTER_PATH_RESONATE_OPTIMIZER}
                element={<ReverseIdeaPage />}
              />
            </>
          ) : (
            // Redirect unauthenticated users to the login page
            <Route
              path="/"
              element={<Navigate to="/login" />}
            />
          )}
        </Routes>
      </div>
      <ParticlesBackground
        authenticated={authenticated}
        setAuthenticated={setAuthenticated}
      />
    </Router>
  );
}

export default App;
