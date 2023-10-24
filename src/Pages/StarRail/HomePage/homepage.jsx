import React, { useState, useEffect } from 'react';
import './CSS/homepage.css'; // You can create a CSS file for styling
import ExpandableCarousel from '../../components/ExpandableCarousel';
import StarRailSidebar from '../../components/StarRailSidebar';
import MOCTimer from './moctimer';
import Birthday from './birthday';
import CodeRedeem from './coderedeem';
import { API_URL } from '../../../API_Config.js';

function HomePage() {
  const [carouselItems, setCarouselItems] = useState([]);

  const [bannercountdown, setBannerCountdown] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    let newBannerEndDate;
    let bannerArray = [];

    async function fetchData() {
      try {
        const response = await fetch(`${API_URL}api/misc-commands?scrapeCommand=starrailbanner`);
        const data = await response.json();

        newBannerEndDate = new Date(data.date.split(" - ")[1] + ' 14:59:59').getTime();
        data.urls.forEach((imageUrl, index) => {
          
        console.log(imageUrl);
          const newItem = {
            imageUrl: imageUrl,
            legend: data.date,
          };
          bannerArray.push(newItem);
        });
      } catch (error) {
        console.error('Error fetching API usage data:', error);
      }
    }
    fetchData();

    // Calculate remaining time
    const updateCountdown = () => {
      const now = new Date().getTime();
      const timeRemaining = newBannerEndDate - now;
      const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      const minutes = Math.floor(
        (timeRemaining % (1000 * 60 * 60)) / (1000 * 60)
      );
      const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);

      setBannerCountdown({
        days,
        hours,
        minutes,
        seconds,
      });
    };

    // Update carouselItems
    setCarouselItems(bannerArray);
    // Update the countdown initially
    updateCountdown();

    // Update the countdown every second
    const interval = setInterval(updateCountdown, 1000);

    // Clear the interval when the component unmounts
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="homepage-container">
      {/* Left Sidebar Navigation */}
      <StarRailSidebar activeTab={'Home'} />

      {/* Main Content */}
      <div className="homepage-content">
        <h1 className="page-main-title">
          Honkai: Star Rail
          <a
            href="https://act.hoyolab.com/bbs/event/signin/hkrpg/index.html?act_id=e202303301540311"
            target="_blank"
            className="genshin-checkin-button-link-container"
            rel="noopener noreferrer"
          >
            <button className="genshin-checkin-button-link">Check-In</button>
          </a>
        </h1>
        <div class="home-grid-container">
          <div class="home-left-grid-container ">
            <div class="home-top-left-grid-container">
              <div class="home-top-left-first">
                <Birthday />
              </div>
              <div class="home-top-left-second">
                <MOCTimer />
              </div>
            </div>
            <div class="home-bottom-left">
              {/* Conditional rendering of ExpandableCarousel */}
              {carouselItems.length > 0 && (
                <ExpandableCarousel
                  items={carouselItems}
                  endtime={bannercountdown}
                />
              )}
            </div>
          </div>
          <div class="home-right-grid-container">
            <div class="home-top-right">EVENTS</div>
            <div class="home-bottom-right">
              <CodeRedeem/>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomePage;
