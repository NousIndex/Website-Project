import React, { useEffect, useMemo, useState } from 'react';
import GameSidebar from './GameSidebar';
import ExpandableCarousel from './ExpandableCarousel';
import ResetTimer, { splitDuration } from './ResetTimer';
import CodeRedeemTable from './CodeRedeemTable';
import BirthdayList from './BirthdayList';
import { apiFetchOr } from '../../APIs/client';

/**
 * Home page for a game section.
 *
 * Replaces five copies that had drifted into showing each other's data. Each
 * panel appears only if `config` names a source for it, so a game without (for
 * example) a banner listing shows no carousel instead of another game's
 * banners. See games/homeConfig.js.
 */
function GameHomePage({ config }) {
  const [banners, setBanners] = useState([]);
  const [bannerEndsAt, setBannerEndsAt] = useState(null);
  const [now, setNow] = useState(() => Date.now());

  const bannerCommand = config.banner;

  useEffect(() => {
    if (!bannerCommand) return undefined;
    let cancelled = false;

    apiFetchOr(null, `api/misc-commands?scrapeCommand=${bannerCommand}`).then(
      (data) => {
        if (cancelled || !data || !Array.isArray(data.urls)) return;

        setBanners(
          data.urls.map((imageUrl) => ({ imageUrl, legend: data.date ?? '' }))
        );

        // "August 12 2026 - September 01 2026" -> when the version ends
        const end = data.date ? data.date.split(' - ')[1] : null;
        const endsAt = end ? new Date(`${end} 14:59:59`).getTime() : NaN;
        setBannerEndsAt(Number.isNaN(endsAt) ? null : endsAt);
      }
    );

    return () => {
      cancelled = true;
    };
  }, [bannerCommand]);

  useEffect(() => {
    if (bannerEndsAt === null) return undefined;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [bannerEndsAt]);

  const bannerCountdown = useMemo(
    () => (bannerEndsAt === null ? null : splitDuration(bannerEndsAt - now)),
    [bannerEndsAt, now]
  );

  return (
    <div className="homepage-container">
      {/* Left Sidebar Navigation */}
      <GameSidebar
        game={config.sidebarGame}
        activeTab="Home"
      />

      {/* Main Content */}
      <div className="homepage-content">
        <h1 className="page-main-title">
          {config.title}
          {config.checkInUrl && (
            <a
              href={config.checkInUrl}
              target="_blank"
              className="genshin-checkin-button-link-container"
              rel="noopener noreferrer"
            >
              <button className="genshin-checkin-button-link">Check-In</button>
            </a>
          )}
        </h1>

        <div className="home-grid-container">
          <div className="home-left-grid-container ">
            <div className="home-top-left-grid-container">
              {config.birthdays && (
                <div className="home-top-left-first">
                  <BirthdayList command={config.birthdays} />
                </div>
              )}
              <div className="home-top-left-second">
                <ResetTimer reset={config.reset} />
              </div>
            </div>
            <div className="home-bottom-left">
              {banners.length > 0 && (
                <ExpandableCarousel
                  items={banners}
                  endtime={bannerCountdown}
                />
              )}
            </div>
          </div>
          <div className="home-right-grid-container">
            <div className="home-bottom-right">
              <CodeRedeemTable codes={config.codes} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GameHomePage;
