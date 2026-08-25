import React from 'react';
import GameHomePage from '../../components/GameHomePage';
import { HOME_PAGES } from '../../../games/homeConfig';

/** Honkai: Star Rail home page. Contents come from games/homeConfig.js. */
function StarRailHomePage() {
  return <GameHomePage config={HOME_PAGES.starrail} />;
}

export default StarRailHomePage;
