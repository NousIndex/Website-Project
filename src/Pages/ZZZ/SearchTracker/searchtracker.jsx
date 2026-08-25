import React from 'react';
import DrawTracker from '../../components/DrawTracker';
import StatsTable from './searchstats.jsx';
import { TRACKERS } from '../../../games/trackerConfig';

/**
 * Zenless Zone Zero search tracker page. The page itself lives in components/DrawTracker; everything
 * specific to this game is data in games/trackerConfig.js, apart from the stats
 * panel, which scores pity per game.
 */
function SearchTracker({ userID }) {
  return (
    <DrawTracker
      config={TRACKERS.zzz}
      StatsTable={StatsTable}
      userID={userID}
    />
  );
}

export default SearchTracker;
