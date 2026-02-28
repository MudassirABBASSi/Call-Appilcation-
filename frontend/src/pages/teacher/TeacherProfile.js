import React from 'react';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import { colors } from '../../styles/colors';
import '../../styles/dashboard.css';

const TeacherProfile = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  return (
    <div className="dashboard-container">
      <Navbar />
      <Sidebar />
      <div className="main-content">
        <div className="content-wrapper">
          <h1 style={styles.pageTitle}>My Profile</h1>

          <div className="form-container">
            <div style={styles.profileSection}>
              <div style={styles.avatar}>
                {user.name?.charAt(0).toUpperCase()}
              </div>
              <h2 style={styles.name}>{user.name}</h2>
              <p style={styles.role}>{user.role?.toUpperCase()}</p>
            </div>

            <div style={styles.infoSection}>
              <div style={styles.infoRow}>
                <strong>Email:</strong>
                <span>{user.email}</span>
              </div>
              <div style={styles.infoRow}>
                <strong>Role:</strong>
                <span>{user.role}</span>
              </div>
              <div style={styles.infoRow}>
                <strong>User ID:</strong>
                <span>{user.id}</span>
              </div>
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
    marginBottom: '30px'
  },
  profileSection: {
    textAlign: 'center',
    marginBottom: '30px'
  },
  avatar: {
    width: '100px',
    height: '100px',
    borderRadius: '50%',
    backgroundColor: colors.primary,
    color: colors.white,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '3rem',
    margin: '0 auto 20px',
    fontWeight: 'bold'
  },
  name: {
    color: colors.primary,
    marginBottom: '5px'
  },
  role: {
    color: colors.secondary,
    fontWeight: '600'
  },
  infoSection: {
    marginTop: '30px'
  },
  infoRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '15px',
    borderBottom: '1px solid #ddd',
    fontSize: '1rem'
  }
};

export default TeacherProfile;
