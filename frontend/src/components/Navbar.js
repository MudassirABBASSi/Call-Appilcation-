import React from 'react';
import { useNavigate } from 'react-router-dom';
import { colors } from '../styles/colors';

const Navbar = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <nav style={styles.navbar}>
      <div style={styles.logo}>
        <h2 style={styles.logoText}>Alburhan Classroom</h2>
      </div>
      <div style={styles.navRight}>
        <span style={styles.userName}>Welcome, {user.name || 'User'}</span>
        <button onClick={handleLogout} style={styles.logoutBtn}>
          Logout
        </button>
      </div>
    </nav>
  );
};

const styles = {
  navbar: {
    backgroundColor: colors.primary,
    color: colors.white,
    padding: '15px 30px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000
  },
  logo: {
    display: 'flex',
    alignItems: 'center'
  },
  logoText: {
    margin: 0,
    fontSize: '1.5rem',
    color: colors.secondary
  },
  navRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px'
  },
  userName: {
    fontSize: '1rem'
  },
  logoutBtn: {
    backgroundColor: colors.secondary,
    color: colors.white,
    border: 'none',
    padding: '10px 20px',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '1rem',
    transition: 'background-color 0.3s'
  }
};

export default Navbar;
