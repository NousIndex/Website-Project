import React from 'react';
import './CSS/coderedeem.css'; // Import your custom CSS file

const StringArrayTable = ({ items }) => {
  // Check if dataArray is empty or undefined
  if (!items || items.length === 0) {
    return <p>No data available.</p>;
  }

  return (
    <div className="code-table-container">
      <div className="code-table">
        <table>
          <thead>
            <tr>
              <th className="code-table-header-text">Code</th>
              {/* <th className="code-table-header-text">Expiry</th> */}
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={index}>
                <td className="code-table-text">
                  <a className="code-redeem-text" href={`https://genshin.hoyoverse.com/en/gift?code=${item.code}`} target="_blank" title={item.reward}>
                    {item.code}
                  </a>
                </td>
                {/* Need Change
                <td className="code-table-text" title={item.valid}>XXX</td> */}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StringArrayTable;

// https://genshin.hoyoverse.com/en/gift?code= 
// {/* Zero width character */}
// <td className="code-table-text">&#8203;</td>{' '}
