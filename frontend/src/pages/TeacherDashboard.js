import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import ClassList from '../components/ClassList';
import api from '../api/api';
import toastService from '../services/toastService';
import '../styles/dashboard.css';

const TeacherDashboard = () => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalClasses: 0,
    upcomingClasses: 0,
    totalStudents: 0
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const response = await api.get('/classes/list');
      if (response.data.success) {
        const teacherClasses = response.data.data.filter(c => c.is_active !== false);
        setClasses(teacherClasses);

        // Calculate stats
        const upcoming = teacherClasses.filter(c => new Date(c.date) >= new Date());
        const totalStudents = teacherClasses.reduce(
          (sum, cls) => sum + (cls.enrolled_count || 0),
          0
        );

        setStats({
          totalClasses: teacherClasses.length,
          upcomingClasses: upcoming.length,
          totalStudents: totalStudents
        });
      }
    } catch (error) {
      console.error('Error fetching classes:', error);
      toastService.error('Error loading classes');
    } finally {
      setLoading(false);
    }
  };

  const handleStartClass = (classId) => {
    navigate(`/teacher/start-class/${classId}`);
  };

  const handleViewAttendance = (classId) => {
    navigate(`/teacher/attendance/${classId}`);
  };

  const handleCreateClass = () => {
    navigate('/teacher/create-class');
  };

  const handleManageClass = (classId) => {
    navigate(`/teacher/manage-class/${classId}`);
  };

  const upcomingClasses = classes.filter(c => new Date(c.date) >= new Date());
  const pastClasses = classes.filter(c => new Date(c.date) < new Date());

  return (
    <div className="dashboard-container">
      <Navbar />
      <Sidebar />
      <div className="main-content">
        <div className="content-wrapper">
          <h1 style={styles.pageTitle}>👨‍🏫 Teacher Dashboard</h1>

          <div className="stats-container">
            <div className="stat-card" style={styles.statCard}>
              <h3>{stats.totalClasses}</h3>
              <p>Total Classes</p>
            </div>
            <div className="stat-card" style={styles.statCard}>
              <h3>{stats.upcomingClasses}</h3>
              <p>Upcoming Classes</p>
            </div>
            <div className="stat-card" style={styles.statCard}>
              <h3>{stats.totalStudents}</h3>
              <p>Total Enrolled</p>
            </div>
          </div>

          <div style={styles.section}>
            <div style={styles.sectionHeader}>
              <h2 style={styles.sectionTitle}>My Classes</h2>
              <button
                className="btn btn-primary"
                onClick={handleCreateClass}
              >
                + Create New Class
              </button>
            </div>

            {upcomingClasses.length > 0 && (
              <>
                <h3 style={styles.subsectionTitle}>Upcoming Classes</h3>
                <ClassList
                  classes={upcomingClasses}
                  loading={loading}
                  type="teacher"
                  onStartClass={handleStartClass}
                  onViewAttendance={handleViewAttendance}
                />
              </>
            )}

            {pastClasses.length > 0 && (
              <>
                <h3 style={styles.subsectionTitle}>Past Classes</h3>
                <ClassList
                  classes={pastClasses}
                  loading={false}
                  type="teacher"
                  onViewAttendance={handleViewAttendance}
                />
              </>
            )}

            {classes.length === 0 && !loading && (
              <div className="no-data">
                <p>No classes yet. Create your first class to get started!</p>
                <button
                  className="btn btn-primary"
                  onClick={handleCreateClass}
                  style={{ marginTop: '15px' }}
                >
                  Create Class
                </button>
              </div>
            )}
          </div>

          {upcomingClasses.length > 0 && (
            <div style={styles.section}>
              <h2 style={styles.sectionTitle}>Quick Actions</h2>
              <div className="cards-grid">
                {upcomingClasses.slice(0, 3).map(cls => (
                  <div key={cls.id} className="card">
                    <div className="card-header">
                      <h3>{cls.title}</h3>
                      <span className="badge badge-success">Upcoming</span>
                    </div>
                    <div className="card-body">
                      <div className="class-info">
                        <div className="info-item">
                          <span className="label">📅 Date:</span>
                          <span>{new Date(cls.date).toLocaleDateString()}</span>
                        </div>
                        <div className="info-item">
                          <span className="label">⏰ Time:</span>
                          <span>{cls.start_time} - {cls.end_time}</span>
                        </div>
                        <div className="info-item">
                          <span className="label">👥 Students:</span>
                          <span>{cls.enrolled_count || 0}</span>
                        </div>
                      </div>
                    </div>
                    <div className="card-footer">
                      <button
                        className="btn-full btn-primary"
                        onClick={() => handleStartClass(cls.id)}
                      >
                        ▶️ Start Class
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <ToastContainer
        position="top-right"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </div>
  );
};

const styles = {
  pageTitle: {
    color: '#0F3D3E',
    fontSize: '2rem',
    marginBottom: '20px'
  },
  statCard: {
    background: 'linear-gradient(135deg, #0F3D3E 0%, #134e4a 100%)',
    color: 'white'
  },
  section: {
    marginTop: '40px'
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    flexWrap: 'wrap',
    gap: '15px'
  },
  sectionTitle: {
    color: '#0F3D3E',
    fontSize: '1.5rem',
    margin: 0
  },
  subsectionTitle: {
    color: '#0F3D3E',
    fontSize: '1.2rem',
    marginTop: '25px',
    marginBottom: '15px'
  }
};

export default TeacherDashboard;
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
