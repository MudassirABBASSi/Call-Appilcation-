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

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [availableClasses, setAvailableClasses] = useState([]);
  const [enrolledClasses, setEnrolledClasses] = useState([]);
  const [enrolledClassIds, setEnrolledClassIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('available'); // 'available', 'enrolled'

  useEffect(() => {
    fetchClasses();
    // Poll for notifications
    const interval = setInterval(() => {
      fetchClasses();
    }, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const [activeRes, myClassesRes] = await Promise.all([
        api.get('/classes/active'),
        api.get('/classes/student/my-classes')
      ]);

      if (activeRes.data.success) {
        setAvailableClasses(activeRes.data.data);
      }

      if (myClassesRes.data.success) {
        setEnrolledClasses(myClassesRes.data.data);
        const ids = new Set(myClassesRes.data.data.map(c => c.id));
        setEnrolledClassIds(ids);
      }
    } catch (error) {
      console.error('Error fetching classes:', error);
      toastService.error('Error loading classes');
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async (classId) => {
    try {
      const response = await api.post(`/classes/student/enroll/${classId}`);
      if (response.data.success) {
        toastService.enrollmentSuccess(
          availableClasses.find(c => c.id === classId)?.title || 'Class'
        );
        toastService.attendanceMarked();
        await fetchClasses();
      }
    } catch (error) {
      toastService.error(error.response?.data?.message || 'Error enrolling in class');
    }
  };

  const handleUnenroll = async (classId) => {
    if (window.confirm('Are you sure you want to unenroll from this class?')) {
      try {
        const response = await api.delete(`/classes/student/classes/${classId}`);
        if (response.data.success) {
          toastService.success('Successfully unenrolled from class');
          await fetchClasses();
        }
      } catch (error) {
        toastService.error(error.response?.data?.message || 'Error unenrolling');
      }
    }
  };

  const handleJoinClass = (classId) => {
    navigate(`/student/join-class/${classId}`);
  };

  const upcomingEnrolled = enrolledClasses.filter(
    c => new Date(c.date) >= new Date()
  );
  const pastEnrolled = enrolledClasses.filter(
    c => new Date(c.date) < new Date()
  );

  let displayClasses = filter === 'available' ? availableClasses : enrolledClasses;

  return (
    <div className="dashboard-container">
      <Navbar />
      <Sidebar />
      <div className="main-content">
        <div className="content-wrapper">
          <h1 style={styles.pageTitle}>📚 Student Dashboard</h1>

          <div className="stats-container">
            <div className="stat-card" style={styles.statCard}>
              <h3>{availableClasses.length}</h3>
              <p>Available Classes</p>
            </div>
            <div className="stat-card" style={styles.statCard}>
              <h3>{upcomingEnrolled.length}</h3>
              <p>Upcoming</p>
            </div>
            <div className="stat-card" style={styles.statCard}>
              <h3>{enrolledClasses.length}</h3>
              <p>Enrolled Classes</p>
            </div>
          </div>

          <div style={styles.section}>
            <div style={styles.sectionHeader}>
              <h2 style={styles.sectionTitle}>Classes</h2>
              <div className="filter-buttons">
                <button
                  className={`btn-small ${filter === 'available' ? 'active' : ''}`}
                  onClick={() => setFilter('available')}
                >
                  All Available ({availableClasses.length})
                </button>
                <button
                  className={`btn-small ${filter === 'enrolled' ? 'active' : ''}`}
                  onClick={() => setFilter('enrolled')}
                >
                  My Classes ({enrolledClasses.length})
                </button>
              </div>
            </div>

            <ClassList
              classes={displayClasses}
              loading={loading}
              type="enroll"
              enrolledClassIds={enrolledClassIds}
              onEnroll={handleEnroll}
              onUnenroll={handleUnenroll}
            />
          </div>

          {enrolledClasses.length > 0 && (
            <div style={styles.section}>
              <h2 style={styles.sectionTitle}>Upcoming Classes</h2>
              {upcomingEnrolled.length > 0 ? (
                <div className="cards-grid">
                  {upcomingEnrolled.slice(0, 3).map(cls => (
                    <div key={cls.id} className="card">
                      <div className="card-header">
                        <h3>{cls.title}</h3>
                        <span className="badge badge-success">Enrolled</span>
                      </div>
                      <div className="card-body">
                        <div className="class-info">
                          <div className="info-item">
                            <span className="label">👨‍🏫 Teacher:</span>
                            <span>{cls.teacher_name}</span>
                          </div>
                          <div className="info-item">
                            <span className="label">📅 Date:</span>
                            <span>{new Date(cls.date).toLocaleDateString()}</span>
                          </div>
                          <div className="info-item">
                            <span className="label">⏰ Time:</span>
                            <span>{cls.start_time} - {cls.end_time}</span>
                          </div>
                        </div>
                      </div>
                      <div className="card-footer">
                        <button
                          className="btn-full btn-primary"
                          onClick={() => handleJoinClass(cls.id)}
                        >
                          ▶️ Join Class
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-data">No upcoming classes</div>
              )}
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
  }
};

export default StudentDashboard;
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
