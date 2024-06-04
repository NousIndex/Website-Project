import React, { useState, useEffect } from 'react';
import ConveneInventory from './conveneinventory';

const WishStats = ({ wishes, itemIcons, itemsData }) => {
  const [characterdraw4, setCharacterdraw4] = useState(0);
  const [weapondraw4, setWeapondraw4] = useState(0);
  const [standarddraw4, setStandarddraw4] = useState(0);
  const [standardwepdraw4, setStandardwepdraw4] = useState(0);
  const [characterdraw5, setCharacterdraw5] = useState(0);
  const [weapondraw5, setWeapondraw5] = useState(0);
  const [standarddraw5, setStandarddraw5] = useState(0);
  const [standardwepdraw5, setStandardwepdraw5] = useState(0);
  const [totalcharacterdraws, setTotalcharacterdraws] = useState(0);
  const [totalweapondraws, setTotalweapondraws] = useState(0);
  const [totalstandarddraws, setTotalstandarddraws] = useState(0);
  const [totalstandardwepdraws, setTotalstandardwepdraws] = useState(0);
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
        let countersw = 0;
        let characterdraw4lock = false;
        let characterdraw5lock = false;
        let weapondraw4lock = false;
        let weapondraw5lock = false;
        let standarddraw4lock = false;
        let standarddraw5lock = false;
        let standardwepdraw4lock = false;
        let standardwepdraw5lock = false;
        let averagepity4list = [];
        let averagepity5list = [];
        let itemCounts = {};
        // itemCounts['March 7th'] = (itemCounts['March 7th'] || 0) + 1;

        wishes.forEach((wish) => {
          if (wish.Rarity.includes('3')) {
          } else if (wish.Rarity.includes('4')) {
            itemCounts[wish.Item_Name] = (itemCounts[wish.Item_Name] || 0) + 1;
            averagepity4list.push(parseInt(wish.rarity4Pity));
            count4++;
            if (
              !characterdraw4lock &&
              (wish.DrawType === 'Featured Resonator Convene' ||
                wish.DrawType === 'Featured Resonator Convene - 2')
            ) {
              characterdraw4lock = true;
              setCharacterdraw4(counterc);
            } else if (
              (wish.DrawType === 'Featured Weapon Convene' ||
                wish.DrawType === 'Featured Weapon Convene - 2') &&
              !weapondraw4lock
            ) {
              weapondraw4lock = true;
              setWeapondraw4(counterw);
            } else if (
              wish.DrawType === 'Standard Resonator Convene' &&
              !standarddraw4lock
            ) {
              standarddraw4lock = true;
              setStandarddraw4(counters);
            } else if (
              wish.DrawType === 'Standard Weapon Convene' &&
              !standardwepdraw4lock
            ) {
              standardwepdraw4lock = true;
              setStandardwepdraw4(counters);
            }
          } else if (wish.Rarity.includes('5')) {
            itemCounts[wish.Item_Name] = (itemCounts[wish.Item_Name] || 0) + 1;
            averagepity5list.push(parseInt(wish.rarity5Pity));
            count5++;
            if (
              (wish.DrawType === 'Featured Resonator Convene' ||
                wish.DrawType === 'Featured Resonator Convene - 2') &&
              !characterdraw5lock
            ) {
              characterdraw5lock = true;
              setCharacterdraw5(counterc);
            } else if (
              (wish.DrawType === 'Featured Weapon Convene' ||
                wish.DrawType === 'Featured Weapon Convene - 2') &&
              !weapondraw5lock
            ) {
              weapondraw5lock = true;
              setWeapondraw5(counterw);
            } else if (
              wish.DrawType === 'Standard Resonator Convene' &&
              !standarddraw5lock
            ) {
              standarddraw5lock = true;
              setStandarddraw5(counters);
            } else if (
              wish.DrawType === 'Standard Weapon Convene' &&
              !standardwepdraw5lock
            ) {
              standardwepdraw5lock = true;
              setStandardwepdraw5(counters);
            }
          }

          // Featured Resonator Convene
          // Featured Weapon Convene
          // Standard Resonator Convene
          // Standard Weapon Convene
          // Beginner Convene
          // Beginner's Choice Convene
          // Beginner's Choice Convene（Giveback Custom Convene）

          if (
            wish.DrawType === 'Featured Resonator Convene' ||
            wish.DrawType === 'Featured Resonator Convene - 2'
          ) {
            counterc++;
          } else if (
            wish.DrawType === 'Featured Weapon Convene' ||
            wish.DrawType === 'Featured Weapon Convene - 2'
          ) {
            counterw++;
          } else if (wish.DrawType === 'Standard Resonator Convene') {
            counters++;
          } else if (wish.DrawType === 'Standard Weapon Convene') {
            countersw++;
          }
        });

        if (characterdraw4lock === false) {
          setCharacterdraw4(counterc);
        }
        if (weapondraw4lock === false) {
          setWeapondraw4(counterw);
        }
        if (standarddraw4lock === false) {
          setStandarddraw4(counters);
        }
        if (standardwepdraw4lock === false) {
          setStandardwepdraw4(countersw);
        }
        if (characterdraw5lock === false) {
          setCharacterdraw5(counterc);
        }
        if (weapondraw5lock === false) {
          setWeapondraw5(counterw);
        }
        if (standarddraw5lock === false) {
          setStandarddraw5(counters);
        }
        if (standardwepdraw5lock === false) {
          setStandardwepdraw5(countersw);
        }

        setTotalcharacterdraws(counterc);
        setTotalweapondraws(counterw);
        setTotalstandarddraws(counters);
        setTotalstandardwepdraws(countersw);
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
        <ConveneInventory
          itemIcons={itemIcons}
          itemsData={itemsData}
          itemCounter={itemCounter}
        />
        <div className="wish-stats-tables">
          <div className="wish-stats-pity-table">
            <span>
              Featured Resonator Convene
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
              Featured Weapon Convene
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
              Standard Resonator Convene
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
              Standard Weapon Convene
              <br />
              <a style={{ fontWeight: 'normal' }}>Total Draws: </a>
              {totalstandardwepdraws}
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
                  <td>{standardwepdraw4}</td>
                  <td>{standardwepdraw5}</td>
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
