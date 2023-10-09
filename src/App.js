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
import LandingPage from './Pages/LandingPage.jsx';
import ParticlesBackground from './Pages/ParticlesBackground.js';
import GenshinHomePage from './Pages/Genshin/HomePage/homepage.jsx';
import GenshinWishTrackerPage from './Pages/Genshin/WishTracker/wishtracker';
import GeshinImportWish from './Pages/Genshin/WishTracker/importwish';
import GenshinTimeLine from './Pages/Genshin/TimeLine/timeline';
import LoginPage from './Pages/LoginPage';
import RegisterPage from './Pages/RegistrationPage';

function App() {
  const [authenticated, setAuthenticated] = useState(false);
  const [userID, setUserID] = useState('');
  const [loading, setLoading] = useState(true); // Add loading state

  useEffect(() => {
    // Check if the user is authenticated
    checkAuth();
  }, []);

  async function checkAuth() {
    // Implement your authentication logic here to determine if the user is authenticated
    const currentUser = await supabase.auth.getUser();
    console.log(currentUser);
    if (currentUser.error) {
      setAuthenticated(false);
    } else {
      setUserID(currentUser.data.user.id);
      setAuthenticated(true);
    }
    setLoading(false); // Set loading to false once the check is complete
  }

  // While loading, you can display a loading indicator or message
  if (loading) {
    return <div>Loading...</div>;
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
