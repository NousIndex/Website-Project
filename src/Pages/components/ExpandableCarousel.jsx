// ExpandableCarousel.jsx
import React, { useState } from 'react';
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import './CSS/ExpandableCarousel.css'; // Import your custom CSS file
import Modal from 'react-modal'; // Import react-modal

const ExpandableCarousel = ({ items }) => {
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);

  const openModal = (index) => {
    setExpandedIndex(index);
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setExpandedIndex(null);
    setModalIsOpen(false);
  };

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
          className={`carousel-item ${index === expandedIndex ? 'expanded' : ''}`}
          onClick={() => openModal(index)}
        >
          <img src={item.imageUrl} alt={`Carousel Item ${index + 1}`} />
          <div className="legend">
            {item.legend}
          </div>
        </div>
      ))}
    </Carousel>
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        contentLabel="Image Modal"
        className="modal"
        overlayClassName="overlay"
      >
        <button className="modal-close-button" onClick={closeModal}>
          Close
        </button>
        {expandedIndex !== null && (
          <div className="modal-content">
            <img src={items[expandedIndex].imageUrl} alt={`Carousel Item ${expandedIndex + 1}`} />
            <div className="legend-modal">
              {items[expandedIndex].legend}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ExpandableCarousel;
