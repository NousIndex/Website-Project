import React from 'react';
import './CSS/homepage.css'; // You can create a CSS file for styling
import ExpandableCarousel from '../components/ExpandableCarousel';
import image1 from '../../assets/banners/Genshin-Impact-4.0-Banner-1.png';
import image2 from '../../assets/banners/Genshin-Impact-4.0-Banner-2.png';
import image3 from '../../assets/banners/Genshin-Impact-4.0-Banner-3.png';


function HomePage() {
  
  const carouselItems = [
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
  ];

  return (
    <div className="homepage-container">
      {/* Left Sidebar Navigation */}
      <div className="sidebar">
        <h2 className='navigation-title'>Navigation</h2>
        <ul>
          <li className='navigation-items'><a href="/genshin">Home</a></li>
          <li className='navigation-items'><a href="/genshin/wish_tacker">Wish Tacker</a></li>
          <li className='navigation-items'><a href="/genshin/farmable">Farmable</a></li>
          <li className='navigation-items'><a href="/genshin/timeline">TimeLine</a></li>
          <li className='navigation-items'><a href="/genshin/database">Database</a></li>
          <li className='navigation-items'><a href="/genshin/acheveiemnts">Acheveiemnts</a></li>
        </ul>
      </div>

      {/* Main Content */}
      <div className="content">
        <h1 className='page-main-title'>Genshin Impact</h1>
        <div class="grid-container">
          <div class="left-content">
            <div class="top-left">
              FILLER_1
              FILLER_2
            </div>
            <div class="bottom-left">
              <ExpandableCarousel items={carouselItems} />
            </div>
          </div>
          <div class="right-content">
            <div class="top-right">
              FILLER_3
            </div>
            <div class="bottom-right">
              FILLER_4
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomePage;