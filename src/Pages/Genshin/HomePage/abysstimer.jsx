import React, { useState, useEffect } from 'react';
import './CSS/abysstimer.css'; // You can create a CSS file for styling
import AbyssIcon from '../../../assets/Icons/3.png';

const AbyssTimer = () => {
  // Abyss Timer Countdown Format
  const [countdown, setCountdown] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [countdown2, setCountdown2] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [countdown3, setCountdown3] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  // Target Dates for different regions
  const [targetDate, setTargetDate] = useState(
    new Date('2023-09-30T19:59:59Z').getTime()
  );
  const [targetDate2, setTargetDate2] = useState(
    new Date('2023-10-01T02:59:59Z').getTime()
  );
  const [targetDate3, setTargetDate3] = useState(
    new Date('2023-10-01T08:59:59Z').getTime()
  );

  useEffect(() => {
    const updateCountdown = () => {
      // Calculate remaining time
      const now = new Date().getTime();
      const timeRemaining = targetDate - now;
      const timeRemaining2 = targetDate2 - now;
      const timeRemaining3 = targetDate3 - now;

      // Check if the countdown has ended
      if (timeRemaining <= 0) {
        // Countdown has ended
        // Add 14 days to the current target date
        const newTargetDate = new Date(
          targetDate + 14 * 24 * 60 * 60 * 1000
        ).getTime();
        setTargetDate(newTargetDate);
      } else {
        // Calculate remaining time
        const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
        const hours = Math.floor(
          (timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
        );
        const minutes = Math.floor(
          (timeRemaining % (1000 * 60 * 60)) / (1000 * 60)
        );
        const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);

        setCountdown({
          days,
          hours,
          minutes,
          seconds,
        });
      }

      // Check if the countdown has ended
      if (timeRemaining2 <= 0) {
        // Countdown has ended
        // Add 14 days to the current target date
        const newTargetDate2 = new Date(
          targetDate2 + 14 * 24 * 60 * 60 * 1000
        ).getTime();
        setTargetDate2(newTargetDate2);
      } else {
        // Calculate remaining time
        const days = Math.floor(timeRemaining2 / (1000 * 60 * 60 * 24));
        const hours = Math.floor(
          (timeRemaining2 % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
        );
        const minutes = Math.floor(
          (timeRemaining2 % (1000 * 60 * 60)) / (1000 * 60)
        );
        const seconds = Math.floor((timeRemaining2 % (1000 * 60)) / 1000);

        setCountdown2({
          days,
          hours,
          minutes,
          seconds,
        });
      }

      // Check if the countdown has ended
      if (timeRemaining3 <= 0) {
        // Countdown has ended
        // Add 14 days to the current target date
        const newTargetDate3 = new Date(
          targetDate3 + 14 * 24 * 60 * 60 * 1000
        ).getTime();
        setTargetDate3(newTargetDate3);
      } else {
        // Calculate remaining time
        const days = Math.floor(timeRemaining3 / (1000 * 60 * 60 * 24));
        const hours = Math.floor(
          (timeRemaining3 % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
        );
        const minutes = Math.floor(
          (timeRemaining3 % (1000 * 60 * 60)) / (1000 * 60)
        );
        const seconds = Math.floor((timeRemaining3 % (1000 * 60)) / 1000);

        setCountdown3({
          days,
          hours,
          minutes,
          seconds,
        });
      }
    };

    // Update the countdown initially
    updateCountdown();

    // Update the countdown every second
    const interval = setInterval(updateCountdown, 1000);

    // Clear the interval when the component unmounts
    return () => clearInterval(interval);
  }, [targetDate]);

  return (
    <div>
      <div>
        <div className="abyss-timer-header">
          <h2 className="abyss-timer-title">
            <img
              src={AbyssIcon}
              alt="Spiral Abyss Icon"
              className="abyss-timer-icon"
            />
            Spiral Abyss Timer
          </h2>
        </div>
        <p className="abyss-timer-paragraph">
          Asia - {countdown.days} days, {countdown.hours} hrs,{' '}
          {countdown.minutes} mins, {countdown.seconds} secs
        </p>
        <p className="abyss-timer-paragraph">
          EU - {countdown2.days} days, {countdown2.hours} hrs,{' '}
          {countdown2.minutes} mins, {countdown2.seconds} secs
        </p>
        <p className="abyss-timer-paragraph">
          NA - {countdown3.days} days, {countdown3.hours} hrs,{' '}
          {countdown3.minutes} mins, {countdown3.seconds} secs
        </p>
      </div>
    </div>
  );
};

export default AbyssTimer;
