import React from "react";

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
            <th>Pity</th>
            <th>Banner</th>
            <th>Time</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <tr className="table-row" key={index}>
              <td className="table-cell">{item.number}</td>
              <td className="table-cell">
                <img src={item.image1} alt={`Image 1 of ${item.name}`} />
              </td>
              <td className="table-cell item-name">{item.name}</td>
              <td className="table-cell">{item.text}</td>
              <td className="table-cell">
                <img src={item.image2} alt={`Image 2 of ${item.name}`} />
              </td>
              <td className="table-cell item-time">{item.time}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ItemTable;
