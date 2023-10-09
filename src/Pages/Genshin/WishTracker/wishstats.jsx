import React, { useState, useEffect } from 'react';
import 'chart.js/auto';
import { Chart } from 'react-chartjs-2';
import './CSS/wishstats.css';

const WishStats = ({ wishes }) => {
  const [characterdraw4, setCharacterdraw4] = useState(0);
  const [weapondraw4, setWeapondraw4] = useState(0);
  const [standarddraw4, setStandarddraw4] = useState(0);
  const [characterdraw5, setCharacterdraw5] = useState(0);
  const [weapondraw5, setWeapondraw5] = useState(0);
  const [standarddraw5, setStandarddraw5] = useState(0);

  useEffect(() => {
    async function fetchData() {
      if (wishes && wishes.length > 0) {
        // Count number of 3, 4, and 5 rarity items
        let count3 = 0;
        let count4 = 0;
        let count5 = 0;
        let counterc = 0;
        let counterw = 0;
        let counters = 0;
        let characterdraw4lock = false;
        let characterdraw5lock = false;
        let weapondraw4lock = false;
        let weapondraw5lock = false;
        let standarddraw4lock = false;
        let standarddraw5lock = false;

        wishes.forEach((wish) => {
          if (wish.Rarity === '3') {
            count3++;
          } else if (wish.Rarity === '4') {
            count4++;
            if (
              !characterdraw4lock &&
              (wish.DrawType === 'Character Event Wish' ||
                wish.DrawType === 'Character Event Wish - 2')
            ) {
              characterdraw4lock = true;
              setCharacterdraw4(counterc);
            } else if (
              wish.DrawType === 'Weapon Event Wish' &&
              !weapondraw4lock
            ) {
              weapondraw4lock = true;
              setWeapondraw4(counterw);
            } else if (
              wish.DrawType === 'Permanent Wish' &&
              !standarddraw4lock
            ) {
              standarddraw4lock = true;
              setStandarddraw4(counters);
            }
          } else if (wish.Rarity === '5') {
            if (
              (wish.DrawType === 'Character Event Wish' ||
                wish.DrawType === 'Character Event Wish - 2') &&
              !characterdraw5lock
            ) {
              characterdraw5lock = true;
              setCharacterdraw5(counterc);
            } else if (
              wish.DrawType === 'Weapon Event Wish' &&
              !weapondraw5lock
            ) {
              weapondraw5lock = true;
              setWeapondraw5(counterw);
            } else if (
              wish.DrawType === 'Permanent Wish' &&
              !standarddraw5lock
            ) {
              standarddraw5lock = true;
              setStandarddraw5(counters);
            }
            count5++;
          }
          if (
            wish.DrawType === 'Character Event Wish' ||
            wish.DrawType === 'Character Event Wish - 2'
          ) {
            counterc++;
          } else if (wish.DrawType === 'Weapon Event Wish') {
            counterw++;
          } else if (wish.DrawType === 'Permanent Wish') {
            counters++;
          }
        });

        // Create data array for pie chart
        const data = {
          labels: ['3 Star', '4 Star', '5 Star'],
          datasets: [
            {
              data: [count3, count4, count5],
              backgroundColor: ['#69acc2', '#c093d1', '#ddac5e'],
              hoverBackgroundColor: ['#8ce2ff', '#ebb3ff', '#ffc76c'],
            },
          ],
        };
      }
    }
    fetchData();
  }, [wishes]);

  return (
    <div>
      <h2>Wish Stats</h2>
      <div className="wish-stats-container">
        {/* <div className="wish-stats-pie-chart">
          {data && data.labels && data.labels.length > 0 ? (
            <Chart
              type="pie"
              data={data}
              options={{ maintainAspectRatio: false }}
            />
          ) : (
            <p>No data available for the chart.</p>
          )}
        </div> */}
        <div className="wish-stats-tables">
          <div className="wish-stats-pity-table">
            <span>Character Event Wish</span>
            <table>
              <thead>
                <tr>
                  <th>4★</th>
                  <th>5★</th>
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
            <span>Weapon Event Wish</span>
            <table>
              <thead>
                <tr>
                  <th>4★</th>
                  <th>5★</th>
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
            <span>Permanent Wish</span>
            <table>
              <thead>
                <tr>
                  <th>4★</th>
                  <th>5★</th>
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
        </div>
      </div>
    </div>
  );
};

export default WishStats;
