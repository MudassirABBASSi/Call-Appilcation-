import React from 'react';
import { useNavigate } from 'react-router-dom';
import NotificationBell from './NotificationBell';
import HamburgerMenu from './HamburgerMenu';
import { useTheme } from '../context/ThemeContext';
import '../styles/navbar.css';

const Navbar = ({ isSidebarOpen = false, onToggleSidebar }) => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const { theme, toggleTheme } = useTheme();
  const canToggleSidebar = typeof onToggleSidebar === 'function';

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        {canToggleSidebar && (
          <HamburgerMenu
            isOpen={isSidebarOpen}
            onClick={onToggleSidebar}
          />
        )}
        <div className="navbar-logo">
          <h2>Alburhan Classroom</h2>
        </div>
      </div>
      <div className="navbar-right">
        <span className="navbar-username">Welcome, {user.name || 'User'}</span>
        <NotificationBell />
        <button 
          onClick={toggleTheme} 
          className="navbar-theme-toggle"
          title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          aria-label="Toggle theme"
        >
          {theme === 'light' ? '🌙' : '☀️'}
        </button>
        <button onClick={handleLogout} className="navbar-logout-btn">
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;

