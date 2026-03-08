import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../../api/api';
import '../../styles/student-assignments.css';

/**
 * Student Assignment Dashboard
 * Route: /student/assignments
 * 
 * Features:
 * - View all assignments from enrolled courses
 * - See submission status (Submitted/Not Submitted)
 * - Upload assignment file
 * - View feedback and grades
 */

const StudentAssignments = () => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadingId, setUploadingId] = useState(null);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [file, setFile] = useState(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackData, setFeedbackData] = useState(null);

  const toBackendFileUrl = (filePath) => {
    if (!filePath) return '';
    const trimmed = String(filePath).trim();
    if (!trimmed) return '';
    if (/^https?:\/\//i.test(trimmed)) return trimmed;
    if (trimmed.startsWith('/')) return `http://localhost:5000${trimmed}`;
    if (trimmed.startsWith('uploads/')) return `http://localhost:5000/${trimmed}`;
    return `http://localhost:5000/uploads/submissions/${trimmed}`;
  };
  
  // Fetch assignments on mount
  useEffect(() => {
    fetchAssignments();
  }, []);
  
  // Fetch student's assignments
  const fetchAssignments = async () => {
    setLoading(true);
    try {
      const response = await api.get('/assignments/student/my-assignments');
      
      // Handle both old and new response formats
      const assignmentData = response.data?.assignments || response.data || [];
      const assignments = Array.isArray(assignmentData) ? assignmentData : [];
      
      setAssignments(assignments);
      
      if (assignments.length === 0) {
        console.log('ℹ️ No assignments found for this student');
      } else {
        console.log(`✅ Loaded ${assignments.length} assignments`);
      }
    } catch (error) {
      console.error('❌ Error fetching assignments:', {
        message: error.message,
        code: error.code,
        status: error.response?.status,
        data: error.response?.data
      });
      
      // Show user-friendly error message
      const errorMsg = error.response?.data?.message || error.message || 'Failed to load assignments';
      toast.error(errorMsg);
      
      // Set empty array so page doesn't crash
      setAssignments([]);
    } finally {
      setLoading(false);
    }
  };
  
  // Handle file selection
  const handleFileChange = (e, assignmentId) => {
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
    setSelectedAssignment(assignmentId);
  };
  
  // Submit assignment
  const handleSubmit = async (assignmentId) => {
    if (!file) {
      toast.error('Please select a file to upload');
      return;
    }
    
    // Check deadline
    const assignment = assignments.find(a => a.id === assignmentId);
    if (assignment && assignment.due_date) {
      const dueDate = new Date(assignment.due_date);
      const now = new Date();
      
      if (now > dueDate) {
        toast.error('Cannot submit after the deadline has passed');
        return;
      }
    }
    
    setUploadingId(assignmentId);
    
    try {
      // Prepare FormData
      const formData = new FormData();
      formData.append('file', file);
      
      await api.post(`/student/submit/${assignmentId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      toast.success('Assignment submitted successfully! Your teacher has been notified.');
      
      // Reset file input
      setFile(null);
      setSelectedAssignment(null);
      
      // Refresh assignments
      fetchAssignments();
      
    } catch (error) {
      console.error('Error submitting assignment:', error);
      const errorMsg = error.response?.data?.message || 'Failed to submit assignment';
      toast.error(errorMsg);
    } finally {
      setUploadingId(null);
    }
  };
  
  // View feedback
  const handleViewFeedback = (assignment) => {
    setFeedbackData({
      title: assignment.title,
      course: assignment.course_name,
      submitted_at: assignment.submitted_at,
      marks_obtained: assignment.marks_obtained,
      total_marks: assignment.total_marks,
      feedback: assignment.feedback,
      file_url: assignment.submission_file_url
    });
    setShowFeedbackModal(true);
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
  
  // Get time remaining
  const getTimeRemaining = (dueDate) => {
    if (!dueDate) return null;
    
    const now = new Date();
    const due = new Date(dueDate);
    const diff = due - now;
    
    if (diff < 0) return 'Overdue';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} left`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} left`;
    return 'Due soon';
  };
  
  return (
    <div className="student-assignments-container">
      <div className="assignments-header">
        <h1>My Assignments</h1>
        <div className="assignments-summary">
          <div className="summary-card">
            <span className="summary-count">{assignments.length}</span>
            <span className="summary-label">Total</span>
          </div>
          <div className="summary-card">
            <span className="summary-count">
              {assignments.filter(a => a.submission_id).length}
            </span>
            <span className="summary-label">Submitted</span>
          </div>
          <div className="summary-card">
            <span className="summary-count">
              {assignments.filter(a => !a.submission_id && !isDeadlinePassed(a.due_date)).length}
            </span>
            <span className="summary-label">Pending</span>
          </div>
        </div>
      </div>
      
      {/* Assignments Table */}
      <div className="assignments-table-container">
        {loading ? (
          <div className="loading-spinner">Loading assignments...</div>
        ) : assignments.length === 0 ? (
          <div className="empty-state">
            <p>No assignments yet</p>
            <p className="empty-subtitle">Your assignments will appear here once your teacher creates them</p>
          </div>
        ) : (
          <table className="assignments-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Course</th>
                <th>Due Date</th>
                <th>Status</th>
                <th>Grade</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {assignments.map(assignment => {
                const hasSubmitted = !!assignment.submission_id;
                const isGraded = hasSubmitted && assignment.graded;
                const isPastDue = isDeadlinePassed(assignment.due_date);
                const timeRemaining = getTimeRemaining(assignment.due_date);
                
                return (
                  <tr key={assignment.id}>
                    <td data-label="Title">
                      <div className="assignment-title">
                        <strong>{assignment.title}</strong>
                        {assignment.description && (
                          <div className="assignment-description">
                            {assignment.description.substring(0, 80)}
                            {assignment.description.length > 80 && '...'}
                          </div>
                        )}
                        {assignment.file_url && (
                          <a 
                            href={toBackendFileUrl(assignment.file_url)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="assignment-file-link"
                          >
                            📄 Download Assignment File
                          </a>
                        )}
                      </div>
                    </td>
                    <td data-label="Course">{assignment.course_name}</td>
                    <td data-label="Due Date">
                      <div className="due-date-cell">
                        <div className={isPastDue ? 'deadline-passed' : ''}>
                          {formatDate(assignment.due_date)}
                        </div>
                        {!isPastDue && timeRemaining && (
                          <div className="time-remaining">{timeRemaining}</div>
                        )}
                      </div>
                    </td>
                    <td data-label="Status">
                      {hasSubmitted ? (
                        <span className="status-badge status-submitted">✓ Submitted</span>
                      ) : isPastDue ? (
                         <span className="status-badge status-missed">✗ Missed</span>
                      ) : (
                        <span className="status-badge status-pending">⏳ Not Submitted</span>
                      )}
                    </td>
                    <td data-label="Grade">
                      {isGraded ? (
                        <div className="grade-display">
                          <span className="grade-score">
                            {assignment.marks_obtained}/{assignment.total_marks}
                          </span>
                          <span className="grade-percentage">
                            ({Math.round((assignment.marks_obtained / assignment.total_marks) * 100)}%)
                          </span>
                        </div>
                      ) : hasSubmitted ? (
                        <span className="grade-pending">Pending</span>
                      ) : (
                        <span className="grade-na">-</span>
                      )}
                    </td>
                    <td data-label="Actions">
                      <div className="action-buttons">
                        {!hasSubmitted && !isPastDue ? (
                          <div className="upload-section">
                            <input
                              type="file"
                              id={`file-${assignment.id}`}
                              onChange={(e) => handleFileChange(e, assignment.id)}
                              accept=".pdf,.doc,.docx"
                              style={{ display: 'none' }}
                            />
                            <label 
                              htmlFor={`file-${assignment.id}`}
                              className="btn-upload-label"
                            >
                              Choose File
                            </label>
                            {selectedAssignment === assignment.id && file && (
                              <button
                                className="btn-submit"
                                onClick={() => handleSubmit(assignment.id)}
                                disabled={uploadingId === assignment.id}
                              >
                                {uploadingId === assignment.id ? 'Uploading...' : 'Submit'}
                              </button>
                            )}
                            {selectedAssignment === assignment.id && file && (
                              <div className="selected-file-name">
                                {file.name}
                              </div>
                            )}
                          </div>
                        ) : isGraded ? (
                          <button
                            className="btn-feedback"
                            onClick={() => handleViewFeedback(assignment)}
                          >
                            View Feedback
                          </button>
                        ) : hasSubmitted ? (
                          <span className="submitted-label">✓ Awaiting Grading</span>
                        ) : (
                          <span className="missed-label">Deadline Passed</span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
      
      {/* Feedback Modal */}
      {showFeedbackModal && feedbackData && (
        <div className="modal-overlay" onClick={() => setShowFeedbackModal(false)}>
          <div className="modal-content feedback-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Assignment Feedback</h2>
              <button 
                className="modal-close"
                onClick={() => setShowFeedbackModal(false)}
              >
                ×
              </button>
            </div>
            
            <div className="feedback-content">
              <div className="feedback-section">
                <h3>{feedbackData.title}</h3>
                <p className="feedback-course">{feedbackData.course}</p>
              </div>
              
              <div className="feedback-section">
                <label>Submitted On:</label>
                <p>{formatDate(feedbackData.submitted_at)}</p>
              </div>
              
              <div className="feedback-section grade-section">
                <label>Your Grade:</label>
                <div className="grade-display-large">
                  <span className="grade-score-large">
                    {feedbackData.marks_obtained}/{feedbackData.total_marks}
                  </span>
                  <span className="grade-percentage-large">
                    {Math.round((feedbackData.marks_obtained / feedbackData.total_marks) * 100)}%
                  </span>
                </div>
              </div>
              
              {feedbackData.feedback && (
                <div className="feedback-section">
                  <label>Teacher's Feedback:</label>
                  <div className="feedback-text">
                    {feedbackData.feedback}
                  </div>
                </div>
              )}
              
              {feedbackData.file_url && (
                <div className="feedback-section">
                  <label>Your Submission:</label>
                  <a 
                    href={toBackendFileUrl(feedbackData.file_url)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="submission-file-link"
                  >
                    📄 Download Submitted File
                  </a>
                </div>
              )}
            </div>
            
            <div className="modal-actions">
              <button 
                className="btn-primary"
                onClick={() => setShowFeedbackModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentAssignments;
