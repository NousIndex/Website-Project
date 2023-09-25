import React from 'react';
import ItemTable from './wishrecords'; // Replace with the actual path to your component file
import './CSS/wishtable.css'; // Import your custom CSS file

const WishTable = () => {
  // Sample array of items
  const items = [
    {
        number: 1,
        image1: 'image1.jpg',
        name: 'Item 1',
        text: 'Description of Item 1',
        image2: 'image2.jpg',
        type: 'character',
        time: '10:00 AM',
    },
    {
        number: 2,
        image1: 'image3.jpg',
        name: 'Item 2',
        text: 'Description of Item 2',
        image2: 'image4.jpg',
        type: 'standard',
        time: '2:30 PM',
    },
    // Add more items as needed
  ];

  return (
    <div className="App">
      <ItemTable items={items} />
    </div>
  );
};

export default WishTable;