import React, { useState, useEffect } from 'react';
import WarpInventory from './searchinventory';

const WishStats = ({ wishes, itemIcons, itemsData }) => {
  const [characterdraw4, setCharacterdraw4] = useState(0);
  const [weapondraw4, setWeapondraw4] = useState(0);
  const [standarddraw4, setStandarddraw4] = useState(0);
  const [bangboodraw4, setBangboodraw4] = useState(0);
  const [characterdraw5, setCharacterdraw5] = useState(0);
  const [weapondraw5, setWeapondraw5] = useState(0);
  const [standarddraw5, setStandarddraw5] = useState(0);
  const [bangboodraw5, setBangboodraw5] = useState(0);
  const [totalcharacterdraws, setTotalcharacterdraws] = useState(0);
  const [totalweapondraws, setTotalweapondraws] = useState(0);
  const [totalstandarddraws, setTotalstandarddraws] = useState(0);
  const [totalbangboodraws, setTotalbangboodraws] = useState(0);
  const [averagepity4, setAveragepity4] = useState(0);
  const [averagepity5, setAveragepity5] = useState(0);
  const [total4stars, setTotal4stars] = useState(0);
  const [total5stars, setTotal5stars] = useState(0);
  const [itemCounter, setItemCounter] = useState({});

  useEffect(() => {
    async function fetchData() {
      if (wishes && wishes.length > 0) {
        // Count number of 3, 4, and 5 rarity items
        let count4 = 0;
        let count5 = 0;
        let counterc = 0;
        let counterw = 0;
        let counters = 0;
        let counterb = 0;
        let characterdraw4lock = false;
        let characterdraw5lock = false;
        let weapondraw4lock = false;
        let weapondraw5lock = false;
        let standarddraw4lock = false;
        let standarddraw5lock = false;
        let bangboodraw4lock = false;
        let bangboodraw5lock = false;
        let averagepity4list = [];
        let averagepity5list = [];
        let itemCounts = {};
        // itemCounts['March 7th'] = (itemCounts['March 7th'] || 0) + 1;

        wishes.forEach((wish) => {
          if (wish.Rarity === '3') {
          } else if (wish.Rarity === '4') {
            itemCounts[wish.Item_Name] = (itemCounts[wish.Item_Name] || 0) + 1;
            averagepity4list.push(parseInt(wish.rarity4Pity));
            count4++;
            if (
              !characterdraw4lock &&
              (wish.DrawType === 'Agent Search' ||
                wish.DrawType === 'Agent Search - 2')
            ) {
              characterdraw4lock = true;
              setCharacterdraw4(counterc);
            } else if (
              (wish.DrawType === 'W-Engine Search' ||
                wish.DrawType === 'W-Engine Search - 2') &&
              !weapondraw4lock
            ) {
              weapondraw4lock = true;
              setWeapondraw4(counterw);
            } else if (
              wish.DrawType === 'Standard Search' &&
              !standarddraw4lock
            ) {
              standarddraw4lock = true;
              setStandarddraw4(counters);
            } else if (
              wish.DrawType === 'Bangboo Search' &&
              !bangboodraw4lock
            ) {
              bangboodraw4lock = true;
              setBangboodraw4(counterb);
            }
          } else if (wish.Rarity === '5') {
            itemCounts[wish.Item_Name] = (itemCounts[wish.Item_Name] || 0) + 1;
            averagepity5list.push(parseInt(wish.rarity5Pity));
            count5++;
            if (
              (wish.DrawType === 'Agent Search' ||
                wish.DrawType === 'Agent Search - 2') &&
              !characterdraw5lock
            ) {
              characterdraw5lock = true;
              setCharacterdraw5(counterc);
            } else if (
              (wish.DrawType === 'W-Engine Search' ||
                wish.DrawType === 'W-Engine Search - 2') &&
              !weapondraw5lock
            ) {
              weapondraw5lock = true;
              setWeapondraw5(counterw);
            } else if (
              wish.DrawType === 'Standard Search' &&
              !standarddraw5lock
            ) {
              standarddraw5lock = true;
              setStandarddraw5(counters);
            } else if (
              wish.DrawType === 'Bangboo Search' &&
              !bangboodraw5lock
            ) {
              bangboodraw5lock = true;
              setBangboodraw5(counterb);
            }
          }
          if (
            wish.DrawType === 'Agent Search' ||
            wish.DrawType === 'Agent Search - 2'
          ) {
            counterc++;
          } else if (
            wish.DrawType === 'W-Engine Search' ||
            wish.DrawType === 'W-Engine Search - 2'
          ) {
            counterw++;
          } else if (wish.DrawType === 'Standard Search') {
            counters++;
          } else if (wish.DrawType === 'Bangboo Search') {
            counterb++;
          }
        });
        setTotalcharacterdraws(counterc);
        setTotalweapondraws(counterw);
        setTotalstandarddraws(counters);
        setTotalbangboodraws(counterb)
        setTotal4stars(count4);
        setTotal5stars(count5);
        setAveragepity4(
          averagepity4list.reduce((a, b) => a + b, 0) / averagepity4list.length
        );
        setAveragepity5(
          averagepity5list.reduce((a, b) => a + b, 0) / averagepity5list.length
        );
        setItemCounter(itemCounts);
      }
    }
    fetchData();
  }, [wishes]);

  return (
    <div>
      <div className="wish-stats-container">
        <WarpInventory
          itemIcons={itemIcons}
          itemsData={itemsData}
          itemCounter={itemCounter}
        />
        <div className="wish-stats-tables">
          <div className="wish-stats-pity-table">
            <span>
            Agent Search
              <br />
              <a style={{ fontWeight: 'normal' }}>Total Draws: </a>
              {totalcharacterdraws}
            </span>
            <table>
              <thead>
                <tr>
                  <th style={{ color: '#ebb3ff' }}>4★</th>
                  <th style={{ color: '#ffc76c' }}>5★</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{characterdraw4}</td>
                  <td>{characterdraw5}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="wish-stats-pity-table">
            <span>
              W-Engine Search
              <br />
              <a style={{ fontWeight: 'normal' }}>Total Draws: </a>
              {totalweapondraws}
            </span>
            <table>
              <thead>
                <tr>
                  <th style={{ color: '#ebb3ff' }}>4★</th>
                  <th style={{ color: '#ffc76c' }}>5★</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{weapondraw4}</td>
                  <td>{weapondraw5}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="wish-stats-pity-table">
            <span>
              Standard Search
              <br />
              <a style={{ fontWeight: 'normal' }}>Total Draws: </a>
              {totalstandarddraws}
            </span>
            <table>
              <thead>
                <tr>
                  <th style={{ color: '#ebb3ff' }}>4★</th>
                  <th style={{ color: '#ffc76c' }}>5★</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{standarddraw4}</td>
                  <td>{standarddraw5}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="wish-stats-pity-table">
            <span>
              Bangboo Search
              <br />
              <a style={{ fontWeight: 'normal' }}>Total Draws: </a>
              {totalbangboodraws}
            </span>
            <table>
              <thead>
                <tr>
                  <th style={{ color: '#ebb3ff' }}>4★</th>
                  <th style={{ color: '#ffc76c' }}>5★</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{bangboodraw4}</td>
                  <td>{bangboodraw5}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="wish-stats-pity-table">
            <span>Total, Average</span>
            <table>
              <thead>
                <tr>
                  <th style={{ color: '#ebb3ff' }}>4★</th>
                  <th style={{ color: '#ffc76c' }}>5★</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{total4stars}</td>
                  <td>{total5stars}</td>
                </tr>
                <tr>
                  <td>{averagepity4.toFixed(2)}</td>
                  <td>{averagepity5.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WishStats;
