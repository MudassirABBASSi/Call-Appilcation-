import React, { useEffect, useState } from 'react';
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
    const interval = setInterval(fetchClasses, 60000); // Refresh every minute
    return () => clearInterval(interval);
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

  const upcomingClasses = classes.filter(c => {
    const startTime = new Date(c.start_time || c.date);
    return startTime > new Date();
  });

  const activeClasses = classes.filter(c => {
    const startTime = new Date(c.start_time || c.date);
    const endTime = c.end_time ? new Date(c.end_time) : null;
    const now = new Date();
    return startTime <= now && (!endTime || endTime > now);
  });

  const pastClasses = classes.filter(c => {
    const endTime = c.end_time ? new Date(c.end_time) : new Date(c.start_time || c.date);
    return endTime <= new Date();
  });

  return (
          <div className="content-wrapper">
        <div style={styles.headerContainer}>
          <h1 style={styles.pageTitle}>Teacher Dashboard</h1>
        </div>
        
        <div className="stats-container">
          <div className="stat-card">
            <h3>{upcomingClasses.length}</h3>
            <p>Upcoming Classes</p>
          </div>
          <div className="stat-card">
            <h3>{activeClasses.length}</h3>
            <p>Active Classes</p>
          </div>
          <div className="stat-card">
            <h3>{classes.length}</h3>
            <p>Total Classes</p>
          </div>
        </div>

        {activeClasses.length > 0 && (
          <div style={styles.activeClassesSection}>
            <h2 style={{...styles.sectionTitle, color: colors.gold}}>Active Now</h2>
            <div className="classes-grid">
              {activeClasses.map((classData) => (
                <ClassCard
                  key={classData.id}
                  classData={classData}
                  userRole="teacher"
                  onStart={handleStartClass}
                  onViewAttendance={handleViewAttendance}
                />
              ))}
            </div>
          </div>
        )}

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Upcoming Classes</h2>

          {loading ? (
            <p>Loading...</p>
          ) : upcomingClasses.length === 0 ? (
            <div className="table-container">
              <p>No upcoming classes. Create your first class!</p>
            </div>
          ) : (
            <div className="classes-grid">
              {upcomingClasses.map((classData) => (
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

        {pastClasses.length > 0 && (
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Past Classes</h2>
            <div className="classes-grid">
              {pastClasses.map((classData) => (
                <ClassCard
                  key={classData.id}
                  classData={classData}
                  userRole="teacher"
                  onViewAttendance={handleViewAttendance}
                />
              ))}
            </div>
          </div>
        )}

        <TeacherStudentsList />
      </div>
  );
};

const styles = {
  headerContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '30px'
  },
  pageTitle: {
    color: colors.primary,
    marginBottom: 0,
    fontSize: '2rem',
    flex: 1
  },
  section: {
    marginTop: '40px'
  },
  activeClassesSection: {
    marginTop: '30px',
    padding: '20px',
    backgroundColor: '#fffbf0',
    borderRadius: '8px',
    borderLeft: `4px solid ${colors.gold}`
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
