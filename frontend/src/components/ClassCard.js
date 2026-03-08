import React, { useState, useEffect } from 'react';
import { colors } from '../styles/colors';
import { classesAPI } from '../api/api';

const ClassCard = ({ classData, onJoin, onStart, onViewAttendance, userRole, onEnroll, enrolled = false }) => {
  const [timeRemaining, setTimeRemaining] = useState('');
  const [classStatus, setClassStatus] = useState('upcoming');
  const [enrolledStudents, setEnrolledStudents] = useState([]);
  const [showStudents, setShowStudents] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);

  useEffect(() => {
    const updateCountdown = () => {
      if (!classData.start_time && !classData.date) return;

      const startTime = new Date(classData.start_time || classData.date);
      const endTime = classData.end_time ? new Date(classData.end_time) : null;
      const now = new Date();

      if (endTime && now >= endTime) {
        setClassStatus('ended');
        setTimeRemaining('Class ended');
      } else if (now >= startTime) {
        setClassStatus('active');
        if (endTime) {
          const duration = Math.floor((endTime - now) / 60000);
          setTimeRemaining(`Ongoing - ${duration} mins left`);
        } else {
          setTimeRemaining('Ongoing');
        }
      } else {
        setClassStatus('upcoming');
        const minutes = Math.floor((startTime - now) / 60000);
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        
        if (hours > 0) {
          setTimeRemaining(`${hours}h ${mins}m until start`);
        } else if (minutes > 0) {
          setTimeRemaining(`${minutes}m until start`);
        } else {
          setTimeRemaining('Starting soon');
        }
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 60000);
    return () => clearInterval(interval);
  }, [classData]);

  const fetchEnrolledStudents = async () => {
    try {
      setLoadingStudents(true);
      const response = await classesAPI.getClassStudents(classData.id);
      setEnrolledStudents(response.data || []);
    } catch (error) {
      console.error('Error fetching enrolled students:', error);
      setEnrolledStudents([]);
    } finally {
      setLoadingStudents(false);
    }
  };

  const handleToggleStudents = () => {
    if (!showStudents && enrolledStudents.length === 0) {
      fetchEnrolledStudents();
    }
    setShowStudents(!showStudents);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  const calculateDuration = () => {
    if (!classData.start_time || !classData.end_time) return '';
    const start = new Date(classData.start_time);
    const end = new Date(classData.end_time);
    const durationMs = end - start;
    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0 && minutes > 0) {
      return `${hours}h ${minutes}m`;
    } else if (hours > 0) {
      return `${hours}h`;
    } else {
      return `${minutes}m`;
    }
  };

  const getDaysDisplay = () => {
    if (!classData.days) return '';
    try {
      const daysArray = typeof classData.days === 'string' ? JSON.parse(classData.days) : classData.days;
      if (!Array.isArray(daysArray) || daysArray.length === 0) return '';
      return daysArray.map(d => d.slice(0, 3)).join(', ');
    } catch (e) {
      return '';
    }
  };

  const getStatusColor = () => {
    switch (classStatus) {
      case 'active':
        return colors.gold;
      case 'ended':
        return '#999';
      default:
        return colors.emerald;
    }
  };

  const statusBadgeStyle = {
    display: 'inline-block',
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: 'bold',
    backgroundColor: getStatusColor(),
    color: classStatus === 'ended' ? '#fff' : colors.lightBg,
    marginLeft: '10px'
  };

  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <h3 style={styles.title}>{classData.title}</h3>
        <span style={statusBadgeStyle}>
          {classStatus === 'active' ? 'LIVE' : classStatus === 'ended' ? 'Ended' : 'Upcoming'}
        </span>
      </div>

      <p style={styles.description}>{classData.description}</p>
      <p style={styles.teacher}>
        <strong>Teacher:</strong> {classData.teacher_name}
      </p>

      {classData.start_time && (
        <>
          <p style={styles.date}>
            <strong>{formatDate(classData.start_time)}</strong>
          </p>
          {classData.end_time && (
            <>
              <p style={styles.time}>
                <strong>{formatTime(classData.start_time)} - {formatTime(classData.end_time)}</strong>
              </p>
              <p style={styles.duration}>
                <strong>Duration:</strong> {calculateDuration()}
              </p>
            </>
          )}
          {getDaysDisplay() && (
            <p style={styles.days}>
              <strong>Repeats:</strong> {getDaysDisplay()}
            </p>
          )}
        </>
      )}
      {!classData.start_time && classData.date && (
        <p style={styles.date}>
          <strong>{formatDate(classData.date)}</strong>
        </p>
      )}

      <p style={styles.students}>
        <strong>Students:</strong> {classData.enrollment_count || classData.student_count || 0}
        {(classData.enrollment_count || classData.student_count || 0) > 0 && (
          <button
            onClick={handleToggleStudents}
            style={{
              marginLeft: '10px',
              padding: '2px 8px',
              backgroundColor: colors.emerald,
              color: colors.gold,
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '0.85rem',
              fontWeight: 'bold'
            }}
          >
            {showStudents ? '▼ Hide' : '▶ Show'}
          </button>
        )}
      </p>

      {showStudents && (
        <div style={styles.studentsList}>
          {loadingStudents ? (
            <p style={{ textAlign: 'center', color: '#999', padding: '10px' }}>Loading students...</p>
          ) : enrolledStudents.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#999', padding: '10px' }}>No students enrolled</p>
          ) : (
            <ul style={{ margin: '0', paddingLeft: '20px' }}>
              {enrolledStudents.map((student, idx) => (
                <li key={idx} style={{ color: '#333', marginBottom: '4px', fontSize: '0.9rem' }}>
                  {student.name}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
      {classData.roomId && (
        <p style={styles.roomId}>
          <strong>Room ID:</strong> {classData.roomId}
        </p>
      )}

      {(classData.start_time || classData.date) && (
        <p style={{ ...styles.countdown, color: getStatusColor() }}>
          {timeRemaining}
        </p>
      )}
      
      <div style={styles.buttonContainer}>
        {userRole === 'student' && onEnroll && (
          <button
            onClick={() => onEnroll(classData.id)}
            style={{
              ...styles.button,
              ...styles.buttonSuccess,
              opacity: enrolled || classStatus === 'ended' ? 0.6 : 1,
              cursor: enrolled || classStatus === 'ended' ? 'not-allowed' : 'pointer',
              backgroundColor: enrolled ? colors.emerald : colors.gold
            }}
            disabled={enrolled || classStatus === 'ended'}
          >
            {enrolled ? 'Enrolled' : classStatus === 'ended' ? 'Class Ended' : 'Enroll Now'}
          </button>
        )}

        {userRole === 'student' && onJoin && !onEnroll && (
          <button
            onClick={() => onJoin(classData)}
            style={{ ...styles.button, ...styles.buttonSuccess }}
          >
            Join Class
          </button>
        )}
        
        {userRole === 'teacher' && onStart && (
          <button
            onClick={() => onStart(classData)}
            style={{ ...styles.button, ...styles.buttonPrimary }}
          >
            Start Class
          </button>
        )}
        
        {userRole === 'teacher' && onViewAttendance && (
          <button
            onClick={() => onViewAttendance(classData.id)}
            style={{ ...styles.button, ...styles.buttonSecondary }}
          >
            View Attendance
          </button>
        )}
      </div>
    </div>
  );
};

const styles = {
  card: {
    backgroundColor: colors.white,
    padding: '20px',
    borderRadius: '10px',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
    transition: 'transform 0.3s, box-shadow 0.3s',
    cursor: 'pointer'
  },
  title: {
    color: colors.primary,
    marginBottom: '10px',
    fontSize: '1.5rem'
  },
  description: {
    color: '#666',
    marginBottom: '10px',
    lineHeight: '1.5'
  },
  teacher: {
    color: '#333',
    marginBottom: '8px'
  },
  date: {
    color: colors.secondary,
    fontWeight: '600',
    marginBottom: '10px',
    fontSize: '1rem'
  },
  time: {
    color: '#555',
    marginBottom: '8px',
    fontSize: '0.95rem'
  },
  duration: {
    color: colors.emerald,
    marginBottom: '10px',
    fontSize: '0.95rem',
    fontWeight: '500'
  },
  days: {
    color: '#FF6B6B',
    marginBottom: '10px',
    fontSize: '0.95rem',
    fontWeight: '500'
  },
  countdown: {
    fontSize: '1rem',
    fontWeight: 'bold',
    marginBottom: '15px',
    padding: '8px',
    backgroundColor: '#f8f9fa',
    borderRadius: '5px',
    textAlign: 'center'
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '10px'
  },
  students: {
    color: '#333',
    marginBottom: '8px',
    fontSize: '0.95rem',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  studentsList: {
    backgroundColor: '#f9f9f9',
    border: `1px solid ${colors.emerald}`,
    borderRadius: '6px',
    padding: '10px 12px',
    marginBottom: '12px',
    maxHeight: '200px',
    overflowY: 'auto'
  },
  roomId: {
    color: '#888',
    fontSize: '0.9rem',
    marginBottom: '15px'
  },
  buttonContainer: {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap'
  },
  button: {
    padding: '10px 20px',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '1rem',
    transition: 'all 0.3s',
    flex: 1,
    minWidth: '120px'
  },
  buttonSuccess: {
    backgroundColor: '#28a745',
    color: colors.white
  },
  buttonPrimary: {
    backgroundColor: colors.primary,
    color: colors.white
  },
  buttonSecondary: {
    backgroundColor: colors.secondary,
    color: colors.white
  }
};

export default ClassCard;
