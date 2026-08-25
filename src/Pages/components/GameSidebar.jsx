import React from 'react';
import { Link } from 'react-router-dom';
import { GAME_NAV } from '../../games/navigation';

/**
 * Navigation sidebar for every game section.
 *
 * This replaces five near-identical sidebar components that differed only in
 * their title and link targets; those now live in games/navigation.js.
 */
const GameSidebar = ({ game, activeTab }) => {
  const nav = GAME_NAV[game];
  if (!nav) return null;

  return (
    <div className="sidebar">
      <p className="sidebar-small-title">{nav.title}</p>
      <h2 className="navigation-title">Navigation</h2>
      <ul>
        {nav.items.map((item) => (
          <li
            key={item.path}
            className={`navigation-items ${
              activeTab === item.tab ? 'active' : ''
            }`}
          >
            <Link to={item.path}>{item.label}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default GameSidebar;
