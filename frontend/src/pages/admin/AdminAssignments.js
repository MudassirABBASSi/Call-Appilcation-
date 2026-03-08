import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../../api/api';
import '../styles/admin-assignments.css';

const AdminAssignments = () => {
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [showSubmissionsModal, setShowSubmissionsModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/assignments');
      setAssignments(response.data.assignments || []);
    } catch (error) {
      console.error('Error fetching assignments:', error);
      toast.error('Failed to fetch assignments');
    } finally {
      setLoading(false);
    }
  };

  const fetchSubmissions = async (assignmentId) => {
    try {
      const response = await api.get(`/admin/submissions?assignment_id=${assignmentId}`);
      setSubmissions(response.data.submissions || []);
      setShowSubmissionsModal(true);
    } catch (error) {
      console.error('Error fetching submissions:', error);
      toast.error('Failed to fetch submissions');
    }
  };

  const handleViewSubmissions = (assignment) => {
    setSelectedAssignment(assignment);
    fetchSubmissions(assignment.id);
  };

  const closeModal = () => {
    setShowSubmissionsModal(false);
    setSelectedAssignment(null);
    setSubmissions([]);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    const date = new Date(dateString);
    const options = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return date.toLocaleDateString('en-US', options);
  };

  const isDeadlinePassed = (dueDate) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
  };

  const getSubmissionStats = (assignment) => {
    return `${assignment.submission_count || 0}`;
  };

  const getSubmissionPercentage = (assignment) => {
    if (!assignment.enrolled_count || assignment.enrolled_count === 0) return '0%';
    const percentage = ((assignment.submission_count || 0) / assignment.enrolled_count) * 100;
    return `${percentage.toFixed(0)}%`;
  };

  return (
    <div className="admin-assignments-container">
      <div className="assignments-header">
        <h1>All Assignments</h1>
        <p className="header-subtitle">View all assignments and submissions across all courses</p>
      </div>

      {loading ? (
        <div className="loading-spinner">Loading assignments...</div>
      ) : assignments.length === 0 ? (
        <div className="empty-state">
          <p>No assignments found</p>
          <p className="empty-subtitle">Assignments created by teachers will appear here</p>
        </div>
      ) : (
        <div className="assignments-table-container">
          <table className="assignments-table">
            <thead>
              <tr>
                <th>Assignment Title</th>
                <th>Teacher</th>
                <th>Course</th>
                <th>Due Date</th>
                <th>Total Marks</th>
                <th>Submissions</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {assignments.map((assignment) => (
                <tr key={assignment.id}>
                  <td>
                    <div className="assignment-title">
                      <strong>{assignment.title}</strong>
                      {assignment.description && (
                        <div className="assignment-description">
                          {assignment.description.length > 80
                            ? `${assignment.description.substring(0, 80)}...`
                            : assignment.description}
                        </div>
                      )}
                      {assignment.file_url && (
                        <a 
                          href={`${api.defaults.baseURL}${assignment.file_url}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="assignment-file-link"
                        >
                          📎 View Assignment File
                        </a>
                      )}
                    </div>
                  </td>
                  <td>{assignment.teacher_name || 'Unknown'}</td>
                  <td>{assignment.course_name || 'Unknown'}</td>
                  <td>
                    <div className={isDeadlinePassed(assignment.due_date) ? 'deadline-passed' : ''}>
                      {formatDate(assignment.due_date)}
                      {isDeadlinePassed(assignment.due_date) && (
                        <div style={{ fontSize: '0.85em', marginTop: '4px' }}>
                          (Deadline Passed)
                        </div>
                      )}
                    </div>
                  </td>
                  <td>{assignment.total_marks || 0}</td>
                  <td>
                    <div className="submission-stats">
                      <span className="submission-count">
                        {getSubmissionStats(assignment)}
                      </span>
                      <span className="submission-count-label">
                        {' / '}
                        {assignment.enrolled_count || 0}
                      </span>
                      <div className="submission-percentage">
                        ({getSubmissionPercentage(assignment)})
                      </div>
                    </div>
                  </td>
                  <td>
                    <span
                      className={`status-badge ${
                        isDeadlinePassed(assignment.due_date)
                          ? 'status-closed'
                          : 'status-active'
                      }`}
                    >
                      {isDeadlinePassed(assignment.due_date) ? 'Closed' : 'Active'}
                    </span>
                  </td>
                  <td>
                    <button
                      className="btn-view"
                      onClick={() => handleViewSubmissions(assignment)}
                    >
                      👁️ View Submissions
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Submissions Modal */}
      {showSubmissionsModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content submissions-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2>{selectedAssignment?.title}</h2>
                <p className="modal-subtitle">{selectedAssignment?.course_name}</p>
              </div>
              <button className="modal-close" onClick={closeModal}>
                &times;
              </button>
            </div>

            <div className="modal-body">
              {submissions.length === 0 ? (
                <div className="empty-state">
                  <p>No submissions yet</p>
                  <p className="empty-subtitle">
                    Students will appear here once they submit their work
                  </p>
                </div>
              ) : (
                <div className="submissions-table-container">
                  <table className="submissions-table">
                    <thead>
                      <tr>
                        <th>Student Name</th>
                        <th>Submitted On</th>
                        <th>Grade</th>
                        <th>Feedback</th>
                        <th>File</th>
                      </tr>
                    </thead>
                    <tbody>
                      {submissions.map((submission) => (
                        <tr key={submission.id}>
                          <td>{submission.student_name || 'Unknown'}</td>
                          <td>{formatDate(submission.submission_date)}</td>
                          <td>
                            {submission.marks !== null && submission.marks !== undefined ? (
                              <div className="grade-display">
                                <span className="grade-score">
                                  {submission.marks}/{selectedAssignment?.total_marks}
                                </span>
                                <span className="grade-percentage">
                                  (
                                  {(
                                    (submission.marks / selectedAssignment?.total_marks) *
                                    100
                                  ).toFixed(0)}
                                  %)
                                </span>
                              </div>
                            ) : (
                              <span className="grade-pending">Pending</span>
                            )}
                          </td>
                          <td>
                            {submission.feedback ? (
                              <div className="feedback-preview">
                                {submission.feedback.length > 50
                                  ? `${submission.feedback.substring(0, 50)}...`
                                  : submission.feedback}
                              </div>
                            ) : (
                              <span className="no-feedback">No feedback yet</span>
                            )}
                          </td>
                          <td>
                            {submission.file_url ? (
                              <a
                                href={`${api.defaults.baseURL}${submission.file_url}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="file-download-link"
                              >
                                📥 Download
                              </a>
                            ) : (
                              <span className="no-file">No file</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="modal-actions">
              <button className="btn-primary" onClick={closeModal}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAssignments;
