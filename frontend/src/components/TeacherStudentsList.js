import React, { useState, useEffect } from 'react';
import '../styles/dashboard.css';

const TeacherStudentsList = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await fetch('/api/teacher/students', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) {
        const errorData = await res.json();
        setError(errorData.message || 'Error fetching students');
        setStudents([]);
        setLoading(false);
        return;
      }

      const data = await res.json();
      setStudents(data || []);
      setError('');
    } catch (err) {
      setError('Error fetching students');
      console.error(err);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading students...</div>;

  return (
    <div className="students-section">
      <div style={styles.sectionHeader}>
        <h2 style={styles.sectionTitle}>Students</h2>
      </div>

      {error && (
        <div style={styles.errorMessage}>{error}</div>
      )}

      {students.length === 0 ? (
        <div style={styles.emptyState}>
          <p>No students assigned to you</p>
        </div>
      ) : (
        <div className="table-wrapper">
          <table style={styles.table}>
            <thead>
              <tr style={styles.headerRow}>
                <th style={styles.th}>Name</th>
                <th style={styles.th}>Course</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student.id} style={styles.bodyRow}>
                  <td style={styles.td}>
                    <strong>{student.name}</strong>
                  </td>
                  <td style={styles.td}>
                    <span style={styles.courseBadge}>{student.course_name || 'N/A'}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const styles = {
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    marginTop: '30px'
  },
  sectionTitle: {
    color: '#0F3D3E',
    margin: 0,
    fontSize: '1.5rem',
    fontWeight: '600'
  },
  errorMessage: {
    backgroundColor: '#f8d7da',
    color: '#721c24',
    padding: '12px',
    borderRadius: '5px',
    marginBottom: '20px',
    border: '1px solid #f5c6cb'
  },
  emptyState: {
    padding: '40px',
    textAlign: 'center',
    backgroundColor: '#f9f9f9',
    borderRadius: '5px',
    color: '#666'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    backgroundColor: 'white'
  },
  headerRow: {
    backgroundColor: '#f5f5f5',
    borderBottom: '2px solid #ddd'
  },
  th: {
    padding: '15px',
    textAlign: 'left',
    fontWeight: '600',
    color: '#333',
    fontSize: '0.95rem'
  },
  bodyRow: {
    borderBottom: '1px solid #eee',
    transition: 'background-color 0.3s'
  },
  td: {
    padding: '15px',
    fontSize: '0.95rem',
    color: '#555'
  },
  courseBadge: {
    backgroundColor: '#D4AF37',
    color: '#0F3D3E',
    padding: '5px 12px',
    borderRadius: '20px',
    fontSize: '0.85rem',
    fontWeight: '600',
    display: 'inline-block'
  }
};

export default TeacherStudentsList;
