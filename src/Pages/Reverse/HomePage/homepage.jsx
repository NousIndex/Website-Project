import React from 'react';
import GameHomePage from '../../components/GameHomePage';
import { HOME_PAGES } from '../../../games/homeConfig';

/** Reverse: 1999 home page. Contents come from games/homeConfig.js. */
function ReverseHomePage() {
  return <GameHomePage config={HOME_PAGES.reverse1999} />;
}

export default ReverseHomePage;
