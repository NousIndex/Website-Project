import React, { useState, useRef } from 'react';
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import './CSS/ExpandableCarousel.css';
import Modal from 'react-modal';
import { CSSTransition } from 'react-transition-group';

const ExpandableCarousel = ({ items }) => {
  const [expandedIndex, setExpandedIndex] = useState(null); // Index of the expanded item
  const [modalIsOpen, setModalIsOpen] = useState(false); // State to control the modal
  const nodeRef = useRef(null);

  // Function to open modal
  const openModal = (index) => {
    setExpandedIndex(index);
    setModalIsOpen(true);
  };

  // Function to close modal
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
          className={`carousel-item`}
          onClick={() => openModal(index)}
        >
          <img src={item.imageUrl} alt={`Carousel Item ${index + 1}`} />
          <div className="carousel-legend">
            {item.legend}
          </div>
        </div>
      ))}
    </Carousel>
    <CSSTransition
        in={modalIsOpen}
        nodeRef={nodeRef}
        timeout={300}
        classNames="modal"
        unmountOnExit
      >
        <Modal
          isOpen={modalIsOpen}
          onRequestClose={closeModal}
          contentLabel="Image Modal"
          className="carousel-modal"
          overlayClassName="carousel-overlay"
        >
            <div className={`carousel-modal-content`}
            ref={nodeRef}>
              <Carousel 
                showThumbs={true} 
                infiniteLoop={true}
                swipeable={true}
                emulateTouch={true}
                >
                {items.map((item, index) => (
                  <div
                    key={index}
                    className={`carousel-modal-item`}
                    onClick={() => closeModal(index)}
                  >
                    <img src={item.imageUrl} alt={`Carousel Item ${index + 1}`} />
                    <div className="carousel-modal-legend">
                      {item.legend}
                    </div>
                  </div>
                ))}
              </Carousel>
              {/* <img src={items[expandedIndex].imageUrl} alt={`carousel-Carousel Item ${expandedIndex + 1}`} onClick={closeModal} />
              <div className="carousel-legend-modal">
                {items[expandedIndex].legend}
              </div> */}
            </div>
        </Modal>
      </CSSTransition>
    </div>
  );
};

export default ExpandableCarousel;
