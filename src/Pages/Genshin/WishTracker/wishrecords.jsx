import React from 'react';
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
  return (
    <div className="table-container">
      <table>
        <thead className="table-header">
          <tr>
            <th>No.</th>
            <th>Image</th>
            <th>Name</th>
            <th>Rarity</th>
            <th>Pity</th>
            <th>Banner</th>
            <th>Time</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <tr
              className="table-row"
              key={index}
            >
              <td className="table-cell">{index + 1}</td>
              <td className="table-cell">
                <img
                  src={item.image1}
                  alt={`Image 1 of ${item.Item_Name}`}
                />
              </td>
              <td className="table-cell item-name">{item.Item_Name}</td>
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
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ItemTable;
