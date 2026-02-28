import React, { useState, useEffect } from 'react';
import { adminAPI } from '../api/api';

const StudentModal = ({ isOpen, onClose, onSave, student = null }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    course_name: '',
    teacher_id: ''
  });
  const [teachers, setTeachers] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingTeachers, setLoadingTeachers] = useState(true);

  useEffect(() => {
    if (isOpen) {
      fetchTeachers();
    }
  }, [isOpen]);

  useEffect(() => {
    if (student) {
      // Edit mode
      setFormData({
        name: student.name || '',
        email: student.email || '',
        password: '',
        phone: student.phone || '',
        course_name: student.course_name || '',
        teacher_id: student.teacher_id || ''
      });
    } else {
      // Add mode
      setFormData({
        name: '',
        email: '',
        password: '',
        phone: '',
        course_name: '',
        teacher_id: ''
      });
    }
    setError('');
  }, [isOpen, student]);

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (student) {
        // Edit existing student
        await adminAPI.updateStudent(student.id, formData);
      } else {
        // Create new student
        await adminAPI.addStudent(formData);
      }
      
      setFormData({ name: '', email: '', password: '' });
      onSave();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || `Error ${student ? 'updating' : 'creating'} student`);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({ name: '', email: '', password: '' });
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div style={styles.overlay} onClick={handleCancel}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <h2>{student ? 'Edit Student' : 'Add New Student'}</h2>
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
            <label htmlFor="name">Name</label>
            <input
              id="name"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              disabled={loading}
              style={styles.input}
            />
          </div>

          <div style={styles.formGroup}>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={loading}
              style={styles.input}
            />
          </div>

          <div style={styles.formGroup}>
            <label htmlFor="password">
              Password
              {student && ' (leave blank to keep unchanged)'}
            </label>
            <input
              id="password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required={!student}
              disabled={loading}
              style={styles.input}
            />
          </div>

          <div style={styles.formGroup}>
            <label htmlFor="phone">Phone Number</label>
            <input
              id="phone"
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+1 (555) 123-4567"
              disabled={loading}
              style={styles.input}
            />
          </div>

          <div style={styles.formGroup}>
            <label htmlFor="course_name">Course Name</label>
            <input
              id="course_name"
              type="text"
              name="course_name"
              value={formData.course_name}
              onChange={handleChange}
              placeholder="e.g., Mathematics 101"
              disabled={loading}
              style={styles.input}
            />
          </div>

          <div style={styles.formGroup}>
            <label htmlFor="teacher_id">Assign Teacher</label>
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

          <div style={styles.footer}>
            <button
              type="submit"
              style={styles.saveBtn}
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save'}
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
    maxWidth: '500px',
    width: '90%',
    maxHeight: '80vh',
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
    color: '#666',
    fontSize: '0.9rem',
    padding: '10px',
    textAlign: 'center'
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

export default StudentModal;
