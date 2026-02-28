import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { teacherAPI } from '../../api/api';

const StartClass = () => {
  const { classId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const startClass = async () => {
      try {
        // Fetch class data to get roomId
        const response = await teacherAPI.getMyClasses();
        const foundClass = response.data.find(c => c.id === parseInt(classId));
        
        if (foundClass) {
          // Redirect to Jitsi meeting in new tab
          const meetingUrl = `https://meet.jit.si/${foundClass.roomId}`;
          window.open(meetingUrl, '_blank');

          // After opening in new tab, redirect back to my classes
          setTimeout(() => {
            navigate('/teacher/my-classes');
          }, 500);
        } else {
          alert('Class not found');
          navigate('/teacher/my-classes');
        }
      } catch (error) {
        console.error('Error starting class:', error);
        alert('Error loading class');
        navigate('/teacher/my-classes');
      }
    };

    startClass();
  }, [classId, navigate]);

  return (
    <div style={styles.loading}>
      <div style={styles.loadingContent}>
        <div style={styles.spinner}></div>
        <h2>Opening your class...</h2>
        <p>A new tab will open with your Jitsi meeting room</p>
        <p style={styles.infoText}>📌 Tip: Students can join as soon as you're in the meeting room!</p>
      </div>
    </div>
  );
};

const styles = {
  loading: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    backgroundColor: '#0F3D3E',
    color: '#fff'
  },
  loadingContent: {
    textAlign: 'center',
    maxWidth: '500px'
  },
  spinner: {
    border: '4px solid #f3f3f3',
    borderTop: '4px solid #D4AF37',
    borderRadius: '50%',
    width: '50px',
    height: '50px',
    animation: 'spin 1s linear infinite',
    margin: '0 auto 20px'
  },
  infoText: {
    marginTop: '20px',
    fontSize: '0.9rem',
    color: '#D4AF37',
    fontStyle: 'italic'
  }
};

// Add keyframe animation for spinner
const styleSheet = document.styleSheets[0];
const keyframes = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
styleSheet.insertRule(keyframes, styleSheet.cssRules.length);

export default StartClass;
