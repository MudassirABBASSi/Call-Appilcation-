import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import ClassCard from '../components/ClassCard';
import TeacherStudentsList from '../components/TeacherStudentsList';
import { teacherAPI } from '../api/api';
import { colors } from '../styles/colors';
import { useNavigate } from 'react-router-dom';
import '../styles/dashboard.css';

const TeacherDashboard = () => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const response = await teacherAPI.getMyClasses();
      setClasses(response.data || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching classes:', error);
      setClasses([]);
      setLoading(false);
    }
  };

  const handleStartClass = (classData) => {
    navigate(`/teacher/start-class/${classData.id}`);
  };

  const handleViewAttendance = (classId) => {
    navigate(`/teacher/attendance/${classId}`);
  };

  return (
    <div className="dashboard-container">
      <Navbar />
      <Sidebar />
      <div className="main-content">
        <div className="content-wrapper">
          <h1 style={styles.pageTitle}>Teacher Dashboard</h1>
          
          <div className="stats-container">
            <div className="stat-card">
              <h3>{classes.length}</h3>
              <p>Total Classes</p>
            </div>
            <div className="stat-card">
              <h3>{classes.filter(c => new Date(c.date) >= new Date()).length}</h3>
              <p>Upcoming Classes</p>
            </div>
            <div className="stat-card">
              <h3>{classes.filter(c => new Date(c.date) < new Date()).length}</h3>
              <p>Past Classes</p>
            </div>
          </div>

          <div style={styles.section}>
            <div style={styles.sectionHeader}>
              <h2 style={styles.sectionTitle}>My Classes</h2>
              <button
                onClick={() => navigate('/teacher/create-class')}
                className="btn btn-primary"
              >
                Create New Class
              </button>
            </div>

            {loading ? (
              <p>Loading...</p>
            ) : classes.length === 0 ? (
              <div className="table-container">
                <p>No classes found. Create your first class!</p>
              </div>
            ) : (
              <div className="classes-grid">
                {classes.map((classData) => (
                  <ClassCard
                    key={classData.id}
                    classData={classData}
                    userRole="teacher"
                    onStart={handleStartClass}
                    onViewAttendance={handleViewAttendance}
                  />
                ))}
              </div>
            )}
          </div>

          <TeacherStudentsList />
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
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px'
  },
  sectionTitle: {
    color: colors.primary,
    margin: 0
  }
};

export default TeacherDashboard;
