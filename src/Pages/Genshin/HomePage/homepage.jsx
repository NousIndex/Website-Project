import React from 'react';
import GameHomePage from '../../components/GameHomePage';
import { HOME_PAGES } from '../../../games/homeConfig';

/** Genshin Impact home page. Contents come from games/homeConfig.js. */
function GenshinHomePage() {
  return <GameHomePage config={HOME_PAGES.genshin} />;
}

export default GenshinHomePage;
