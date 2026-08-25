import React from 'react';
import DrawTracker from '../../components/DrawTracker';
import StatsTable from './wishstats';
import { TRACKERS } from '../../../games/trackerConfig';

/**
 * Genshin Impact wish tracker page. The page itself lives in components/DrawTracker; everything
 * specific to this game is data in games/trackerConfig.js, apart from the stats
 * panel, which scores pity per game.
 */
function WishTracker({ userID }) {
  return (
    <DrawTracker
      config={TRACKERS.genshin}
      StatsTable={StatsTable}
      userID={userID}
    />
  );
}

export default WishTracker;
