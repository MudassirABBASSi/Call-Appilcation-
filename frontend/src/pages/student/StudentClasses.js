import React, { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import ClassCard from '../../components/ClassCard';
import { studentAPI } from '../../api/api';
import { colors } from '../../styles/colors';
import { useNavigate } from 'react-router-dom';
import '../../styles/dashboard.css';

const StudentClasses = () => {
  const navigate = useNavigate();
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const response = await studentAPI.getClasses();
      setClasses(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching classes:', error);
      setLoading(false);
    }
  };

  const handleJoinClass = async (classData) => {
    navigate(`/student/join-class/${classData.id}`);
  };

  return (
    <div className="dashboard-container">
      <Navbar />
      <Sidebar />
      <div className="main-content">
        <div className="content-wrapper">
          <h1 style={styles.pageTitle}>My Classes</h1>

          {message.text && (
            <div className={`alert alert-${message.type}`}>
              {message.text}
            </div>
          )}

          {loading ? (
            <p>Loading...</p>
          ) : classes.length === 0 ? (
            <div className="table-container">
              <p>No upcoming classes available at the moment.</p>
            </div>
          ) : (
            <>
              <div style={styles.infoBox}>
                <h3>ℹ️ How to Join a Class</h3>
                <p>1. Click the "Join Class" button on any class card</p>
                <p>2. Your attendance will be automatically marked</p>
                <p>3. You will be redirected to the Jitsi meeting room</p>
                <p>4. <strong>⚠️ Please wait for your teacher to start the class first</strong></p>
                <p>5. Make sure your camera and microphone are ready!</p>
              </div>

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
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const styles = {
  pageTitle: {
    color: colors.primary,
    marginBottom: '30px'
  },
  infoBox: {
    backgroundColor: colors.background,
    padding: '20px',
    borderRadius: '8px',
    marginBottom: '30px',
    borderLeft: `4px solid ${colors.secondary}`
  }
};

export default StudentClasses;
