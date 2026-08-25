import React from 'react';
import DrawTracker from '../../components/DrawTracker';
import StatsTable from './warpstats';
import { TRACKERS } from '../../../games/trackerConfig';

/**
 * Honkai: Star Rail warp tracker page. The page itself lives in components/DrawTracker; everything
 * specific to this game is data in games/trackerConfig.js, apart from the stats
 * panel, which scores pity per game.
 */
function WarpTracker({ userID }) {
  return (
    <DrawTracker
      config={TRACKERS.starrail}
      StatsTable={StatsTable}
      userID={userID}
    />
  );
}

export default WarpTracker;
