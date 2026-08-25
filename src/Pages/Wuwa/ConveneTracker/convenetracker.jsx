import React from 'react';
import DrawTracker from '../../components/DrawTracker';
import StatsTable from './convenestats.jsx';
import { TRACKERS } from '../../../games/trackerConfig';

/**
 * Wuthering Waves convene tracker page. The page itself lives in components/DrawTracker; everything
 * specific to this game is data in games/trackerConfig.js, apart from the stats
 * panel, which scores pity per game.
 */
function ConveneTracker({ userID }) {
  return (
    <DrawTracker
      config={TRACKERS.wuwa}
      StatsTable={StatsTable}
      userID={userID}
    />
  );
}

export default ConveneTracker;
