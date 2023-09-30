import React, { useState, useEffect } from 'react';

// Function to format a timestamp into a more human-readable format
const formatTimestamp = (timestamp) => {
  const dateParts = timestamp.split('T');
  const timeParts = dateParts[1].split(':');
  const seconds = timeParts[2].split('.')[0];
  let hours = parseInt(timeParts[0]);
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12; // Convert 0 to 12 for 12-hour format
  const formattedTime = `${hours}:${timeParts[1]}:${seconds} ${ampm}`;
  return `${dateParts[0]} ${formattedTime}`;
};

// ItemTable component to display all items
const ItemTable = ({ items }) => {
  const [sortedItems, setSortedItems] = useState([...items]);
  const [itemIcons, setItemIcons] = useState([]);
  const [filters, setFilters] = useState([]);
  const [timesort, setTimesort] = useState(false);
  const [namesort, setNamesort] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch(
          `http://42.60.133.245:7777/api/genshin-draw-icons`
        );
        const data = await response.json();
        setItemIcons(data);
      } catch (error) {
        console.error('Error fetching API usage data:', error);
      }
    }

    // Call the fetchData function when the component mounts
    fetchData();
  }, []); // Specify an empty dependency array to run only once

  // Function to handle sorting by a specific column
  const handleSort = (column) => {
    const sorted = [...sortedItems].sort((a, b) => {
      if (column === 'Time') {
        setTimesort(!timesort); // Toggle timesort state
        if (timesort) {
          return new Date(a.DrawTime) - new Date(b.DrawTime);
        } else {
          return new Date(b.DrawTime) - new Date(a.DrawTime);
        }
      }
      if (column === 'Name') {
        setNamesort(!namesort); // Toggle namesort state
        setTimesort(false); // Reset timesort state
        if (namesort) {
          return a.Item_Name.localeCompare(b.Item_Name);
        } else {
          return b.Item_Name.localeCompare(a.Item_Name);
        }
      }
      return a.Item_Name.localeCompare(b.Item_Name);
    });
    setSortedItems(sorted);
  };

  // Function to handle filtering by Rarity
  const handleFilter = (rarity) => {
    if (filters.includes(rarity)) {
      // Remove the rarity filter if it's already selected
      setFilters(filters.filter((filter) => filter !== rarity));
    } else {
      // Add the rarity filter if it's not selected
      setFilters([...filters, rarity]);
    }
  };

  // Apply filters
  const filteredItems = sortedItems.filter((item) => {
    if (filters.length === 0) {
      // If no filters are selected, show all items
      return true;
    }
    return filters.includes(item.Rarity);
  });

  return (
    <div className="table-container">
      <button onClick={() => handleFilter('3')}>3★</button>
      <button onClick={() => handleFilter('4')}>4★</button>
      <button onClick={() => handleFilter('5')}>5★</button>
      <table>
        <thead className="table-header">
          <tr>
            <th>No.</th>
            <th onClick={() => handleSort('Name')}>Name</th>
            <th>Rarity</th>
            <th>Pity</th>
            <th>Banner</th>
            <th onClick={() => handleSort('Time')}>Time</th>
          </tr>
        </thead>
        <tbody>
          {filteredItems.map((item, index) => {
            // Replace spaces with underscores and encoded special characters with %27
            const itemNameModified = item.Item_Name.replace(
              /\s+/g,
              '_'
            ).replace(/'/g, '%27');
            // Find the matching URL in itemIcons
            const iconUrl =
              itemIcons.find((url) => url.includes(itemNameModified)) ||
              'default-image-url';

            return (
              <tr
                className="table-row"
                key={index}
              >
                <td className="table-cell">{index + 1}</td>
                <td className="table-cell item-name">
                  <img
                    src={iconUrl}
                    alt={`Image 1 of ${item.Item_Name}`}
                  />{item.Item_Name}</td>
                <td className="table-cell item-name">{item.Rarity}★</td>
                <td className="table-cell">{item.text}</td>
                <td className="table-cell">
                  <img
                    src={item.image2}
                    alt={`Image 2 of ${item.Item_Name}`}
                  />
                </td>
                <td className="table-cell item-time">
                  {formatTimestamp(item.DrawTime)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default ItemTable;
