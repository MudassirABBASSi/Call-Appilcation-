import React, { useState, useEffect } from 'react';
import api from '../api/api';
import '../styles/dashboard.css';

const ClassEnrollmentCard = ({ classData, onEnroll, isEnrolled }) => {
  const [loading, setLoading] = useState(false);
  const [enrolled, setEnrolled] = useState(isEnrolled);

  const handleEnroll = async () => {
    if (enrolled) {
      if (window.confirm('Are you sure you want to unenroll from this class?')) {
        await handleUnenroll();
      }
      return;
    }

    setLoading(true);
    try {
      const response = await api.post(`/classes/student/enroll/${classData.id}`);
      if (response.data.success) {
        setEnrolled(true);
        onEnroll?.(classData.id);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error enrolling in class');
    } finally {
      setLoading(false);
    }
  };

  const handleUnenroll = async () => {
    setLoading(true);
    try {
      const response = await api.delete(`/classes/student/classes/${classData.id}`);
      if (response.data.success) {
        setEnrolled(false);
        onEnroll?.(classData.id);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error unenrolling from class');
    } finally {
      setLoading(false);
    }
  };

  const startTime = new Date(classData.date);
  startTime.setHours(classData.start_time.split(':')[0]);
  startTime.setMinutes(classData.start_time.split(':')[1]);

  return (
    <div className="card">
      <div className="card-header">
        <h3>{classData.title}</h3>
        <span className={`badge ${enrolled ? 'badge-success' : 'badge-info'}`}>
          {enrolled ? '✓ Enrolled' : 'Available'}
        </span>
      </div>

      <div className="card-body">
        <p className="card-description">{classData.description}</p>

        <div className="class-info">
          <div className="info-item">
            <span className="label">👨‍🏫 Teacher:</span>
            <span>{classData.teacher_name}</span>
          </div>

          <div className="info-item">
            <span className="label">📅 Date:</span>
            <span>{new Date(classData.date).toLocaleDateString()}</span>
          </div>

          <div className="info-item">
            <span className="label">⏰ Time:</span>
            <span>{classData.start_time} - {classData.end_time}</span>
          </div>

          <div className="info-item">
            <span className="label">👥 Enrolled:</span>
            <span>{classData.enrolled_count || 0} students</span>
          </div>
        </div>
      </div>

      <div className="card-footer">
        <button
          className={`btn-full ${enrolled ? 'btn-secondary' : 'btn-primary'}`}
          onClick={handleEnroll}
          disabled={loading}
        >
          {loading ? 'Processing...' : (enrolled ? 'Unenroll' : 'Enroll Now')}
        </button>
      </div>
    </div>
  );
};

const StudentClassEnrollment = () => {
  const [classes, setClasses] = useState([]);
  const [enrolledClasses, setEnrolledClasses] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, enrolled

  useEffect(() => {
    fetchClasses();
    fetchEnrolledClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const response = await api.get('/classes/active');
      if (response.data.success) {
        setClasses(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching classes:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchEnrolledClasses = async () => {
    try {
      const response = await api.get('/classes/student/my-classes');
      if (response.data.success) {
        setEnrolledClasses(new Set(response.data.data.map(c => c.id)));
      }
    } catch (err) {
      console.error('Error fetching enrolled classes:', err);
    }
  };

  const handleEnroll = async (classId) => {
    // Refresh lists
    fetchClasses();
    fetchEnrolledClasses();
  };

  const filteredClasses = filter === 'enrolled'
    ? classes.filter(c => enrolledClasses.has(c.id))
    : classes;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>📚 Available Classes</h1>
        <div className="filter-buttons">
          <button
            className={`btn-small ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All Classes
          </button>
          <button
            className={`btn-small ${filter === 'enrolled' ? 'active' : ''}`}
            onClick={() => setFilter('enrolled')}
          >
            My Classes ({enrolledClasses.size})
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading">Loading classes...</div>
      ) : filteredClasses.length === 0 ? (
        <div className="no-data">
          {filter === 'enrolled'
            ? 'You are not enrolled in any classes yet'
            : 'No classes available'}
        </div>
      ) : (
        <div className="cards-grid">
          {filteredClasses.map(cls => (
            <ClassEnrollmentCard
              key={cls.id}
              classData={cls}
              onEnroll={handleEnroll}
              isEnrolled={enrolledClasses.has(cls.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentClassEnrollment;
