import React, { useState, useEffect } from 'react';
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import './CSS/ExpandableCarousel.css';
import Modal from 'react-modal';
import 'animate.css/animate.min.css';

const ExpandableCarousel = ({ items }) => {
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [selectedModalIndex, setSelectedModalIndex] = useState(0); // Initialize to 0

  const openModal = (index) => {
    setExpandedIndex(index);
    setSelectedModalIndex(index); // Set the selected index when opening the modal
    setModalIsOpen(true);
    setIsClosing(false); // Reset the closing state
  };

  const closeModal = () => {
    setIsClosing(true); // Trigger the closing animation
    // Delay closing the modal to allow the animation to complete
    setTimeout(() => {
      setExpandedIndex(null);
      setModalIsOpen(false);
      setIsClosing(false);
    }, 275); // Adjust the delay time to match your animation duration
  };

  // Define the modal animation class based on the modal state
  const modalAnimationClass = modalIsOpen
    ? isClosing
      ? 'animate__zoomOut' // Use a fade-out animation when closing
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
            <img src={item.imageUrl} alt={`Carousel Item ${index + 1}`} />
            <div className="carousel-legend">{item.legend}</div>
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
            selectedItem={selectedModalIndex} // Set the default selected item
          >
            {items.map((item, index) => (
              <div
                key={index}
                className={`carousel-modal-item`}
                onClick={() => closeModal(index)}
              >
                <img src={item.imageUrl} alt={`Carousel Item ${index + 1}`} />
                <div className="carousel-modal-legend">{item.legend}</div>
              </div>
            ))}
          </Carousel>
        </div>
      </Modal>
    </div>
  );
};

export default ExpandableCarousel;
