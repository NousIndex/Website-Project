import React, { useState, useEffect } from 'react';
import './CSS/coderedeem.css'; // Import your custom CSS file
import { API_URL } from '../../../API_Config.js';

const StringArrayTable = () => {
  useEffect(() => {
    fetchCodeData();
  }, []);

  const [codeItems, setCodeItems] = useState([]);

  async function fetchCodeData() {
    try {
      const response = await fetch(
        `${API_URL}api/misc-commands?scrapeCommand=genshincode`
      );
      const data = await response.json();
      setCodeItems(data);
    } catch (error) {
      console.error('Error fetching API usage data:', error);
    }
  }

  // Check if dataArray is empty or undefined
  if (!Array.isArray(codeItems) || codeItems.length === 0) {
    return;
  }

  return (
      <div className="code-table">
        <table>
          <thead>
            <tr>
              <th className="code-table-header-text">Code</th>
              {/* <th className="code-table-header-text">Expiry</th> */}
            </tr>
          </thead>
          <tbody>
            {codeItems.map((item, index) => (
              <tr key={index}>
                <td className="code-table-text">
                  <a
                    className="code-redeem-text"
                    href={`https://genshin.hoyoverse.com/en/gift?code=${item.code}`}
                    target="_blank"
                    title={item.reward}
                  >
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
  );
};

export default StringArrayTable;

// https://genshin.hoyoverse.com/en/gift?code=
// {/* Zero width character */}
// <td className="code-table-text">&#8203;</td>{' '}
