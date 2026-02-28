import React, { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import ClassCard from '../../components/ClassCard';
import { teacherAPI } from '../../api/api';
import { colors } from '../../styles/colors';
import { useNavigate } from 'react-router-dom';
import '../../styles/dashboard.css';

const MyClasses = () => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const response = await teacherAPI.getMyClasses();
      setClasses(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching classes:', error);
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
          <div style={styles.header}>
            <h1 style={styles.pageTitle}>My Classes</h1>
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
      </div>
    </div>
  );
};

const styles = {
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '30px'
  },
  pageTitle: {
    color: colors.primary,
    margin: 0
  }
};

export default MyClasses;
