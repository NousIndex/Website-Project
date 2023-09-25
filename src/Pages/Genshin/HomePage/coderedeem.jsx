import React from 'react';
import './CSS/coderedeem.css'; // Import your custom CSS file

const StringArrayTable = ({ items }) => {
  // Check if dataArray is empty or undefined
  if (!items || items.length === 0) {
    return <p>No data available.</p>;
  }

  return (
    <div className="code-table-container">
        <div className='code-table'>
            <table>
              <thead>
                <tr>
                  <th className='code-redeem-text'>Code</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => (
                  <tr key={index}>
                    <td className='code-redeem-text'>{item.code}</td>
                    <td className='code-redeem-text'>&#8203;</td> {/* Zero width character */}
                  </tr>
                ))}
              </tbody>
            </table>
        </div>
        <div className='code-table'>
            <table>
              <thead>
                <tr>
                  <th className='code-redeem-text'>Expiry</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => (
                  <tr key={index}>
                    <td className='code-redeem-text'>{item.expiry}</td>
                    <td className='code-redeem-text'>&#8203;</td> {/* Zero width character */}
                  </tr>
                ))}
              </tbody>
            </table>
        </div>
    </div>
  );
};

export default StringArrayTable;

/* https://genshin.hoyoverse.com/en/gift */