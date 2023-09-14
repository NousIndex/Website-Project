import React, { useState, useEffect } from 'react';
import '../CSS/LandingPage.css';

const MouseGlowPage = () => {
  const [lightRays, setLightRays] = useState([]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      const { clientX, clientY } = e;

      // Generate a random ray length between 10% and 30% of the screen height
      const screenHeight = window.innerHeight;
      const rayLength = screenHeight * 0.08;


      const ray = document.createElement('div');
      ray.className = 'light-ray';
      ray.style.left = `${clientX - 1}px`; // Offset by 1px to position at the center
      ray.style.top = `${clientY - rayLength/2}px`; // Set the top position based on mouse Y and ray length
      ray.style.height = `${rayLength}px`;
      ray.style.width = `${rayLength/20}px`;

      setTimeout(() => {
        ray.remove();
      }, 500);

      document.body.appendChild(ray);
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div className="mouse-glow-container">
      <h1 className="page-title">NousIndex</h1>
    </div>
  );
};

export default MouseGlowPage;




