import React, { useState, useEffect } from 'react';
import { adminAPI } from '../api/api';

const ClassModal = ({ isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    teacher_id: '',
    student_ids: []
  });
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingTeachers, setLoadingTeachers] = useState(true);
  const [loadingStudents, setLoadingStudents] = useState(true);

  useEffect(() => {
    if (isOpen) {
      fetchTeachers();
      fetchStudents();
      setFormData({
        title: '',
        description: '',
        date: '',
        teacher_id: '',
        student_ids: []
      });
      setError('');
    }
  }, [isOpen]);

  const fetchTeachers = async () => {
    setLoadingTeachers(true);
    try {
      const response = await adminAPI.getTeachers();
      setTeachers(response.data);
    } catch (err) {
      setError('Failed to load teachers');
    } finally {
      setLoadingTeachers(false);
    }
  };

  const fetchStudents = async () => {
    setLoadingStudents(true);
    try {
      const response = await adminAPI.getStudents();
      setStudents(response.data);
    } catch (err) {
      setError('Failed to load students');
    } finally {
      setLoadingStudents(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleStudentSelect = (e) => {
    const options = e.target.options;
    const selectedIds = [];
    for (let i = 0; i < options.length; i++) {
      if (options[i].selected) {
        selectedIds.push(parseInt(options[i].value));
      }
    }
    setFormData(prev => ({
      ...prev,
      student_ids: selectedIds
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await adminAPI.createClass(formData);
      setFormData({ 
        title: '', 
        description: '', 
        date: '', 
        teacher_id: '',
        student_ids: []
      });
      onSave();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Error creating class');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({ 
      title: '', 
      description: '', 
      date: '', 
      teacher_id: '',
      student_ids: []
    });
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div style={styles.overlay} onClick={handleCancel}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <h2>Create New Class</h2>
          <button 
            onClick={handleCancel}
            style={styles.closeBtn}
            disabled={loading}
          >
            ✕
          </button>
        </div>

        {error && (
          <div style={styles.errorMessage}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={styles.formGroup}>
            <label htmlFor="title">Class Title</label>
            <input
              id="title"
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              disabled={loading}
              style={styles.input}
              placeholder="e.g., Mathematics 101"
            />
          </div>

          <div style={styles.formGroup}>
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              disabled={loading}
              style={{...styles.input, minHeight: '80px', resize: 'vertical'}}
              placeholder="Class description (optional)"
            />
          </div>

          <div style={styles.formGroup}>
            <label htmlFor="teacher_id">Select Teacher</label>
            {loadingTeachers ? (
              <div style={styles.loadingText}>Loading teachers...</div>
            ) : (
              <select
                id="teacher_id"
                name="teacher_id"
                value={formData.teacher_id}
                onChange={handleChange}
                required
                disabled={loading}
                style={styles.input}
              >
                <option value="">-- Select a Teacher --</option>
                {teachers.map(teacher => (
                  <option key={teacher.id} value={teacher.id}>
                    {teacher.name} ({teacher.email})
                  </option>
                ))}
              </select>
            )}
          </div>

          <div style={styles.formGroup}>
            <label htmlFor="student_ids">Select Students (Hold Ctrl/Cmd to select multiple)</label>
            {loadingStudents ? (
              <div style={styles.loadingText}>Loading students...</div>
            ) : (
              <select
                id="student_ids"
                name="student_ids"
                multiple
                value={formData.student_ids}
                onChange={handleStudentSelect}
                disabled={loading}
                style={{...styles.input, minHeight: '120px'}}
              >
                {students.length === 0 ? (
                  <option disabled>No students available</option>
                ) : (
                  students.map(student => (
                    <option key={student.id} value={student.id}>
                      {student.name} ({student.email})
                    </option>
                  ))
                )}
              </select>
            )}
            <small style={styles.helpText}>
              {formData.student_ids.length} student(s) selected
            </small>
          </div>

          <div style={styles.formGroup}>
            <label htmlFor="date">Date & Time</label>
            <input
              id="date"
              type="datetime-local"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
              disabled={loading}
              style={styles.input}
            />
          </div>

          <div style={styles.infoBox}>
            <strong>Note:</strong> Room ID will be generated automatically
          </div>

          <div style={styles.footer}>
            <button
              type="submit"
              style={styles.saveBtn}
              disabled={loading || loadingTeachers || loadingStudents}
            >
              {loading ? 'Creating...' : 'Create Class'}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              style={styles.cancelBtn}
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000
  },
  modal: {
    backgroundColor: 'white',
    borderRadius: '10px',
    padding: '30px',
    maxWidth: '550px',
    width: '90%',
    maxHeight: '85vh',
    overflowY: 'auto',
    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)',
    animation: 'slideIn 0.3s ease-out'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    borderBottom: '1px solid #eee',
    paddingBottom: '15px'
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    fontSize: '24px',
    cursor: 'pointer',
    color: '#666',
    transition: 'color 0.3s',
    padding: '0',
    width: '30px',
    height: '30px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  errorMessage: {
    backgroundColor: '#f8d7da',
    color: '#721c24',
    padding: '12px',
    borderRadius: '5px',
    marginBottom: '20px',
    border: '1px solid #f5c6cb'
  },
  formGroup: {
    marginBottom: '20px'
  },
  input: {
    width: '100%',
    padding: '12px',
    border: '1px solid #ddd',
    borderRadius: '5px',
    fontSize: '1rem',
    boxSizing: 'border-box',
    fontFamily: 'inherit'
  },
  loadingText: {
    padding: '12px',
    color: '#666',
    fontStyle: 'italic'
  },
  helpText: {
    display: 'block',
    marginTop: '5px',
    color: '#666',
    fontSize: '0.85rem',
    fontStyle: 'italic'
  },
  infoBox: {
    backgroundColor: '#d1ecf1',
    color: '#0c5460',
    padding: '12px',
    borderRadius: '5px',
    marginBottom: '20px',
    border: '1px solid #bee5eb',
    fontSize: '0.9rem'
  },
  footer: {
    display: 'flex',
    gap: '10px',
    justifyContent: 'flex-end',
    marginTop: '30px'
  },
  saveBtn: {
    backgroundColor: '#0F3D3E',
    color: 'white',
    padding: '10px 20px',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '1rem',
    transition: 'background-color 0.3s',
    fontWeight: '600'
  },
  cancelBtn: {
    backgroundColor: '#D4AF37',
    color: '#333',
    padding: '10px 20px',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '1rem',
    transition: 'background-color 0.3s',
    fontWeight: '600'
  }
};

export default ClassModal;
