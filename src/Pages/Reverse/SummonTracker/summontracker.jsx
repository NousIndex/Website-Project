import React from 'react';
import DrawTracker from '../../components/DrawTracker';
import StatsTable from './summonstats';
import { TRACKERS } from '../../../games/trackerConfig';

/**
 * Reverse: 1999 summon tracker page. The page itself lives in components/DrawTracker; everything
 * specific to this game is data in games/trackerConfig.js, apart from the stats
 * panel, which scores pity per game.
 */
function SummonTracker({ userID }) {
  return (
    <DrawTracker
      config={TRACKERS.reverse1999}
      StatsTable={StatsTable}
      userID={userID}
    />
  );
}

export default SummonTracker;
