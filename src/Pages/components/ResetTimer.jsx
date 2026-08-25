import React, { useEffect, useState } from 'react';
import AbyssIcon from '../../assets/Icons/3.png';
import { RESET_REGIONS } from '../../games/homeConfig';

/**
 * Countdown to the next endgame-mode reset, per server region.
 *
 * The old per-game copies of this stored the next reset in state as a date in
 * October 2023 and pushed it forward by one cycle per tick when it found it in
 * the past. Three years on that meant the page opened showing a nonsense
 * countdown and needed a minute of ticking to catch up. The next reset is
 * arithmetic, so it is computed directly and is correct on first paint.
 */
export function nextResetAt(anchorIso, cycleDays, offsetHours, now = Date.now()) {
  const cycleMs = cycleDays * 24 * 60 * 60 * 1000;
  const anchor = new Date(anchorIso).getTime() + offsetHours * 60 * 60 * 1000;

  if (Number.isNaN(anchor) || !cycleMs) return null;
  if (now <= anchor) return anchor;

  const elapsed = now - anchor;
  return anchor + Math.ceil(elapsed / cycleMs) * cycleMs;
}

export function splitDuration(remainingMs) {
  const remaining = Math.max(0, remainingMs);
  return {
    days: Math.floor(remaining / (1000 * 60 * 60 * 24)),
    hours: Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutes: Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((remaining % (1000 * 60)) / 1000),
  };
}

const pad = (value) => String(value).padStart(2, '0');

function ResetTimer({ reset }) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (!reset) return null;

  return (
    <div className="abyss-timer-container">
      <h2 className="abyss-timer-header">
        <img
          src={AbyssIcon}
          alt=""
          className="abyss-timer-icon no-selection"
        />
        {reset.label} Reset
      </h2>
      {RESET_REGIONS.map((region) => {
        const target = nextResetAt(
          reset.anchor,
          reset.cycleDays,
          region.offsetHours,
          now
        );
        const { days, hours, minutes, seconds } = splitDuration(target - now);

        return (
          <p
            key={region.label}
            className="abyss-timer-paragraph"
          >
            <span className="abyss-timer-title">{region.label}:</span>{' '}
            {days}d {pad(hours)}h {pad(minutes)}m {pad(seconds)}s
          </p>
        );
      })}
    </div>
  );
}

export default ResetTimer;
