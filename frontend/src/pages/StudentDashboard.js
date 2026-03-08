import React, { useEffect, useState } from 'react';
import ClassCard from '../components/ClassCard';
import { classesAPI } from '../api/api';
import { colors } from '../styles/colors';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import '../styles/dashboard.css';

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [enrolledClasses, setEnrolledClasses] = useState([]);
  const [availableClasses, setAvailableClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('enrolled'); // 'enrolled' or 'available'

  useEffect(() => {
    fetchAllClasses();
  }, []);

  const fetchAllClasses = async () => {
    try {
      setLoading(true);
      
      // Fetch enrolled classes
      const enrolledResponse = await classesAPI.getStudentClasses();
      setEnrolledClasses(enrolledResponse.data || []);
      
      // Fetch all available classes
      const availableResponse = await classesAPI.getAllClasses();
      const enrolledIds = new Set((enrolledResponse.data || []).map(c => c.id));
      
      // Filter out already enrolled classes
      const availableForEnrollment = (availableResponse.data || []).filter(
        c => !enrolledIds.has(c.id)
      );
      setAvailableClasses(availableForEnrollment);
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching classes:', error);
      toast.error('Failed to load classes');
      setLoading(false);
    }
  };

  const handleEnroll = async (classId) => {
    try {
      await classesAPI.enrollStudent(classId);
      toast.success('Successfully enrolled in class!');
      
      // Move class from available to enrolled
      const enrolledClass = availableClasses.find(c => c.id === classId);
      if (enrolledClass) {
        setEnrolledClasses([...enrolledClasses, enrolledClass]);
        setAvailableClasses(availableClasses.filter(c => c.id !== classId));
      }
      
      setActiveTab('enrolled');
    } catch (error) {
      console.error('Error enrolling in class:', error);
      toast.error(error.response?.data?.message || 'Failed to enroll in class');
    }
  };

  const handleUnenroll = async (classId) => {
    try {
      await classesAPI.unenrollStudent(classId);
      toast.success('Unenrolled from class');
      
      // Move class back to available
      const unenrolledClass = enrolledClasses.find(c => c.id === classId);
      if (unenrolledClass) {
        setAvailableClasses([...availableClasses, unenrolledClass]);
        setEnrolledClasses(enrolledClasses.filter(c => c.id !== classId));
      }
    } catch (error) {
      console.error('Error unenrolling:', error);
      toast.error('Failed to unenroll from class');
    }
  };

  const handleJoinClass = async (classData) => {
    navigate(`/student/join-class/${classData.id}`);
  };

  const displayClasses = activeTab === 'enrolled' ? enrolledClasses : availableClasses;

  return (
          <div className="content-wrapper">
        <div style={styles.headerContainer}>
          <h1 style={styles.pageTitle}>Student Dashboard</h1>
        </div>
          
          <div className="stats-container">
            <div className="stat-card">
              <h3>{enrolledClasses.length}</h3>
              <p>Enrolled Classes</p>
            </div>
            <div className="stat-card">
              <h3>{availableClasses.length}</h3>
              <p>Available to Join</p>
            </div>
            <div className="stat-card">
              <h3>{enrolledClasses.filter(c => {
                const startTime = new Date(c.start_time);
                const now = new Date();
                return startTime > now;
              }).length}</h3>
              <p>Upcoming</p>
            </div>
          </div>

          <div style={styles.section}>
            <div style={styles.tabContainer}>
              <button
                style={{
                  ...styles.tab,
                  borderBottomColor: activeTab === 'enrolled' ? colors.gold : 'transparent',
                  fontWeight: activeTab === 'enrolled' ? 'bold' : 'normal',
                  color: activeTab === 'enrolled' ? colors.primary : '#666'
                }}
                onClick={() => setActiveTab('enrolled')}
              >
                My Classes ({enrolledClasses.length})
              </button>
              <button
                style={{
                  ...styles.tab,
                  borderBottomColor: activeTab === 'available' ? colors.gold : 'transparent',
                  fontWeight: activeTab === 'available' ? 'bold' : 'normal',
                  color: activeTab === 'available' ? colors.primary : '#666'
                }}
                onClick={() => setActiveTab('available')}
              >
                Available Classes ({availableClasses.length})
              </button>
            </div>

            {loading ? (
              <p style={styles.loadingText}>Loading classes...</p>
            ) : displayClasses.length === 0 ? (
              <div style={styles.emptyState}>
                <p>{activeTab === 'enrolled' ? 'You have not enrolled in any classes yet.' : 'No classes available to join.'}</p>
              </div>
            ) : (
              <div className="classes-grid">
                {displayClasses.map((classData) => (
                  <ClassCard
                    key={classData.id}
                    classData={classData}
                    userRole="student"
                    onJoin={handleJoinClass}
                    onEnroll={activeTab === 'available' ? handleEnroll : undefined}
                    enrolled={enrolledClasses.some(c => c.id === classData.id)}
                    showEnrollButton={activeTab === 'available'}
                    showCountdown={true}
                  />
                ))}
              </div>
            )}
          </div>
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
  tabContainer: {
    display: 'flex',
    borderBottom: `2px solid #eee`,
    marginBottom: '20px',
    gap: '20px'
  },
  tab: {
    backgroundColor: 'transparent',
    border: 'none',
    padding: '10px 0',
    fontSize: '16px',
    cursor: 'pointer',
    borderBottom: '2px solid transparent',
    transition: 'all 0.3s ease'
  },
  loadingText: {
    textAlign: 'center',
    color: '#666',
    padding: '20px'
  },
  emptyState: {
    textAlign: 'center',
    padding: '40px 20px',
    backgroundColor: colors.lightBg,
    borderRadius: '8px',
    color: '#666'
  }
};

export default StudentDashboard;
