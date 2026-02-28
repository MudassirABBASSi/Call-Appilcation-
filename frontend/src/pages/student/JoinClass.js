import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { studentAPI } from '../../api/api';

const JoinClass = () => {
  const { classId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const joinClass = async () => {
      try {
        // Call join endpoint to mark attendance and get roomId
        const response = await studentAPI.joinClass(classId);
        const roomId = response.data.roomId;

        // Redirect to Jitsi meeting in new tab
        const meetingUrl = `https://meet.jit.si/${roomId}`;
        window.open(meetingUrl, '_blank');

        // After opening in new tab, redirect back to classes
        setTimeout(() => {
          navigate('/student/classes');
        }, 500);
      } catch (error) {
        console.error('Error joining class:', error);
        alert(error.response?.data?.message || 'Error joining class');
        navigate('/student/classes');
      }
    };

    joinClass();
  }, [classId, navigate]);

  return (
    <div style={styles.loading}>
      <div style={styles.loadingContent}>
        <div style={styles.spinner}></div>
        <h2>Opening your class...</h2>
        <p>A new tab will open with your Jitsi meeting room</p>
        <p style={styles.infoText}>💡 Tip: Don't forget to allow camera and microphone access!</p>
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

export default JoinClass;
