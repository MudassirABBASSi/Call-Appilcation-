import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../../api/api';
import '../../styles/teacher-assignments.css';

/**
 * Teacher Assignment Dashboard
 * Route: /teacher/assignments
 * 
 * Features:
 * - Create Assignment Form (with file upload)
 * - View all assignments with submission counts
 * - Edit/Delete assignments
 * - View submissions for each assignment
 */

const TeacherAssignments = () => {
  const [assignments, setAssignments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingAssignmentId, setEditingAssignmentId] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    total_marks: 100,
    due_date: '',
    day_of_week: '',
    course_id: ''
  });
  const [file, setFile] = useState(null);
  
  // Get user from localStorage
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  // Fetch teacher's courses and assignments on mount
  useEffect(() => {
    fetchCourses();
    fetchAssignments();
  }, []);

  // Auto-refresh assignments every 30 seconds to update submission counts
  useEffect(() => {
    const interval = setInterval(() => {
      fetchAssignments();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, []);
  
  // Fetch teacher's courses
  const fetchCourses = async () => {
    try {
      const response = await api.get(`/courses/teacher/${user.id}`);
      setCourses(response.data.courses || []);
    } catch (error) {
      console.error('Error fetching courses:', error);
      toast.error('Failed to load courses');
    }
  };
  
  // Fetch teacher's assignments
  const fetchAssignments = async () => {
    setLoading(true);
    try {
      const response = await api.get('/teacher/assignments');
      setAssignments(response.data.assignments || []);
    } catch (error) {
      console.error('Error fetching assignments:', error);
      toast.error('Failed to load assignments');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle file selection
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    
    // Validate file type
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (selectedFile && !allowedTypes.includes(selectedFile.type)) {
      toast.error('Only PDF, DOC, and DOCX files are allowed');
      e.target.value = null;
      return;
    }
    
    // Validate file size (5MB)
    if (selectedFile && selectedFile.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      e.target.value = null;
      return;
    }
    
    setFile(selectedFile);
  };
  
  // Validate form
  const validateForm = () => {
    if (!formData.title.trim()) {
      toast.error('Assignment title is required');
      return false;
    }
    
    if (!formData.course_id) {
      toast.error('Please select a course');
      return false;
    }
    
    if (formData.due_date) {
      const dueDate = new Date(formData.due_date);
      const now = new Date();
      
      if (dueDate <= now) {
        toast.error('Due date must be in the future');
        return false;
      }
    }
    
    return true;
  };
  
  // Create or update assignment
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      // Prepare FormData for file upload
      const submitData = new FormData();
      submitData.append('title', formData.title);
      submitData.append('description', formData.description);
      submitData.append('total_marks', formData.total_marks);
      submitData.append('due_date', formData.due_date);
      submitData.append('day_of_week', formData.day_of_week);
      submitData.append('course_id', formData.course_id);
      
      if (file) {
        submitData.append('file', file);
      }
      
      if (editingAssignmentId) {
        // Update existing assignment
        await api.put(`/teacher/assignments/${editingAssignmentId}`, submitData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Assignment updated successfully!');
      } else {
        // Create new assignment
        const response = await api.post('/teacher/assignments', submitData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        
        const notifiedCount = response.data.notified_students || 0;
        toast.success(`Assignment created! ${notifiedCount} student(s) notified.`);
      }
      
      // Reset form and close modal
      resetForm();
      setShowCreateModal(false);
      fetchAssignments();
      
    } catch (error) {
      console.error('Error saving assignment:', error);
      const errorMsg = error.response?.data?.message || 'Failed to save assignment';
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };
  
  // Reset form
  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      total_marks: 100,
      due_date: '',
      day_of_week: '',
      course_id: ''
    });
    setFile(null);
    setEditingAssignmentId(null);
  };

  const toDateTimeLocalValue = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return '';
    const pad = (value) => String(value).padStart(2, '0');

    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  };
  
  // Open edit modal
  const handleEdit = (assignment) => {
    setFormData({
      title: assignment.title,
      description: assignment.description || '',
      total_marks: assignment.total_marks,
      due_date: toDateTimeLocalValue(assignment.due_date),
      day_of_week: assignment.day_of_week || '',
      course_id: assignment.course_id
    });
    setEditingAssignmentId(assignment.id);
    setShowCreateModal(true);
  };
  
  // Delete assignment
  const handleDelete = async (assignmentId) => {
    if (!window.confirm('Are you sure you want to delete this assignment? This will also delete all submissions.')) {
      return;
    }
    
    try {
      await api.delete(`/teacher/assignments/${assignmentId}`);
      toast.success('Assignment deleted successfully');
      fetchAssignments();
    } catch (error) {
      console.error('Error deleting assignment:', error);
      toast.error('Failed to delete assignment');
    }
  };
  
  // View submissions
  const handleViewSubmissions = (assignmentId) => {
    // Navigate to submissions page (you can use react-router for this)
    window.location.href = `/teacher/submissions/${assignmentId}`;
  };
  
  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'No deadline';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Check if deadline passed
  const isDeadlinePassed = (dueDate) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
  };
  
  return (
    <div className="teacher-assignments-container">
      <div className="assignments-header">
        <h1>Manage Assignments</h1>
        <button 
          className="btn-primary"
          onClick={() => {
            resetForm();
            setShowCreateModal(true);
          }}
        >
          + Create Assignment
        </button>
      </div>
      
      {/* Assignments Table */}
      <div className="assignments-table-container">
        {loading ? (
          <div className="loading-spinner">Loading...</div>
        ) : assignments.length === 0 ? (
          <div className="empty-state">
            <p>No assignments created yet</p>
            <button 
              className="btn-secondary"
              onClick={() => setShowCreateModal(true)}
            >
              Create Your First Assignment
            </button>
          </div>
        ) : (
          <table className="assignments-table">
            <thead>
              <tr>
                <th>Assignment Name</th>
                <th>Course</th>
                <th>Due Date</th>
                <th>Total Marks</th>
                <th>Submissions</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {assignments.map(assignment => (
                <tr key={assignment.id}>
                  <td>
                    <strong>{assignment.title}</strong>
                    {assignment.description && (
                      <div className="assignment-description">
                        {assignment.description.substring(0, 60)}
                        {assignment.description.length > 60 && '...'}
                      </div>
                    )}
                  </td>
                  <td>{assignment.course_name || 'Unknown'}</td>
                  <td>
                    <span className={isDeadlinePassed(assignment.due_date) ? 'deadline-passed' : ''}>
                      {formatDate(assignment.due_date)}
                    </span>
                  </td>
                  <td>{assignment.total_marks}</td>
                  <td>
                    <span className="submission-count">
                      {assignment.submissions_count || 0}
                    </span>
                  </td>
                  <td>
                    {isDeadlinePassed(assignment.due_date) ? (
                      <span className="status-badge status-closed">Closed</span>
                    ) : (
                      <span className="status-badge status-active">Active</span>
                    )}
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        className="btn-icon btn-view"
                        onClick={() => handleViewSubmissions(assignment.id)}
                        title="View Submissions"
                      >
                        👁️
                      </button>
                      <button 
                        className="btn-icon btn-edit"
                        onClick={() => handleEdit(assignment)}
                        title="Edit"
                      >
                        ✏️
                      </button>
                      <button 
                        className="btn-icon btn-delete"
                        onClick={() => handleDelete(assignment.id)}
                        title="Delete"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      
      {/* Create/Edit Assignment Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingAssignmentId ? 'Edit Assignment' : 'Create New Assignment'}</h2>
              <button 
                className="modal-close"
                onClick={() => setShowCreateModal(false)}
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="assignment-form">
              <div className="form-group">
                <label>Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g., Chapter 3 Homework"
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Assignment instructions..."
                  rows={4}
                />
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Course *</label>
                  <select
                    name="course_id"
                    value={formData.course_id}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Course</option>
                    {courses.map(course => (
                      <option key={course.id} value={course.id}>
                        {course.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Total Marks *</label>
                  <input
                    type="number"
                    name="total_marks"
                    value={formData.total_marks}
                    onChange={handleChange}
                    min="1"
                    max="1000"
                    required
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Due Date *</label>
                  <input
                    type="datetime-local"
                    name="due_date"
                    value={formData.due_date}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>Day of Week</label>
                  <select
                    name="day_of_week"
                    value={formData.day_of_week}
                    onChange={handleChange}
                  >
                    <option value="">Select Day</option>
                    <option value="Monday">Monday</option>
                    <option value="Tuesday">Tuesday</option>
                    <option value="Wednesday">Wednesday</option>
                    <option value="Thursday">Thursday</option>
                    <option value="Friday">Friday</option>
                    <option value="Saturday">Saturday</option>
                    <option value="Sunday">Sunday</option>
                  </select>
                </div>
              </div>
              
              <div className="form-group">
                <label>Assignment File (PDF, DOC, DOCX - Max 5MB)</label>
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx"
                />
                {file && (
                  <div className="file-info">
                    📄 {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                  </div>
                )}
              </div>
              
              <div className="form-actions">
                <button 
                  type="button" 
                  className="btn-secondary"
                  onClick={() => setShowCreateModal(false)}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn-primary"
                  disabled={loading}
                >
                  {loading ? 'Saving...' : editingAssignmentId ? 'Update Assignment' : 'Create Assignment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherAssignments;
