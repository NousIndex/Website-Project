import React, { Suspense, lazy, useEffect, useState } from 'react';
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
import ErrorBoundary from './Pages/components/ErrorBoundary';


// Game sections are lazy loaded: a visitor heading for the Genshin tracker
// should not have to download the ZZZ, Wuwa and Reverse:1999 pages first.
const LandingPage = lazy(() => import('./Pages/LandingPage.jsx'));

// The particle background carries the home and sign-out controls, but it also
// pulls in tsparticles -- by far the largest dependency in the app -- so it is
// loaded after the page itself is interactive.
const ParticlesBackground = lazy(() => import('./Pages/ParticlesBackground.jsx'));

const GenshinHomePage = lazy(() =>
  import('./Pages/Genshin/HomePage/homepage.jsx')
);
const GenshinWishTrackerPage = lazy(() =>
  import('./Pages/Genshin/WishTracker/wishtracker')
);
const GeshinImportWish = lazy(() =>
  import('./Pages/Genshin/WishTracker/importwish')
);
const GenshinTimeLine = lazy(() =>
  import('./Pages/Genshin/TimeLine/timeline')
);

const StarRailHomePage = lazy(() =>
  import('./Pages/StarRail/HomePage/homepage.jsx')
);
const StarRailWishTrackerPage = lazy(() =>
  import('./Pages/StarRail/WarpTracker/warptracker')
);
const StarRailImportWish = lazy(() =>
  import('./Pages/StarRail/WarpTracker/importwarp')
);

const ZZZHomePage = lazy(() => import('./Pages/ZZZ/HomePage/homepage.jsx'));
const ZZZWishTrackerPage = lazy(() =>
  import('./Pages/ZZZ/SearchTracker/searchtracker')
);
const ZZZImportWish = lazy(() =>
  import('./Pages/ZZZ/SearchTracker/importsearch')
);

const ReverseHomePage = lazy(() =>
  import('./Pages/Reverse/HomePage/homepage.jsx')
);
const ReverseWishTrackerPage = lazy(() =>
  import('./Pages/Reverse/SummonTracker/summontracker')
);
const ReverseImportWish = lazy(() =>
  import('./Pages/Reverse/SummonTracker/importsummon')
);
const ReverseIdeaPage = lazy(() =>
  import('./Pages/Reverse/IdeaOptimizer/resonatepage')
);
const ReverseIdeaTestPage = lazy(() =>
  import('./Pages/Reverse/IdeaOptimizer/resonatetestpage')
);

const WuwaHomePage = lazy(() => import('./Pages/Wuwa/HomePage/homepage.jsx'));
const WuwaWishTrackerPage = lazy(() =>
  import('./Pages/Wuwa/ConveneTracker/convenetracker')
);
const WuwaImportWish = lazy(() =>
  import('./Pages/Wuwa/ConveneTracker/importconvene')
);

function App() {
  const [authenticated, setAuthenticated] = useState(false);
  const [userID, setUserID] = useState('');
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => {
      document.body.style.backgroundColor = 'transparent';
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    let active = true;

    async function checkAuth() {
      const { data, error } = await supabase.auth.getUser();
      if (!active) return;
      if (error || !data?.user) {
        setAuthenticated(false);
        setUserID('');
      } else {
        setUserID(data.user.id);
        setAuthenticated(true);
      }
      setLoading(false);
    }

    checkAuth();

    // Track sign-in, sign-out and token refresh instead of only reading the
    // session once on mount, so a stale tab cannot keep calling the API.
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!active) return;
        setAuthenticated(Boolean(session?.user));
        setUserID(session?.user?.id ?? '');
      }
    );

    return () => {
      active = false;
      listener?.subscription?.unsubscribe();
    };
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Router>
      <div className="App">
        <ErrorBoundary>
          <Suspense fallback={<div>Loading...</div>}>
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
                    path={routePaths.HOME_PATH}
                    element={<LandingPage />}
                  />
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
                    element={<GeshinImportWish />}
                  />
                  <Route
                    path={routePaths.GENSHIN_TIMELINE_PATH}
                    element={<GenshinTimeLine />}
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
                    element={<StarRailImportWish />}
                  />
                  <Route
                    path={routePaths.ZZZ_HOME_PATH}
                    element={<ZZZHomePage />}
                  />
                  <Route
                    path={routePaths.ZZZ_WISH_TRACKER_PATH}
                    element={<ZZZWishTrackerPage userID={userID} />}
                  />
                  <Route
                    path={routePaths.ZZZ_WISH_TRACKER_IMPORT_PATH}
                    element={<ZZZImportWish />}
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
                    element={<ReverseImportWish />}
                  />
                  <Route
                    path={routePaths.REGISTER_PATH_RESONATE_OPTIMIZER}
                    element={<ReverseIdeaPage />}
                  />
                  <Route
                    path={routePaths.REGISTER_PATH_RESONATE_TESTER}
                    element={<ReverseIdeaTestPage />}
                  />
                  <Route
                    path={routePaths.WUWA_HOME_PATH}
                    element={<WuwaHomePage />}
                  />
                  <Route
                    path={routePaths.WUWA_WISH_TRACKER_PATH}
                    element={<WuwaWishTrackerPage userID={userID} />}
                  />
                  <Route
                    path={routePaths.WUWA_WISH_TRACKER_IMPORT_PATH}
                    element={<WuwaImportWish />}
                  />
                  <Route
                    path="*"
                    element={<Navigate to={routePaths.HOME_PATH} />}
                  />
                </>
              ) : (
                // Any route reached while signed out lands on the login page
                // instead of rendering a blank screen.
                <Route
                  path="*"
                  element={<Navigate to={routePaths.LOGIN_PATH} />}
                />
              )}
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </div>
      <Suspense fallback={null}>
        <ParticlesBackground
          authenticated={authenticated}
          setAuthenticated={setAuthenticated}
        />
      </Suspense>
    </Router>
  );
}

export default App;
