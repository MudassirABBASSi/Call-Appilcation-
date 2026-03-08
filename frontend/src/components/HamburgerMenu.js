import React from 'react';
import './HamburgerMenu.css';

const HamburgerMenu = ({ isOpen = false, onClick }) => {
  const handleClick = () => {
    if (typeof onClick === 'function') {
      onClick();
    }
  };

  return (
    <button 
      className={`hamburger-menu ${isOpen ? 'open' : ''}`}
      onClick={handleClick}
      aria-label="Toggle menu"
      aria-expanded={isOpen}
    >
      <span className="hamburger-line"></span>
      <span className="hamburger-line"></span>
      <span className="hamburger-line"></span>
    </button>
  );
};

export default HamburgerMenu;
