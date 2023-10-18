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
              <th className="code-table-text">Code</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={index}>
                <td className="code-table-text">
                  <a className="code-redeem-text" href={`https://genshin.hoyoverse.com/en/gift?code=${item.code}`} target="_blank">
                    {item.code}
                  </a>
                </td>
                <td className="code-table-text">&#8203;</td>{' '}
                {/* Zero width character */}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="code-table">
        <table>
          <thead>
            <tr>
              <th className="code-table-text">Expiry</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={index}>
                <td className="code-table-text">{item.expiry}</td>
                <td className="code-table-text">&#8203;</td>{' '}
                {/* Zero width character */}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StringArrayTable;

/* https://genshin.hoyoverse.com/en/gift?code= */
