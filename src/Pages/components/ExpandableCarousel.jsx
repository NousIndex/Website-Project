import React, { useState, useEffect } from 'react';
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import './CSS/ExpandableCarousel.css';
import Modal from 'react-modal';
import 'animate.css/animate.min.css';

const ExpandableCarousel = ({ items, endtime }) => {
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [selectedModalIndex, setSelectedModalIndex] = useState(0);
  const [preloadedImages, setPreloadedImages] = useState([]); // Store preloaded images

  // Preload images when the component mounts
  useEffect(() => {
    const preloadImages = () => {
      const imagePromises = items.map((item) => {
        const img = new Image();
        img.src = item.imageUrl;
        return new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
        });
      });

      // Wait for all images to load before setting state
      Promise.all(imagePromises)
        .then(() => {
          setPreloadedImages(items.map((item) => item.imageUrl));
        })
        .catch((error) => {
          console.error('Error preloading images:', error);
        });
    };

    preloadImages();
  }, [items]);

  const openModal = (index) => {
    setSelectedModalIndex(index);
    setModalIsOpen(true);
    setIsClosing(false);
  };

  const closeModal = () => {
    setIsClosing(true);
    setTimeout(() => {
      setModalIsOpen(false);
      setIsClosing(false);
    }, 275);
  };

  const modalAnimationClass = modalIsOpen
    ? isClosing
      ? 'animate__zoomOut'
      : 'animate__zoomIn'
    : '';

  return (
    <div className="carousel-container">
      <Carousel
        showThumbs={false}
        autoPlay={true}
        interval={5000}
        infiniteLoop={true}
        stopOnHover={true}
        swipeable={true}
        emulateTouch={true}
      >
        {items.map((item, index) => (
          <div
            key={index}
            className={`carousel-item`}
            onClick={() => openModal(index)}
          >
            <img
              src={item.imageUrl}
              alt={`Carousel Item ${index + 1}`}
              style={{
                opacity: preloadedImages.includes(item.imageUrl) ? 1 : 0,
              }}
            />
            <div className="carousel-legend">
              {' '}
              <b>
                {item.legend} <br />
                Asia - {endtime.days} days, {endtime.hours} hrs,{' '}
                {endtime.minutes} mins, {endtime.seconds} secs
              </b>
            </div>
          </div>
        ))}
      </Carousel>

      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        contentLabel="Image Modal"
        className={`carousel-modal animate__animated ${modalAnimationClass}`}
        overlayClassName="carousel-overlay"
      >
        <div className={`carousel-modal-content`}>
          <Carousel
            showThumbs={true}
            infiniteLoop={true}
            swipeable={true}
            emulateTouch={true}
            selectedItem={selectedModalIndex}
          >
            {items.map((item, index) => (
              <div
                key={index}
                className={`carousel-modal-item`}
                onClick={() => closeModal(index)}
              >
                <img
                  src={item.imageUrl}
                  alt={`Carousel Item ${index + 1}`}
                />
                <div className="carousel-modal-legend">
                  {' '}
                  <b>
                    {item.legend} <br />
                    Asia - {endtime.days} days, {endtime.hours} hrs,{' '}
                    {endtime.minutes} mins, {endtime.seconds} secs
                  </b>
                </div>
              </div>
            ))}
          </Carousel>
        </div>
      </Modal>
    </div>
  );
};

export default ExpandableCarousel;
