import React, { useEffect, useState } from 'react';
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
          <div className="content-wrapper">
          <div style={styles.header}>
            <h1 style={styles.pageTitle}>My Classes</h1>
          </div>

          {loading ? (
            <p>Loading...</p>
          ) : classes.length === 0 ? (
            <div className="table-container">
              <p>No classes assigned yet. Check back regularly for new classes.</p>
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
  );
};

const styles = {
  header: {
    marginBottom: '30px'
  },
  pageTitle: {
    color: colors.primary,
    margin: 0
  }
};

export default MyClasses;
