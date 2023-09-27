import React from 'react';
import './CSS/homepage.css'; // You can create a CSS file for styling

function HomePage() {
  return (
    <div className="homepage-container">
      {/* Left Sidebar Navigation */}
      <div className="sidebar">
        <h2>Navigation</h2>
        <ul>
          <li>
            <a href="/">Home</a>
          </li>
          <li>
            <a href="/about">About</a>
          </li>
          <li>
            <a href="/services">Services</a>
          </li>
          <li>
            <a href="/contact">Contact</a>
          </li>
        </ul>
      </div>

      {/* Main Content */}
      <div className="content">
        <h1>Welcome to My Website</h1>
        <p>This is the homepage content. You can add more content here.</p>

        {/* Buttons */}
        <div className="buttons">
          <button>Button 1</button>
          <button>Button 2</button>
          <button>Button 3</button>
        </div>
      </div>
    </div>
  );
}

export default HomePage;
