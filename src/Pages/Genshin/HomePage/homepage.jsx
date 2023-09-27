import React, { useState } from 'react';
import '../CSS/homepage.css'; // You can create a CSS file for styling
import ExpandableCarousel from '../../components/ExpandableCarousel';
import GenshinSidebar from '../../components/GenshinSidebar';
import AbyssTimer from './abysstimer'
import Birthday from './birthday'
import CodeRedeem from './coderedeem'
import image1 from '../../../assets/banners/Genshin-Impact-4.0-Banner-1.png';
import image2 from '../../../assets/banners/Genshin-Impact-4.0-Banner-2.png';
import image3 from '../../../assets/banners/Genshin-Impact-4.0-Banner-3.png';


function HomePage() {
  
  // Define carouselItems and codeItems as state variables
  const [carouselItems, setCarouselItems] = useState([
    {
      imageUrl: image1,
      legend: 'Legend 1',
    },
    {
      imageUrl: image2,
      legend: 'Legend 2',
    },
    {
      imageUrl: image3,
      legend: 'Legend 3',
    },
  ]);

  const [codeItems, setCodeItems] = useState([
    {
      code: 'TA97CGHDHJTH',
      expiry: '',
    },
    {
      code: 'MT8PCZYVG2T5',
      expiry: '',
    },
    {
      code: 'NA9NDHHCZKTD',
      expiry: '05D:10H:20M:30S',
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
        <h1 className='page-main-title'>Genshin Impact</h1>
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
              <ExpandableCarousel items={carouselItems} />
            </div>
          </div>
          <div class="home-right-grid-container">
            <div class="home-top-right">
              EVENTS
            </div>
            <div class="home-bottom-right">
              <CodeRedeem items={codeItems}/>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomePage;