import React, { useState } from "react";
import Char1 from "../../../assets/Icons/1.png";
import Char2 from "../../../assets/Icons/2.png";
import BirthdayIcon from "../../../assets/Icons/6.png";
import "./CSS/birthday.css";

// CharacterInfo component to display a single character
const CharacterInfo = ({ character }) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  return (
    <div
      className={`character-card ${isHovered ? "show" : ""}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {" "}
      <img
        src={character.image}
        alt={character.name}
        className="birthday-img"
      />
      <h2 className={`birthday-title ${isHovered ? "show" : ""}`}>
        {character.name}
      </h2>
      <p className={`birthday-para ${isHovered ? "show" : ""}`}>
        Birthday: {character.birthday}
      </p>
    </div>
  );
};

// CharacterList component to display all characters
const CharacterList = ({ characters }) => {
  return (
    <div className="character-list">
      {characters.map((character, index) => (
        <CharacterInfo key={index} character={character} />
      ))}
    </div>
  );
};

const CharacterBirthday = () => {
  // Sample character data as an array (you can replace it with your data)
  const [characters, setCharacters] = useState([
    {
      name: "Character 1",
      image: Char1,
      birthday: "January 1",
    },
    {
      name: "Character 2",
      image: Char2,
      birthday: "February 2",
    },
    // Add more character objects as needed
  ]);

  // Function to update characters
  const updateCharacters = () => {
    // Example of changing character data
    setCharacters([
      {
        name: "Character 1",
        image: Char1,
        birthday: "January 1",
      },
      {
        name: "Character 2",
        image: Char2,
        birthday: "February 2",
      },
      // Add more updated character objects as needed
    ]);
  };

  return (
    <div>
      <div className="abyss-timer-header">
        <h1 className="birthday-main-title">
          <img
            src={BirthdayIcon}
            alt="Spiral Abyss Icon"
            className="abyss-timer-icon"
          />{" "}
          Birthdays{" "}
        </h1>
      </div>
      <CharacterList characters={characters} />
    </div>
  );
};

export default CharacterBirthday;
