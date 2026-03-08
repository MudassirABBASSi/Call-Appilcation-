import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../styles/sidebar.css';

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const role = user.role;

  // Close sidebar on route change for mobile - only when pathname actually changes
  useEffect(() => {
    if (window.innerWidth <= 992 && onClose) {
      onClose();
    }
  // Only run when location pathname changes, not on mount or onClose change
  }, [location.pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  const getMenuItems = () => {
    switch (role) {
      case 'admin':
        return [
          { path: '/admin', label: 'Dashboard', icon: '📊' },
          { path: '/admin/teachers', label: 'Manage Teachers', icon: '👨‍🏫' },
          { path: '/admin/students', label: 'Manage Students', icon: '👨‍🎓' },
          { path: '/admin/classes', label: 'Manage Classes', icon: '📚' },
          { path: '/admin/assignments', label: 'Assignment Management', icon: '�' },
          { path: '/admin/messages', label: 'Message Monitor', icon: '💬' },
          { path: '/admin/reports', label: 'Reports', icon: '📈' }
        ];
      case 'teacher':
        return [
          { path: '/teacher', label: 'Dashboard', icon: '📊' },
          { path: '/teacher/my-classes', label: 'My Classes', icon: '📚' },
          { path: '/teacher/assignments', label: 'Assignments', icon: '�' },
          { path: '/teacher/messages', label: 'Messages', icon: '💬' },
          { path: '/teacher/profile', label: 'Profile', icon: '👤' }
        ];
      case 'student':
        return [
          { path: '/student', label: 'Dashboard', icon: '📊' },
          { path: '/student/classes', label: 'My Classes', icon: '📚' },
          { path: '/student/assignments', label: 'My Assignments', icon: '�' },
          { path: '/student/messages', label: 'Messages', icon: '💬' },
          { path: '/student/profile', label: 'Profile', icon: '👤' }
        ];
      default:
        return [];
    }
  };

  const menuItems = getMenuItems();

  return (
    <>
      {/* Overlay for mobile */}
      <div 
        className={`sidebar-overlay ${isOpen ? 'active' : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />
      
      <div className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h3>{role?.toUpperCase()} PANEL</h3>
        </div>
        <ul className="sidebar-menu">
          {menuItems.map((item) => (
            <li key={item.path} className="sidebar-menu-item">
              <Link
                to={item.path}
                className={`sidebar-menu-link ${location.pathname === item.path ? 'sidebar-menu-link-active' : ''}`}
              >
                <span className="sidebar-menu-icon">{item.icon}</span>
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
};

export default Sidebar;
