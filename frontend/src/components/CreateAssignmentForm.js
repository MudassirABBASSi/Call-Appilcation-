import React, { useState, useEffect } from 'react';
import { assignmentsAPI, coursesAPI } from '../api/api';
import { toast } from 'react-toastify';
import '../styles/modal.css';

const CreateAssignmentForm = ({ courseId, onClose, onAssignmentCreated }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    file_url: '',
    total_marks: 100,
    due_date: '',
    day_of_week: '',
    course_id: courseId || ''
  });
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!courseId) {
      fetchCourses();
    }
  }, [courseId]);

  const fetchCourses = async () => {
    try {
      const response = await coursesAPI.getAllCourses();
      setCourses(response.data.courses || []);
    } catch (error) {
      console.error('Error fetching courses:', error);
      toast.error('Failed to load courses');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'total_marks' ? parseInt(value) || 0 : value
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) {
      newErrors.title = 'Assignment title is required';
    }
    if (!formData.course_id) {
      newErrors.course_id = 'Course is required';
    }
    if (formData.total_marks <= 0) {
      newErrors.total_marks = 'Total marks must be greater than 0';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setLoading(true);
      await assignmentsAPI.createAssignment({
        ...formData,
        course_id: parseInt(formData.course_id)
      });
      setFormData({
        title: '',
        description: '',
        file_url: '',
        total_marks: 100,
        due_date: '',
        day_of_week: '',
        course_id: courseId || ''
      });
      onAssignmentCreated();
    } catch (error) {
      console.error('Error creating assignment:', error);
      toast.error(error.response?.data?.message || 'Failed to create assignment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content modal-large">
        <div className="modal-header">
          <h2>Create New Assignment</h2>
          <button className="modal-close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="course_id">Course *</label>
            <select
              id="course_id"
              name="course_id"
              value={formData.course_id}
              onChange={handleChange}
              disabled={!!courseId}
              className={errors.course_id ? 'input-error' : ''}
            >
              <option value="">Select a course</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.name}
                </option>
              ))}
            </select>
            {errors.course_id && (
              <span className="error-message">{errors.course_id}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="title">Title *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter assignment title"
              className={errors.title ? 'input-error' : ''}
            />
            {errors.title && <span className="error-message">{errors.title}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter assignment description (optional)"
              rows="4"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="total_marks">Total Marks *</label>
              <input
                type="number"
                id="total_marks"
                name="total_marks"
                value={formData.total_marks}
                onChange={handleChange}
                min="1"
                className={errors.total_marks ? 'input-error' : ''}
              />
              {errors.total_marks && (
                <span className="error-message">{errors.total_marks}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="due_date">Due Date</label>
              <input
                type="datetime-local"
                id="due_date"
                name="due_date"
                value={formData.due_date}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="file_url">Resource File URL</label>
            <input
              type="url"
              id="file_url"
              name="file_url"
              value={formData.file_url}
              onChange={handleChange}
              placeholder="https://example.com/file.pdf (optional)"
            />
          </div>

          <div className="modal-footer">
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
              {loading ? 'Creating...' : 'Create Assignment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateAssignmentForm;
