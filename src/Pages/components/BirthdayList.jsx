import React, { useEffect, useMemo, useState } from 'react';
import BirthdayIcon from '../../assets/Icons/6.png';
import { apiFetchOr } from '../../APIs/client';

const UPCOMING_COUNT = 6;

/**
 * Sorts birthdays into the order they will next occur, starting from today.
 * Exported for the tests -- the wrap-around at the end of the year is the part
 * worth pinning down.
 */
export function upcomingBirthdays(birthdays, now = new Date(), limit = UPCOMING_COUNT) {
  if (!Array.isArray(birthdays)) return [];

  const todayKey = (now.getMonth() + 1) * 100 + now.getDate();

  return [...birthdays]
    .filter((entry) => entry && entry.month && entry.day)
    .map((entry) => {
      const key = entry.month * 100 + entry.day;
      return {
        ...entry,
        isToday: key === todayKey,
        // days-until ordering that wraps past New Year
        sortKey: key >= todayKey ? key - todayKey : key - todayKey + 1300,
      };
    })
    .sort((a, b) => a.sortKey - b.sortKey)
    .slice(0, limit);
}

function CharacterCard({ character }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={`character-card ${isHovered ? 'show' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      title={`${character.name} -- ${character.birthday}`}
    >
      <img
        src={character.icon}
        alt={character.name}
        loading="lazy"
        className="birthday-img"
      />
      <h2 className={`birthday-title ${isHovered ? 'show' : ''}`}>
        {character.name}
        {character.isToday ? ' 🎂' : ''}
      </h2>
      <p className={`birthday-para ${isHovered ? 'show' : ''}`}>
        Birthday: {character.birthday}
      </p>
    </div>
  );
}

/**
 * Upcoming character birthdays.
 *
 * This used to render two hardcoded placeholders -- "Character 1, January 1"
 * and "Character 2, February 2" -- on every game's home page. It now shows the
 * real list, and only for games whose wiki publishes one.
 */
function BirthdayList({ command }) {
  const [birthdays, setBirthdays] = useState([]);

  useEffect(() => {
    if (!command) return;
    let cancelled = false;

    apiFetchOr([], `api/misc-commands?scrapeCommand=${command}`).then((data) => {
      if (!cancelled) setBirthdays(Array.isArray(data) ? data : []);
    });

    return () => {
      cancelled = true;
    };
  }, [command]);

  const upcoming = useMemo(() => upcomingBirthdays(birthdays), [birthdays]);

  if (!command || upcoming.length === 0) return null;

  return (
    <div>
      <div className="abyss-timer-header">
        <h1 className="birthday-main-title">
          <img
            src={BirthdayIcon}
            alt=""
            className="abyss-timer-icon"
          />{' '}
          Birthdays{' '}
        </h1>
      </div>
      <div className="character-list">
        {upcoming.map((character) => (
          <CharacterCard
            key={character.name}
            character={character}
          />
        ))}
      </div>
    </div>
  );
}

export default BirthdayList;
