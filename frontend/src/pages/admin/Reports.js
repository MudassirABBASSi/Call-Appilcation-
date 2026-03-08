import React, { useState, useEffect } from 'react';
import { adminAPI, teacherAPI } from '../../api/api';
import { colors } from '../../styles/colors';
import '../../styles/dashboard.css';

const Reports = () => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [role, setRole] = useState('');
  const [expandedStudent, setExpandedStudent] = useState(null);

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
    alert('Export feature coming soon!');
  };

  // Group attendance by student
  const groupByStudent = () => {
    const grouped = {};
    attendanceData.forEach(record => {
      const key = `${record.studentId || 'unknown'}`;
      if (!grouped[key]) {
        grouped[key] = {
          studentId: record.studentId,
          studentName: record.studentName,
          studentEmail: record.studentEmail,
          teacherName: record.teacherName || 'N/A',
          records: []
        };
      }
      grouped[key].records.push(record);
    });
    return Object.values(grouped);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const getStatusColor = (status) => {
    return status === 'present' ? '#4caf50' : '#f44336';
  };

  const getDay = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[date.getDay()];
  };

  const studentReports = groupByStudent();

  const presentCount = studentReports.reduce((acc, student) => 
    acc + student.records.filter(r => r.status === 'present').length, 0
  );
  const absentCount = studentReports.reduce((acc, student) => 
    acc + student.records.filter(r => r.status === 'absent').length, 0
  );

  return (
          <div className="content-wrapper">
          <div style={styles.headerContainer}>
            <h1 style={styles.pageTitle}>Attendance Report</h1>
            <button style={styles.exportButton} onClick={handleExport}>
              Export Report
            </button>
          </div>

          {error && (
            <div style={styles.errorMessage}>{error}</div>
          )}

          {loading ? (
            <div style={styles.loadingMessage}>Loading attendance report...</div>
          ) : studentReports.length === 0 ? (
            <div style={styles.emptyMessage}>No attendance records found</div>
          ) : (
            <>
              <div style={styles.summaryContainer}>
                <div style={styles.summaryCard}>
                  <h3 style={{ margin: '0 0 5px 0', color: colors.primary }}>Total Students</h3>
                  <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold' }}>{studentReports.length}</p>
                </div>
                <div style={styles.summaryCard}>
                  <h3 style={{ margin: '0 0 5px 0', color: '#4caf50' }}>Present</h3>
                  <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: '#4caf50' }}>{presentCount}</p>
                </div>
                <div style={styles.summaryCard}>
                  <h3 style={{ margin: '0 0 5px 0', color: '#f44336' }}>Absent</h3>
                  <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: '#f44336' }}>{absentCount}</p>
                </div>
              </div>

              <div style={styles.studentsContainer}>
                {studentReports.map((student, idx) => (
                  <div key={idx} style={styles.studentCard}>
                    <div
                      style={styles.studentHeader}
                      onClick={() => setExpandedStudent(expandedStudent === idx ? null : idx)}
                    >
                      <div style={styles.studentInfo}>
                        <h3 style={{ margin: '0 0 5px 0' }}>
                          {student.studentName}
                        </h3>
                        <p style={{ margin: '0 0 3px 0', fontSize: '13px', color: '#666' }}>
                          Email: {student.studentEmail}
                        </p>
                        <p style={{ margin: 0, fontSize: '13px', color: '#666' }}>
                          Teacher: {student.teacherName}
                        </p>
                      </div>
                      <div style={styles.studentStats}>
                        <div style={styles.statBadge}>
                          <span style={styles.statLabel}>Present:</span>
                          <span style={{ ...styles.statValue, color: '#4caf50' }}>
                            {student.records.filter(r => r.status === 'present').length}
                          </span>
                        </div>
                        <div style={styles.statBadge}>
                          <span style={styles.statLabel}>Absent:</span>
                          <span style={{ ...styles.statValue, color: '#f44336' }}>
                            {student.records.filter(r => r.status === 'absent').length}
                          </span>
                        </div>
                      </div>
                      <span style={styles.expandIcon}>
                        {expandedStudent === idx ? '-' : '+'}
                      </span>
                    </div>

                    {expandedStudent === idx && (
                      <div style={styles.studentDetails}>
                        <table style={styles.detailsTable}>
                          <thead>
                            <tr style={styles.detailsHeaderRow}>
                              <th style={styles.detailsTh}>Class</th>
                              <th style={styles.detailsTh}>Date</th>
                              <th style={styles.detailsTh}>Day</th>
                              <th style={styles.detailsTh}>Join Time</th>
                              <th style={styles.detailsTh}>Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {student.records.map((record, rIdx) => (
                              <tr key={rIdx} style={styles.detailsRow}>
                                <td style={styles.detailsTd}>{record.classTitle}</td>
                                <td style={styles.detailsTd}>{formatDate(record.classDate)}</td>
                                <td style={styles.detailsTd}>{getDay(record.classDate)}</td>
                                <td style={styles.detailsTd}>{formatTime(record.joinTime)}</td>
                                <td style={styles.detailsTd}>
                                  <span style={{
                                    ...styles.statusBadge,
                                    backgroundColor: getStatusColor(record.status)
                                  }}>
                                    {record.status}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
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
    margin: 0,
    fontSize: '28px'
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
  summaryContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '15px',
    marginBottom: '30px'
  },
  summaryCard: {
    backgroundColor: '#f5f5f5',
    padding: '20px',
    borderRadius: '8px',
    border: `1px solid ${colors.lightGray}`,
    textAlign: 'center'
  },
  studentsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px'
  },
  studentCard: {
    backgroundColor: 'white',
    borderRadius: '8px',
    border: `1px solid ${colors.lightGray}`,
    overflow: 'hidden',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  },
  studentHeader: {
    display: 'flex',
    alignItems: 'center',
    padding: '20px',
    backgroundColor: '#f9f9f9',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
    borderBottom: `1px solid ${colors.lightGray}`
  },
  studentInfo: {
    flex: 1
  },
  studentStats: {
    display: 'flex',
    gap: '15px',
    marginRight: '20px'
  },
  statBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px'
  },
  statLabel: {
    fontSize: '12px',
    color: '#666',
    fontWeight: 'bold'
  },
  statValue: {
    fontSize: '16px',
    fontWeight: 'bold'
  },
  expandIcon: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: colors.primary,
    minWidth: '30px',
    textAlign: 'center'
  },
  studentDetails: {
    padding: '20px'
  },
  detailsTable: {
    width: '100%',
    borderCollapse: 'collapse'
  },
  detailsHeaderRow: {
    backgroundColor: colors.primary,
    color: 'white'
  },
  detailsTh: {
    padding: '12px',
    textAlign: 'left',
    fontWeight: 'bold',
    borderBottom: `2px solid ${colors.lightGray}`
  },
  detailsTd: {
    padding: '10px 12px',
    borderBottom: `1px solid ${colors.lightGray}`
  },
  detailsRow: {
    backgroundColor: '#fafafa'
  },
  statusBadge: {
    color: 'white',
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: 'bold',
    textTransform: 'capitalize'
  }
};

export default Reports;
