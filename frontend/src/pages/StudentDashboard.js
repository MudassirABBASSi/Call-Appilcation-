import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import ClassCard from '../components/ClassCard';
import { studentAPI } from '../api/api';
import { colors } from '../styles/colors';
import { useNavigate } from 'react-router-dom';
import '../styles/dashboard.css';

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const response = await studentAPI.getClasses();
      setClasses(response.data || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching classes:', error);
      setClasses([]);
      setLoading(false);
    }
  };

  const handleJoinClass = async (classData) => {
    navigate(`/student/join-class/${classData.id}`);
  };

  return (
    <div className="dashboard-container">
      <Navbar />
      <Sidebar />
      <div className="main-content">
        <div className="content-wrapper">
          <h1 style={styles.pageTitle}>Student Dashboard</h1>

          {message.text && (
            <div className={`alert alert-${message.type}`}>
              {message.text}
            </div>
          )}
          
          <div className="stats-container">
            <div className="stat-card">
              <h3>{classes.length}</h3>
              <p>Available Classes</p>
            </div>
            <div className="stat-card">
              <h3>{classes.filter(c => {
                const classDate = new Date(c.date);
                const now = new Date();
                const daysDiff = (classDate - now) / (1000 * 60 * 60 * 24);
                return daysDiff <= 7 && daysDiff >= 0;
              }).length}</h3>
              <p>This Week</p>
            </div>
            <div className="stat-card">
              <h3>{classes.filter(c => {
                const classDate = new Date(c.date);
                const now = new Date();
                return classDate.toDateString() === now.toDateString();
              }).length}</h3>
              <p>Today's Classes</p>
            </div>
          </div>

          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Upcoming Classes</h2>

            {loading ? (
              <p>Loading...</p>
            ) : classes.length === 0 ? (
              <div className="table-container">
                <p>No upcoming classes available at the moment.</p>
              </div>
            ) : (
              <div className="classes-grid">
                {classes.map((classData) => (
                  <ClassCard
                    key={classData.id}
                    classData={classData}
                    userRole="student"
                    onJoin={handleJoinClass}
                  />
                ))}
              </div>
            )}
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
  section: {
    marginTop: '40px'
  },
  sectionTitle: {
    color: colors.primary,
    marginBottom: '20px'
  }
};

export default StudentDashboard;
