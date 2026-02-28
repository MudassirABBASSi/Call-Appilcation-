import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { adminAPI } from '../api/api';
import { colors } from '../styles/colors';
import '../styles/dashboard.css';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalTeachers: 0,
    totalStudents: 0,
    totalClasses: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [teachersRes, studentsRes, classesRes] = await Promise.all([
        adminAPI.getTeachers(),
        adminAPI.getStudents(),
        adminAPI.getClasses()
      ]);

      setStats({
        totalTeachers: teachersRes.data.length,
        totalStudents: studentsRes.data.length,
        totalClasses: classesRes.data.length
      });
      setLoading(false);
    } catch (error) {
      console.error('Error fetching stats:', error);
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-container">
      <Navbar />
      <Sidebar />
      <div className="main-content">
        <div className="content-wrapper">
          <h1 style={styles.pageTitle}>Admin Dashboard</h1>
          
          {loading ? (
            <p>Loading...</p>
          ) : (
            <div className="stats-container">
              <div className="stat-card" style={styles.statCard}>
                <h3>{stats.totalTeachers}</h3>
                <p>Total Teachers</p>
              </div>
              <div className="stat-card" style={styles.statCard}>
                <h3>{stats.totalStudents}</h3>
                <p>Total Students</p>
              </div>
              <div className="stat-card" style={styles.statCard}>
                <h3>{stats.totalClasses}</h3>
                <p>Total Classes</p>
              </div>
            </div>
          )}

          <div style={styles.quickActions}>
            <h2 style={styles.sectionTitle}>Quick Actions</h2>
            <div style={styles.actionsGrid}>
              <a href="/admin/teachers" style={styles.actionCard}>
                <span style={styles.actionIcon}>👨‍🏫</span>
                <h3>Manage Teachers</h3>
                <p>Add, view, and manage teachers</p>
              </a>
              <a href="/admin/students" style={styles.actionCard}>
                <span style={styles.actionIcon}>👨‍🎓</span>
                <h3>Manage Students</h3>
                <p>Add, view, and manage students</p>
              </a>
              <a href="/admin/classes" style={styles.actionCard}>
                <span style={styles.actionIcon}>📚</span>
                <h3>Manage Classes</h3>
                <p>View and manage all classes</p>
              </a>
              <a href="/admin/reports" style={styles.actionCard}>
                <span style={styles.actionIcon}>📈</span>
                <h3>Reports</h3>
                <p>View system reports and analytics</p>
              </a>
              <a href="/admin/fees" style={styles.actionCard}>
                <span style={styles.actionIcon}>💰</span>
                <h3>Fee Management</h3>
                <p>Manage fees, view payments, and reports</p>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  pageTitle: {
    color: colors.primary,
    marginBottom: '30px',
    fontSize: '2rem'
  },
  statCard: {
    borderLeft: `4px solid ${colors.secondary}`
  },
  quickActions: {
    marginTop: '40px'
  },
  sectionTitle: {
    color: colors.primary,
    marginBottom: '20px'
  },
  actionsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '20px'
  },
  actionCard: {
    backgroundColor: colors.white,
    padding: '25px',
    borderRadius: '10px',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
    textDecoration: 'none',
    color: '#333',
    transition: 'transform 0.3s, box-shadow 0.3s',
    cursor: 'pointer',
    textAlign: 'center'
  },
  actionIcon: {
    fontSize: '3rem',
    display: 'block',
    marginBottom: '15px'
  }
};

export default AdminDashboard;
