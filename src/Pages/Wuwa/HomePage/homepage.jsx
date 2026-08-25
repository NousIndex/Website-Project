import React from 'react';
import GameHomePage from '../../components/GameHomePage';
import { HOME_PAGES } from '../../../games/homeConfig';

/** Wuthering Waves home page. Contents come from games/homeConfig.js. */
function WuwaHomePage() {
  return <GameHomePage config={HOME_PAGES.wuwa} />;
}

export default WuwaHomePage;
