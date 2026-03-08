import React, { useState } from 'react';
import { classesAPI } from '../api/api';
import { toast } from 'react-toastify';
import { colors } from '../styles/colors';

const ClassList = ({ classes, onEdit, onDelete, onRefresh, isAdmin = false }) => {
  const [sortBy, setSortBy] = useState('start_time');
  const [filterTeacher, setFilterTeacher] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const getUniqueTeachers = () => {
    const teacherSet = new Set();
    classes.forEach(c => {
      if (c.teacher_name) teacherSet.add(c.teacher_name);
    });
    return Array.from(teacherSet).sort();
  };

  const sortedAndFiltered = classes
    .filter(c => !filterTeacher || c.teacher_name === filterTeacher)
    .sort((a, b) => {
      if (sortBy === 'start_time') {
        return new Date(a.start_time) - new Date(b.start_time);
      } else if (sortBy === 'title') {
        return a.title.localeCompare(b.title);
      } else if (sortBy === 'teacher') {
        return (a.teacher_name || '').localeCompare(b.teacher_name || '');
      }
      return 0;
    });

  const formatDateTime = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getClassStatus = (classData) => {
    const now = new Date();
    const startTime = new Date(classData.start_time);
    const endTime = new Date(classData.end_time);

    if (endTime < now) return 'ended';
    if (startTime <= now && endTime >= now) return 'active';
    return 'upcoming';
  };

  const handleDelete = async (classId) => {
    try {
      setDeleting(true);
      await classesAPI.deleteClass(classId);
      toast.success('Class deleted successfully');
      setConfirmDelete(null);
      if (onDelete) onDelete(classId);
      if (onRefresh) onRefresh();
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to delete class';
      toast.error(errorMessage);
    } finally {
      setDeleting(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return colors.gold;
      case 'ended':
        return '#999';
      default:
        return colors.emerald;
    }
  };

  if (classes.length === 0) {
    return <div style={styles.emptyState}>No classes found</div>;
  }

  return (
    <div style={styles.container}>
      <div style={styles.filterContainer}>
        <div style={styles.filterItem}>
          <label>Sort by:</label>
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            style={styles.select}
          >
            <option value="start_time">Start Time</option>
            <option value="title">Title</option>
            <option value="teacher">Teacher</option>
          </select>
        </div>

        <div style={styles.filterItem}>
          <label>Filter by Teacher:</label>
          <select
            value={filterTeacher}
            onChange={e => setFilterTeacher(e.target.value)}
            style={styles.select}
          >
            <option value="">All Teachers</option>
            {getUniqueTeachers().map(teacher => (
              <option key={teacher} value={teacher}>
                {teacher}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div style={styles.tableWrapper}>
        <table style={styles.table}>
          <thead>
            <tr style={styles.headerRow}>
              <th style={styles.th}>Title</th>
              <th style={styles.th}>Teacher</th>
              <th style={styles.th}>Start Time</th>
              <th style={styles.th}>End Time</th>
              <th style={styles.th}>Students</th>
              <th style={styles.th}>Status</th>
              {isAdmin && <th style={styles.th}>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {sortedAndFiltered.map(classData => {
              const status = getClassStatus(classData);
              return (
                <tr key={classData.id} style={styles.row}>
                  <td style={styles.td}>
                    <div style={styles.titleCell}>
                      <strong>{classData.title}</strong>
                      {classData.description && (
                        <small style={styles.description}>{classData.description}</small>
                      )}
                    </div>
                  </td>
                  <td style={styles.td}>{classData.teacher_name}</td>
                  <td style={styles.td}>{formatDateTime(classData.start_time)}</td>
                  <td style={styles.td}>{formatDateTime(classData.end_time)}</td>
                  <td style={styles.td} align="center">
                    {classData.enrollment_count || 0}
                  </td>
                  <td style={styles.td}>
                    <span
                      style={{
                        ...styles.statusBadge,
                        backgroundColor: getStatusColor(status),
                        color: status === 'ended' ? 'white' : colors.lightBg
                      }}
                    >
                      {status === 'active' ? 'Live' : status === 'ended' ? 'Ended' : 'Upcoming'}
                    </span>
                  </td>
                  {isAdmin && (
                    <td style={styles.td}>
                      <div style={styles.actionButtons}>
                        <button
                          onClick={() => onEdit(classData)}
                          style={{ ...styles.actionBtn, ...styles.editBtn }}
                          title="Edit"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => setConfirmDelete(classData.id)}
                          style={{ ...styles.actionBtn, ...styles.deleteBtn }}
                          title="Delete"
                          disabled={confirmDelete === classData.id}
                        >
                          🗑️
                        </button>
                        {confirmDelete === classData.id && (
                          <div style={styles.confirmDelete}>
                            <p>Delete this class?</p>
                            <button
                              onClick={() => handleDelete(classData.id)}
                              style={styles.confirmBtn}
                              disabled={deleting}
                            >
                              {deleting ? 'Deleting...' : 'Confirm'}
                            </button>
                            <button
                              onClick={() => setConfirmDelete(null)}
                              style={styles.cancelBtn}
                              disabled={deleting}
                            >
                              Cancel
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const styles = {
  container: {
    marginTop: '20px'
  },
  filterContainer: {
    display: 'flex',
    gap: '20px',
    marginBottom: '20px',
    padding: '15px',
    backgroundColor: colors.lightBg,
    borderRadius: '6px'
  },
  filterItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  select: {
    padding: '8px 12px',
    border: `1px solid #ddd`,
    borderRadius: '4px',
    fontSize: '14px',
    fontFamily: 'inherit'
  },
  tableWrapper: {
    overflowX: 'auto',
    borderRadius: '6px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    backgroundColor: 'white'
  },
  headerRow: {
    backgroundColor: colors.emerald,
    color: colors.lightBg
  },
  th: {
    padding: '15px',
    textAlign: 'left',
    fontWeight: 'bold',
    fontSize: '14px'
  },
  row: {
    borderBottom: `1px solid #eee`,
    transition: 'background-color 0.2s'
  },
  td: {
    padding: '12px 15px',
    fontSize: '14px'
  },
  titleCell: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  description: {
    color: '#666',
    fontStyle: 'italic'
  },
  statusBadge: {
    display: 'inline-block',
    padding: '6px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: 'bold'
  },
  actionButtons: {
    display: 'flex',
    gap: '8px',
    position: 'relative'
  },
  actionBtn: {
    background: 'none',
    border: 'none',
    fontSize: '16px',
    cursor: 'pointer',
    padding: '5px 8px',
    borderRadius: '4px',
    transition: 'background-color 0.2s'
  },
  editBtn: {
    ':hover': {
      backgroundColor: '#e3f2fd'
    }
  },
  deleteBtn: {
    ':hover': {
      backgroundColor: '#ffebee'
    }
  },
  confirmDelete: {
    position: 'absolute',
    right: '0',
    top: '30px',
    backgroundColor: 'white',
    border: `2px solid #f44`,
    borderRadius: '6px',
    padding: '10px',
    zIndex: 100,
    boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
    minWidth: '200px'
  },
  confirmBtn: {
    backgroundColor: '#f44',
    color: 'white',
    padding: '6px 12px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    marginRight: '5px',
    fontSize: '12px'
  },
  cancelBtn: {
    backgroundColor: '#ccc',
    color: '#333',
    padding: '6px 12px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px'
  },
  emptyState: {
    textAlign: 'center',
    padding: '40px',
    color: '#999',
    backgroundColor: colors.lightBg,
    borderRadius: '6px'
  }
};

export default ClassList;
