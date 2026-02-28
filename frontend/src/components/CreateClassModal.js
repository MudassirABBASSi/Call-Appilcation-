import React, { useState, useEffect } from 'react';
import api from '../api/api';
import toastService from '../services/toastService';
import '../styles/dashboard.css';

const CreateClassModal = ({ isOpen, onClose, onSuccess, teachers = [] }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    start_time: '',
    end_time: '',
    teacher_id: ''
  });
  const [studentsByTeacher, setStudentsByTeacher] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Fetch students when teacher is selected
    if (name === 'teacher_id' && value) {
      fetchTeacherStudents(value);
    }
  };

  const fetchTeacherStudents = async (teacherId) => {
    try {
      const response = await api.get(`/classes/teacher/${teacherId}/students`);
      if (response.data.success) {
        setStudentsByTeacher(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching teacher students:', err);
      setStudentsByTeacher([]);
    }
  };

  const validateForm = () => {
    if (!formData.title || !formData.date || !formData.start_time || !formData.end_time || !formData.teacher_id) {
      setError('All required fields must be filled');
      return false;
    }

    // Validate that class date is not in the past
    const classDate = new Date(`${formData.date}T${formData.start_time}`);
    if (classDate < new Date()) {
      setError('Class date and time must be in the future');
      return false;
    }

    // Validate that end time is after start time
    if (formData.end_time <= formData.start_time) {
      setError('End time must be after start time');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await api.post('/classes/admin/classes', formData);
      if (response.data.success) {
        toastService.success('Class created successfully!');
        onSuccess(response.data.data);
        setFormData({
          title: '',
          description: '',
          date: '',
          start_time: '',
          end_time: '',
          teacher_id: ''
        });
        setStudentsByTeacher([]);
        onClose();
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Error creating class';
      setError(errorMsg);
      toastService.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>📚 Create New Class</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Class Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., Mathematics 101"
              required
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Class description and objectives"
              rows="3"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Date *</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Teacher *</label>
              <select
                name="teacher_id"
                value={formData.teacher_id}
                onChange={handleChange}
                required
              >
                <option value="">Select a teacher</option>
                {teachers.map(teacher => (
                  <option key={teacher.id} value={teacher.id}>
                    {teacher.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Start Time *</label>
              <input
                type="time"
                name="start_time"
                value={formData.start_time}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>End Time *</label>
              <input
                type="time"
                name="end_time"
                value={formData.end_time}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {studentsByTeacher.length > 0 && (
            <div className="form-group">
              <label>📍 Assigned Students ({studentsByTeacher.length})</label>
              <div style={{
                background: '#f8f9fa',
                padding: '12px',
                borderRadius: '5px',
                maxHeight: '150px',
                overflowY: 'auto',
                border: '1px solid #ddd'
              }}>
                {studentsByTeacher.map(student => (
                  <div key={student.id} style={{
                    padding: '8px 0',
                    borderBottom: '1px solid #eee',
                    fontSize: '0.9rem'
                  }}>
                    <strong>{student.name}</strong>
                    {student.course_name && <div style={{ color: '#999', fontSize: '0.85rem' }}>{student.course_name}</div>}
                  </div>
                ))}
              </div>
              <small style={{ color: '#666', display: 'block', marginTop: '8px' }}>
                These students are assigned to this teacher and will be able to enroll in this class automatically if they select it.
              </small>
            </div>
          )}

          <div className="form-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Creating...' : '✓ Create Class'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateClassModal;
