import React from 'react';
import { colors } from '../styles/colors';

const ClassCard = ({ classData, onJoin, onStart, onViewAttendance, userRole }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div style={styles.card}>
      <h3 style={styles.title}>{classData.title}</h3>
      <p style={styles.description}>{classData.description}</p>
      <p style={styles.teacher}>
        <strong>Teacher:</strong> {classData.teacher_name}
      </p>
      <p style={styles.date}>
        <strong>📅 {formatDate(classData.date)}</strong>
      </p>
      <p style={styles.students}>
        <strong>👥 Students Enrolled:</strong> {classData.student_count || 0}
      </p>
      <p style={styles.roomId}>
        <strong>Room ID:</strong> {classData.roomId}
      </p>
      
      <div style={styles.buttonContainer}>
        {userRole === 'student' && onJoin && (
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
  students: {
    color: '#333',
    marginBottom: '8px',
    fontSize: '0.95rem'
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
