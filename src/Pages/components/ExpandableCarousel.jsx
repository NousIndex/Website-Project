// ExpandableCarousel.jsx
import React, { useState } from 'react';
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import './CSS/ExpandableCarousel.css'; // Import your custom CSS file
import Modal from 'react-modal'; // Import react-modal

const ExpandableCarousel = ({ items }) => {
  const [expandedIndex, setExpandedIndex] = useState(null); // Index of the expanded item
  const [modalIsOpen, setModalIsOpen] = useState(false); // State to control the modal

  // Function to open modal
  const openModal = (index) => {
    setExpandedIndex(index);
    setModalIsOpen(true);
    document.body.classList.add('fade-in');
  };

  // Function to close modal
  const closeModal = () => {
    setExpandedIndex(null);
    setModalIsOpen(false);
    document.body.classList.remove('fade-in');
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
        {expandedIndex !== null && (
          <div className="modal-content">
            <img src={items[expandedIndex].imageUrl} alt={`Carousel Item ${expandedIndex + 1}`} onClick={closeModal} />
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
