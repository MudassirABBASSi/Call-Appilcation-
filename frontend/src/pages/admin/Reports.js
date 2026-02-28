import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import { adminAPI, teacherAPI } from '../../api/api';
import { colors } from '../../styles/colors';
import '../../styles/dashboard.css';

const Reports = () => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [role, setRole] = useState('');

  useEffect(() => {
    // Get user role from localStorage
    const user = JSON.parse(localStorage.getItem('user'));
    const userRole = user?.role || '';
    setRole(userRole);

    // Fetch attendance report based on role
    const fetchAttendanceReport = async () => {
      try {
        setLoading(true);
        setError('');
        
        let response;
        if (userRole === 'admin') {
          response = await adminAPI.getAttendanceReport();
        } else if (userRole === 'teacher') {
          response = await teacherAPI.getAttendanceReport();
        } else {
          setError('Unauthorized role for viewing attendance reports');
          setLoading(false);
          return;
        }

        setAttendanceData(response.data.data || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch attendance report');
        console.error('Error fetching attendance report:', err);
      } finally {
        setLoading(false);
      }
    };

    if (userRole) {
      fetchAttendanceReport();
    }
  }, []);

  const handleExport = () => {
    // Future feature: Export to CSV/PDF
    alert('Export feature coming soon!');
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const getStatusBadgeStyle = (status) => {
    return {
      backgroundColor: status === 'present' ? '#4caf50' : '#f44336',
      color: 'white',
      padding: '4px 8px',
      borderRadius: '4px',
      fontSize: '12px',
      fontWeight: 'bold',
      textTransform: 'capitalize'
    };
  };

  return (
    <div className="dashboard-container">
      <Navbar />
      <Sidebar />
      <div className="main-content">
        <div className="content-wrapper">
          <div style={styles.headerContainer}>
            <h1 style={styles.pageTitle}>Attendance Report</h1>
            <button style={styles.exportButton} onClick={handleExport}>
              📥 Export Report
            </button>
          </div>

          {error && (
            <div style={styles.errorMessage}>{error}</div>
          )}

          {loading ? (
            <div style={styles.loadingMessage}>Loading attendance report...</div>
          ) : attendanceData.length === 0 ? (
            <div style={styles.emptyMessage}>No attendance records found</div>
          ) : (
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.headerRow}>
                    <th style={styles.th}>Student</th>
                    <th style={styles.th}>Class</th>
                    {role === 'admin' && <th style={styles.th}>Teacher</th>}
                    <th style={styles.th}>Date</th>
                    <th style={styles.th}>Status</th>
                    <th style={styles.th}>Join Time</th>
                  </tr>
                </thead>
                <tbody>
                  {attendanceData.map((record, index) => (
                    <tr key={index} style={index % 2 === 0 ? styles.rowEven : styles.rowOdd}>
                      <td style={styles.td}>{record.studentName}</td>
                      <td style={styles.td}>{record.classTitle}</td>
                      {role === 'admin' && (
                        <td style={styles.td}>{record.teacherName || '-'}</td>
                      )}
                      <td style={styles.td}>{formatDate(record.classDate)}</td>
                      <td style={styles.td}>
                        <span style={getStatusBadgeStyle(record.status)}>
                          {record.status}
                        </span>
                      </td>
                      <td style={styles.td}>{formatDate(record.joinTime)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div style={styles.summaryContainer}>
            <p style={styles.summaryText}>
              Total Records: <strong>{attendanceData.length}</strong>
            </p>
            {attendanceData.length > 0 && (
              <>
                <p style={styles.summaryText}>
                  Present: <strong style={{ color: '#4caf50' }}>
                    {attendanceData.filter(r => r.status === 'present').length}
                  </strong>
                </p>
                <p style={styles.summaryText}>
                  Absent: <strong style={{ color: '#f44336' }}>
                    {attendanceData.filter(r => r.status === 'absent').length}
                  </strong>
                </p>
              </>
            )}
          </div>
        </div>
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
    margin: 0
  },
  exportButton: {
    backgroundColor: colors.primary,
    color: 'white',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 'bold',
    transition: 'background-color 0.3s'
  },
  errorMessage: {
    backgroundColor: '#ffebee',
    color: '#c62828',
    padding: '12px',
    borderRadius: '4px',
    marginBottom: '20px',
    border: '1px solid #ef5350'
  },
  loadingMessage: {
    textAlign: 'center',
    padding: '40px',
    color: '#666',
    fontSize: '16px'
  },
  emptyMessage: {
    textAlign: 'center',
    padding: '40px',
    color: '#999',
    fontSize: '16px'
  },
  tableWrapper: {
    overflowX: 'auto',
    marginBottom: '20px',
    borderRadius: '4px',
    border: `1px solid ${colors.lightGray}`
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    backgroundColor: 'white'
  },
  headerRow: {
    backgroundColor: colors.primary,
    color: 'white'
  },
  th: {
    padding: '12px',
    textAlign: 'left',
    fontWeight: 'bold',
    borderBottom: `2px solid ${colors.lightGray}`
  },
  td: {
    padding: '12px',
    borderBottom: `1px solid ${colors.lightGray}`
  },
  rowEven: {
    backgroundColor: '#f9f9f9'
  },
  rowOdd: {
    backgroundColor: 'white'
  },
  summaryContainer: {
    display: 'flex',
    gap: '30px',
    padding: '15px',
    backgroundColor: '#f5f5f5',
    borderRadius: '4px',
    marginTop: '20px'
  },
  summaryText: {
    margin: 0,
    fontSize: '14px',
    color: '#333'
  }
};

export default Reports;
