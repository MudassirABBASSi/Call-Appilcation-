import React, { useState, useEffect } from 'react';
import { adminAPI } from '../api/api';

const TeacherModal = ({ isOpen, onClose, onSave, teacher = null }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (teacher) {
      // Edit mode
      setFormData({
        name: teacher.name,
        email: teacher.email,
        password: ''
      });
    } else {
      // Add mode
      setFormData({
        name: '',
        email: '',
        password: ''
      });
    }
    setError('');
  }, [isOpen, teacher]);

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
      if (teacher) {
        // Edit existing teacher
        await adminAPI.updateTeacher(teacher.id, formData);
      } else {
        // Create new teacher
        await adminAPI.addTeacher(formData);
      }
      
      setFormData({ name: '', email: '', password: '' });
      onSave();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || `Error ${teacher ? 'updating' : 'creating'} teacher`);
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
          <h2>{teacher ? 'Edit Teacher' : 'Add New Teacher'}</h2>
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
              {teacher && ' (leave blank to keep unchanged)'}
            </label>
            <input
              id="password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required={!teacher}
              disabled={loading}
              style={styles.input}
            />
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

export default TeacherModal;
