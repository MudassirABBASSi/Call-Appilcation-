import React, { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import { teacherAPI } from '../../api/api';
import { colors } from '../../styles/colors';
import { useParams, useNavigate } from 'react-router-dom';
import '../../styles/dashboard.css';

const Attendance = () => {
  const { classId } = useParams();
  const navigate = useNavigate();
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAttendance();
  }, [classId]);

  const fetchAttendance = async () => {
    try {
      const response = await teacherAPI.getAttendance(classId);
      setAttendance(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching attendance:', error);
      setLoading(false);
    }
  };

  const formatDateTime = (dateString) => {
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
    <div className="dashboard-container">
      <Navbar />
      <Sidebar />
      <div className="main-content">
        <div className="content-wrapper">
          <div style={styles.header}>
            <h1 style={styles.pageTitle}>Class Attendance</h1>
            <button
              onClick={() => navigate('/teacher/my-classes')}
              className="btn btn-secondary"
            >
              Back to Classes
            </button>
          </div>

          <div className="table-container">
            <div style={styles.statsRow}>
              <div style={styles.statBox}>
                <h3>{attendance.length}</h3>
                <p>Total Attendance</p>
              </div>
            </div>

            {loading ? (
              <p>Loading...</p>
            ) : attendance.length === 0 ? (
              <p>No attendance records found for this class.</p>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Student Name</th>
                    <th>Email</th>
                    <th>Joined At</th>
                  </tr>
                </thead>
                <tbody>
                  {attendance.map((record) => (
                    <tr key={record.id}>
                      <td>{record.id}</td>
                      <td>{record.student_name}</td>
                      <td>{record.student_email}</td>
                      <td>{formatDateTime(record.joined_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
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
  },
  statsRow: {
    marginBottom: '20px'
  },
  statBox: {
    backgroundColor: colors.background,
    padding: '20px',
    borderRadius: '8px',
    textAlign: 'center',
    borderLeft: `4px solid ${colors.secondary}`,
    display: 'inline-block'
  }
};

export default Attendance;
