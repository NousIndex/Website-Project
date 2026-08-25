import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import starrailImage from '../assets/landing_page/starrail.webp';
import reverse1999Image from '../assets/landing_page/reverse1999.webp';
import wuwaImage from '../assets/landing_page/wuwa.webp';
import zzzImage from '../assets/landing_page/ZZZ.webp';
import { apiFetchOr } from '../APIs/client';

/**
 * Game picker.
 *
 * Genshin has no bundled cover art, so its card shows the banner currently
 * running. That art used to be scraped from IGN in the browser -- a
 * cross-origin request for a full wiki page, cached in localStorage forever,
 * which left the card blank whenever it failed. It now comes from the same
 * cached API the home pages use, and the card falls back to its title if the
 * scrape is unavailable.
 */
const GAMES = [
  { key: 'genshin', name: 'Genshin Impact', path: '/genshin', image: null },
  {
    key: 'starrail',
    name: 'Honkai: Star Rail',
    path: '/starrail',
    image: starrailImage,
  },
  { key: 'zzz', name: 'Zenless Zone Zero', path: '/zzz', image: zzzImage },
  { key: 'wuwa', name: 'Wuthering Waves', path: '/wuwa', image: wuwaImage },
  {
    key: 'reverse1999',
    name: 'Reverse: 1999',
    path: '/reverse1999',
    image: reverse1999Image,
  },
];

const LandingPage = () => {
  const [genshinArt, setGenshinArt] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    document.body.style.backgroundColor = 'transparent';
  }, []);

  useEffect(() => {
    let cancelled = false;

    apiFetchOr(null, 'api/misc-commands?scrapeCommand=genshinbanner').then(
      (data) => {
        if (cancelled || !data || !Array.isArray(data.urls)) return;
        if (data.urls[0]) setGenshinArt(data.urls[0]);
      }
    );

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="container">
      <h1 className="page-title">NousIndex</h1>
      <div className="buttons-container">
        {GAMES.map((game) => {
          const image = game.key === 'genshin' ? genshinArt : game.image;

          return (
            <button
              key={game.key}
              className="image-button"
              onClick={() => navigate(game.path)}
              aria-label={game.name}
            >
              {image ? (
                <img
                  src={image}
                  alt={game.name}
                />
              ) : (
                <span className="image-button-fallback">{game.name}</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default LandingPage;
