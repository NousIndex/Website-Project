import React from 'react';
import GameHomePage from '../../components/GameHomePage';
import { HOME_PAGES } from '../../../games/homeConfig';

/** Zenless Zone Zero home page. Contents come from games/homeConfig.js. */
function ZZZHomePage() {
  return <GameHomePage config={HOME_PAGES.zzz} />;
}

export default ZZZHomePage;
