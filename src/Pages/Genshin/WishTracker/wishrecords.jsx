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
  const [timesort, setTimesort] = useState(true);
  const [namesort, setNamesort] = useState(false);
  const [raritysort, setRaritysort] = useState(false);
  const [sortColumn, setSortColumn] = useState('Time');

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

  useEffect(() => {
    setSortedItems([...items]);
  }, [items]);

  // Function to handle sorting by a specific column
  const handleSort = (column) => {
    setSortColumn(column);
    const sorted = [...sortedItems].sort((a, b) => {
      if (column === 'Time') {
        setTimesort(!timesort); // Toggle timesort state
        setNamesort(false); // Reset timesort state
        setRaritysort(false); // Reset Raritysort state
        if (a.DrawTime === b.DrawTime) {
          // If the datetime values are the same, use item.drawNumber for secondary sorting
          if (timesort) {
            return b.drawNumber - a.drawNumber;
          } else {
            return a.drawNumber - b.drawNumber;
          }
        }
        if (timesort) {
          return new Date(a.DrawTime) - new Date(b.DrawTime);
        } else {
          return new Date(b.DrawTime) - new Date(a.DrawTime);
        }
      }
      if (column === 'Name') {
        setNamesort(!namesort); // Toggle namesort state
        setTimesort(false); // Reset timesort state
        setRaritysort(false); // Reset Raritysort state
        if (namesort) {
          return b.Item_Name.localeCompare(a.Item_Name);
        } else {
          return a.Item_Name.localeCompare(b.Item_Name);
        }
      }
      if (column === 'Rarity') {
        setRaritysort(!raritysort); // Toggle raritysort state
        setTimesort(false); // Reset timesort state
        setNamesort(false); // Reset namesort state
        if (raritysort) {
          return parseInt(a.Rarity) - parseInt(b.Rarity);
        } else {
          return parseInt(b.Rarity) - parseInt(a.Rarity);
        }
      }
      if (column === 'reset') {
        setSortColumn('Time');
        setTimesort(true); // Reset timesort state
        setNamesort(false); // Reset namesort state
        setRaritysort(false); // Reset Raritysort state
        if (a.DrawTime === b.DrawTime) {
          // If the datetime values are the same, use item.drawNumber for secondary sorting
          return b.drawNumber - a.drawNumber;
        }
        return new Date(a.DrawTime) - new Date(b.DrawTime);
      }
      return a.Item_Name.localeCompare(b.Item_Name);
    });
    setSortedItems(sorted);
  };

  // Function to handle filtering by Rarity
  const handleFilter = (rarity) => {
    if (rarity === '0') {
      // Clear all filters
      setFilters([]);
      handleSort('reset');
      return;
    }
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
      <button
        onClick={() => handleFilter('3')}
        className="genshin-draw-table-filter-buttons no-selection"
      >
        3★
      </button>
      <button
        onClick={() => handleFilter('4')}
        className="genshin-draw-table-filter-buttons no-selection"
      >
        4★
      </button>
      <button
        onClick={() => handleFilter('5')}
        className="genshin-draw-table-filter-buttons no-selection"
      >
        5★
      </button>
      <button
        onClick={() => handleFilter('0')}
        className="genshin-draw-table-filter-buttons no-selection"
      >
        Clear Filters
      </button>
      <table>
        <thead className="table-header">
          <tr>
            <th className="no-selection">No.</th>
            <th
              onClick={() => handleSort('Name')}
              className={`no-selection ${
                sortColumn === 'Name'
                  ? namesort
                    ? 'genshin-draw-table-sorted-asc'
                    : 'genshin-draw-table-sorted-desc'
                  : ''
              }`}
            >
              Name
            </th>
            <th
              onClick={() => handleSort('Rarity')}
              className={`no-selection ${
                sortColumn === 'Rarity'
                  ? raritysort
                    ? 'genshin-draw-table-sorted-asc'
                    : 'genshin-draw-table-sorted-desc'
                  : ''
              }`}
            >
              Rarity
            </th>
            <th className="no-selection">Pity</th>
            <th className="no-selection">Banner Type</th>
            <th
              onClick={() => handleSort('Time')}
              className={`no-selection ${
                sortColumn === 'Time'
                  ? timesort
                    ? 'genshin-draw-table-sorted-asc'
                    : 'genshin-draw-table-sorted-desc'
                  : ''
              }`}
            >
              Time
            </th>
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
                <td className="table-cell">{item.drawNumber}</td>
                <td className="table-cell-item-name">
                  <img
                    src={iconUrl}
                    loading="lazy"
                    className="table-item-icon no-selection"
                  />
                  <span className="item-name">{item.Item_Name}</span>
                </td>
                <td className="table-cell">
                  <span className="item-name">{item.Rarity}★</span>
                </td>
                <td className="table-cell">{item.text}</td>
                <td className="table-cell">{item.DrawType}</td>
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
