import React from 'react';
import './App.css';
import LandingPage from './Pages/LandingPage.jsx';
import ParticlesBackground from './Pages/ParticlesBackground.js';

function App() {
  return (
    <div className="App">
      <ParticlesBackground />
      <LandingPage />
    </div>
  );
}

export default App;