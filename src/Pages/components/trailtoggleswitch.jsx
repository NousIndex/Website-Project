import React, { useEffect, useState } from 'react';
import './CSS/trailtoggleswitch.css';

const TrailToggleButton = ({ isEnabled, onToggle }) => {
  const [initialLoad, setInitialLoad] = useState(true);

  useEffect(() => {
    // Check the initial state from local storage only if it's the first render
    if (initialLoad) {
      const savedState = localStorage.getItem('isTrailEnabled');
      if (savedState !== null) {
        onToggle(savedState === 'true');
      }
      setInitialLoad(false); // Mark the initial load as complete
    }
  }, [initialLoad, onToggle]);

  // Function to handle toggle of trail
  const handleToggle = () => {
    const updatedState = !isEnabled;
    localStorage.setItem('isTrailEnabled', updatedState.toString());
    onToggle(updatedState);
  };

  return (
    <button
      onClick={handleToggle}
      className="trail-toggle-button">
      {isEnabled ? 'Disable Trail' : 'Enable Trail'}
    </button>
  );
};

export default TrailToggleButton;
