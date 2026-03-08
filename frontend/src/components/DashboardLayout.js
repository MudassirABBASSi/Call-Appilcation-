import React, { useState, useEffect, useCallback } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

const DashboardLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Close sidebar on window resize if desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 992) {
        setIsSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen(prev => !prev);
  }, []);

  const closeSidebar = useCallback(() => {
    setIsSidebarOpen(false);
  }, []);

  return (
    <div className="dashboard-container">
      <Navbar 
        isSidebarOpen={isSidebarOpen} 
        onToggleSidebar={toggleSidebar}
      />
      <Sidebar 
        isOpen={isSidebarOpen}
        onClose={closeSidebar}
      />
      <div className="main-content">
        {children || <Outlet />}
      </div>
    </div>
  );
};

export default DashboardLayout;
