import React, { useState, useEffect } from 'react';
import './CSS/homepage.css'; // You can create a CSS file for styling
import {
  fetchWebsiteHtml,
  extractDataFromIGNHTMLFirstTwoTable,
} from '../../../APIs/webscrapAPI';
import ExpandableCarousel from '../../components/ExpandableCarousel';
import GenshinSidebar from '../../components/GenshinSidebar';
import AbyssTimer from './abysstimer';
import Birthday from './birthday';
import CodeRedeem from './coderedeem';

function HomePage() {
  const [bannerEndDate, setbannerEndDate] = useState(
    new Date('2023-09-30T19:59:59Z').getTime()
  );
  const [carouselItems, setCarouselItems] = useState([]);

  const [bannercountdown, setBannerCountdown] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const genshincharacterwebsiteUrl =
      'https://www.ign.com/wikis/genshin-impact/Banner_Schedule:_Current_and_Next_Genshin_Banners';
    const genshinweaponwebsiteUrl =
      'https://www.ign.com/wikis/genshin-impact/Weapon_Banner_Schedule';
  
    // Create an array of promises to fetch data from both URLs
    const fetchPromises = [
      fetchWebsiteHtml(genshincharacterwebsiteUrl),
      fetchWebsiteHtml(genshinweaponwebsiteUrl),
    ];
  
    // Use Promise.all to fetch data from both URLs concurrently
    Promise.all(fetchPromises)
      .then(([html, html2]) => {
        const extractedData = extractDataFromIGNHTMLFirstTwoTable(html);
        const extractedData2 = extractDataFromIGNHTMLFirstTwoTable(html2);
        let bannerArray = [];
  
        const legend = extractedData.firstTableData.boldText[1] || '';
        const bannerPhase = extractedData.firstTableData.boldText[0] || '';
        let newBannerEndDate;
        if (bannerPhase.includes('Phase 2')) {
          newBannerEndDate = new Date(legend.split(' - ')[1] + ' 15:00:00').getTime();
        } else {
          newBannerEndDate = new Date(legend.split(' - ')[1] + ' 18:00:00').getTime();
        }
        // Process data from the first URL
        extractedData.firstTableData.imageUrls.forEach((imageUrl, index) => {
          const newItem = {
            imageUrl: imageUrl,
            legend: legend,
          };
          bannerArray.push(newItem);
        });
  
        // Process data from the second URL
        extractedData2.firstTableData.imageUrls.forEach((imageUrl, index) => {
          const newItem = {
            imageUrl: imageUrl,
            legend: legend,
          };
          bannerArray.push(newItem);
        });
  
        // Update bannerEndDate
        setbannerEndDate(newBannerEndDate);
  
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
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  }, []);
  

  const [codeItems, setCodeItems] = useState([
    {
      code: 'EAFVJV4YGTR9',
      expiry: '',
    },
    {
      code: 'RQWP3ULZZ8VD',
      expiry: '',
    },
    {
      code: 'GDAHKD5HYTN5',
      expiry: '',
    },
    {
      code: 'WEQP3D5ZHRD9',
      expiry: 'NEW',
    },
    {
      code: 'GENSHINIMPACTRIVALS23',
      expiry: '00D:00H:59M:59S',
    },
  ]);

  const handleAddItem = () => {
    const newItem = {
      code: 'NEWCODE123',
      expiry: '10D:5H:30M:15S',
    };

    // Update codeItems using the setCodeItems function
    setCodeItems((prevCodeItems) => [...prevCodeItems, newItem]);
  };

  return (
    <div className="homepage-container">
      {/* Left Sidebar Navigation */}
      <GenshinSidebar />

      {/* Main Content */}
      <div className="homepage-content">
        <h1 className="page-main-title">
          Genshin Impact
          <a
            href="https://act.hoyolab.com/ys/event/signin-sea-v3/index.html?act_id=e202102251931481"
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
                <AbyssTimer />
              </div>
            </div>
            <div class="home-bottom-left">
              {/* Conditional rendering of ExpandableCarousel */}
              {carouselItems.length > 0 && (
                <ExpandableCarousel items={carouselItems} endtime={bannercountdown}/>
              )}
            </div>
          </div>
          <div class="home-right-grid-container">
            <div class="home-top-right">EVENTS</div>
            <div class="home-bottom-right">
              <CodeRedeem items={codeItems} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomePage;
