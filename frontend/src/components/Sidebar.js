import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { colors } from '../styles/colors';

const Sidebar = () => {
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const role = user.role;

  const getMenuItems = () => {
    switch (role) {
      case 'admin':
        return [
          { path: '/admin', label: 'Dashboard', icon: '📊' },
          { path: '/admin/teachers', label: 'Manage Teachers', icon: '👨‍🏫' },
          { path: '/admin/students', label: 'Manage Students', icon: '👨‍🎓' },
          { path: '/admin/classes', label: 'Manage Classes', icon: '📚' },
          { path: '/admin/assignments', label: 'Assignment Management', icon: '📝' },
          { path: '/admin/reports', label: 'Reports', icon: '📈' }
        ];
      case 'teacher':
        return [
          { path: '/teacher', label: 'Dashboard', icon: '📊' },
          { path: '/teacher/create-class', label: 'Create Class', icon: '➕' },
          { path: '/teacher/my-classes', label: 'My Classes', icon: '📚' },
          { path: '/teacher/assignments', label: 'Assignments', icon: '📝' },
          { path: '/teacher/profile', label: 'Profile', icon: '👤' }
        ];
      case 'student':
        return [
          { path: '/student', label: 'Dashboard', icon: '📊' },
          { path: '/student/classes', label: 'My Classes', icon: '📚' },
          { path: '/student/assignments', label: 'My Assignments', icon: '📝' },
          { path: '/student/profile', label: 'Profile', icon: '👤' }
        ];
      default:
        return [];
    }
  };

  const menuItems = getMenuItems();

  return (
    <div style={styles.sidebar}>
      <div style={styles.sidebarHeader}>
        <h3 style={styles.roleTitle}>{role?.toUpperCase()} PANEL</h3>
      </div>
      <ul style={styles.menu}>
        {menuItems.map((item) => (
          <li key={item.path} style={styles.menuItem}>
            <Link
              to={item.path}
              style={{
                ...styles.menuLink,
                ...(location.pathname === item.path ? styles.menuLinkActive : {})
              }}
            >
              <span style={styles.icon}>{item.icon}</span>
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

const styles = {
  sidebar: {
    width: '250px',
    backgroundColor: colors.primary,
    minHeight: '100vh',
    position: 'fixed',
    left: 0,
    top: '60px',
    paddingTop: '20px',
    boxShadow: '2px 0 5px rgba(0,0,0,0.1)'
  },
  sidebarHeader: {
    padding: '20px',
    textAlign: 'center',
    borderBottom: `2px solid ${colors.secondary}`
  },
  roleTitle: {
    color: colors.secondary,
    margin: 0,
    fontSize: '1.2rem'
  },
  menu: {
    listStyle: 'none',
    padding: 0,
    margin: 0
  },
  menuItem: {
    margin: 0
  },
  menuLink: {
    display: 'flex',
    alignItems: 'center',
    padding: '15px 20px',
    color: colors.white,
    textDecoration: 'none',
    transition: 'background-color 0.3s',
    fontSize: '1rem'
  },
  menuLinkActive: {
    backgroundColor: colors.buttonHover,
    borderLeft: `4px solid ${colors.secondary}`
  },
  icon: {
    marginRight: '10px',
    fontSize: '1.2rem'
  }
};

export default Sidebar;
