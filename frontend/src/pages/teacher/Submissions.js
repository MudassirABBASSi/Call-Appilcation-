import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../api/api';
import '../../styles/teacher-submissions.css';

/**
 * Teacher Submissions Page
 * Route: /teacher/submissions/:assignmentId
 * 
 * Features:
 * - View all student submissions for an assignment
 * - Grade submissions with marks and feedback
 * - Download submitted files
 * - Filter by submission status (all, submitted, pending, graded)
 * - View submission statistics
 */

const TeacherSubmissions = () => {
  const { assignmentId } = useParams();
  const navigate = useNavigate();
  
  const [assignment, setAssignment] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [filteredSubmissions, setFilteredSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    submitted: 0,
    pending: 0,
    graded: 0
  });
  
  // Grading modal
  const [showGradeModal, setShowGradeModal] = useState(false);
  const [currentSubmission, setCurrentSubmission] = useState(null);
  const [gradeFormData, setGradeFormData] = useState({
    marks: '',
    feedback: ''
  });

  useEffect(() => {
    fetchAssignmentDetails();
    fetchSubmissions();
  }, [assignmentId]);

  useEffect(() => {
    applyFilters();
  }, [submissions, filterStatus, searchQuery]);

  const fetchAssignmentDetails = async () => {
    try {
      setErrorMessage('');
      const response = await api.get(`/teacher/assignments/${assignmentId}`);
      setAssignment(response.data.assignment);
    } catch (error) {
      console.error('Error fetching assignment:', error);
      const message = error.response?.data?.message || 'Failed to fetch assignment details';
      setErrorMessage(message);
      toast.error(message);
    }
  };

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      setErrorMessage('');
      const response = await api.get(`/teacher/submissions/${assignmentId}`);
      const subs = Array.isArray(response.data?.submissions) ? response.data.submissions : [];
      setSubmissions(subs);
      
      // Calculate statistics
      const total = subs.length;
      const submitted = subs.filter(s => s.submitted_at).length;
      const graded = subs.filter(s => s.marks !== null && s.marks !== undefined).length;
      const pending = submitted - graded;
      
      setStats({ total, submitted, pending, graded });
    } catch (error) {
      console.error('Error fetching submissions:', error);
      const message = error.response?.data?.message || 'Failed to fetch submissions';
      setErrorMessage(message);
      toast.error(message);
      setSubmissions([]);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...submissions];
    
    // Filter by status
    if (filterStatus === 'submitted') {
      filtered = filtered.filter(s => s.submitted_at && (!s.marks && s.marks !== 0));
    } else if (filterStatus === 'graded') {
      filtered = filtered.filter(s => s.marks !== null && s.marks !== undefined);
    } else if (filterStatus === 'pending') {
      filtered = filtered.filter(s => !s.submitted_at);
    }
    
    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(s => 
        (s.student_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.student_email || '').toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    setFilteredSubmissions(filtered);
  };

  const handleGradeClick = (submission) => {
    const submissionId = submission.submission_id ?? submission.id;
    if (!submissionId) {
      toast.error('This student has not submitted yet.');
      return;
    }

    setCurrentSubmission(submission);
    setGradeFormData({
      marks: submission.marks ?? '',
      feedback: submission.feedback || ''
    });
    setShowGradeModal(true);
  };

  const handleGradeSubmit = async (e) => {
    e.preventDefault();
    
    if (!gradeFormData.marks && gradeFormData.marks !== 0) {
      toast.error('Please enter marks');
      return;
    }

    const marks = parseFloat(gradeFormData.marks);
    if (isNaN(marks) || marks < 0) {
      toast.error('Please enter valid marks (0 or above)');
      return;
    }

    if (assignment && marks > assignment.total_marks) {
      toast.error(`Marks cannot exceed ${assignment.total_marks}`);
      return;
    }

    try {
      const submissionId = currentSubmission.submission_id ?? currentSubmission.id;
      await api.put(`/teacher/grade/${submissionId}`, {
        marks_obtained: marks,
        feedback: gradeFormData.feedback
      });
      
      toast.success('Submission graded successfully');
      setShowGradeModal(false);
      setCurrentSubmission(null);
      fetchSubmissions();
    } catch (error) {
      console.error('Error grading submission:', error);
      toast.error(error.response?.data?.message || 'Failed to grade submission');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not submitted';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getSubmissionStatus = (submission) => {
    if (!submission.submitted_at) {
      return { text: 'Not Submitted', className: 'status-pending' };
    } else if (submission.marks !== null && submission.marks !== undefined) {
      return { text: 'Graded', className: 'status-graded' };
    } else {
      return { text: 'Submitted', className: 'status-submitted' };
    }
  };

  const downloadFile = (fileUrl, studentName) => {
    if (!fileUrl) {
      toast.error('No file available');
      return;
    }
    
    const link = document.createElement('a');
    link.href = `http://localhost:5000${fileUrl}`;
    link.download = `${studentName}_submission`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="teacher-submissions-container">
      {errorMessage && (
        <div className="empty-state" style={{ marginBottom: '16px', padding: '16px' }}>
          <p>{errorMessage}</p>
        </div>
      )}

      {/* Header Section */}
      <div className="submissions-header">
        <button className="btn-back" onClick={() => navigate('/teacher/assignments')}>
          ← Back to Assignments
        </button>
        <div className="header-content">
          <h1>Assignment Submissions</h1>
          {assignment && (
            <div className="assignment-info">
              <h2>{assignment.title}</h2>
              <div className="assignment-meta">
                <span><strong>Class:</strong> {assignment.class_title}</span>
                <span><strong>Total Marks:</strong> {assignment.total_marks}</span>
                <span><strong>Deadline:</strong> {formatDate(assignment.deadline)}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="stats-container">
        <div className="stat-card">
          <div className="stat-number">{stats.total}</div>
          <div className="stat-label">Total Students</div>
        </div>
        <div className="stat-card stat-success">
          <div className="stat-number">{stats.submitted}</div>
          <div className="stat-label">Submitted</div>
        </div>
        <div className="stat-card stat-warning">
          <div className="stat-number">{stats.pending}</div>
          <div className="stat-label">Pending Grading</div>
        </div>
        <div className="stat-card stat-info">
          <div className="stat-number">{stats.graded}</div>
          <div className="stat-label">Graded</div>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-container">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search by student name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="filter-buttons">
          <button 
            className={filterStatus === 'all' ? 'active' : ''}
            onClick={() => setFilterStatus('all')}
          >
            All ({stats.total})
          </button>
          <button 
            className={filterStatus === 'submitted' ? 'active' : ''}
            onClick={() => setFilterStatus('submitted')}
          >
            Submitted ({stats.submitted - stats.graded})
          </button>
          <button 
            className={filterStatus === 'graded' ? 'active' : ''}
            onClick={() => setFilterStatus('graded')}
          >
            Graded ({stats.graded})
          </button>
          <button 
            className={filterStatus === 'pending' ? 'active' : ''}
            onClick={() => setFilterStatus('pending')}
          >
            Not Submitted ({stats.total - stats.submitted})
          </button>
        </div>
      </div>

      {/* Submissions Table */}
      <div className="submissions-table-container table-wrapper">
        {loading ? (
          <div className="loading">Loading submissions...</div>
        ) : filteredSubmissions.length === 0 ? (
          <div className="empty-state">
            <p>No submissions found</p>
            <p className="empty-subtitle">
              {filterStatus !== 'all' 
                ? `No ${filterStatus} submissions` 
                : 'No students enrolled in this assignment'}
            </p>
          </div>
        ) : (
          <table className="submissions-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Student Name</th>
                <th>Email</th>
                <th>Submitted At</th>
                <th>Status</th>
                <th>Marks</th>
                <th>File</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSubmissions.map((submission, index) => {
                const status = getSubmissionStatus(submission);
                return (
                  <tr key={submission.submission_id || submission.id || `${submission.student_id}-${index}`}>
                    <td>{index + 1}</td>
                    <td className="student-name">{submission.student_name || 'N/A'}</td>
                    <td className="student-email">{submission.student_email || 'N/A'}</td>
                    <td>{formatDate(submission.submitted_at)}</td>
                    <td>
                      <span className={`status-badge ${status.className}`}>
                        {status.text}
                      </span>
                    </td>
                    <td className="marks-cell">
                      {submission.marks !== null && submission.marks !== undefined
                        ? `${submission.marks}/${assignment?.total_marks || 100}`
                        : '-'}
                    </td>
                    <td>
                      {submission.file_url ? (
                        <button 
                          className="btn-download"
                          onClick={() => downloadFile(submission.file_url, submission.student_name)}
                          title="Download submission"
                        >
                          📥 Download
                        </button>
                      ) : (
                        <span className="no-file">No file</span>
                      )}
                    </td>
                    <td>
                      {submission.submitted_at && (submission.submission_id || submission.id) ? (
                        <button 
                          className="btn-grade"
                          onClick={() => handleGradeClick(submission)}
                          title={submission.marks !== null && submission.marks !== undefined ? 'Update Grade' : 'Grade Submission'}
                        >
                          {submission.marks !== null && submission.marks !== undefined ? 'Update' : 'Grade'}
                        </button>
                      ) : (
                        <span className="not-available">N/A</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Grade Modal */}
      {showGradeModal && currentSubmission && (
        <div className="modal-overlay" onClick={() => setShowGradeModal(false)}>
          <div className="modal-content grade-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Grade Submission</h2>
              <button 
                className="btn-close" 
                onClick={() => setShowGradeModal(false)}
              >
                ✕
              </button>
            </div>
            
            <div className="modal-body">
              <div className="student-info-card">
                <h3>{currentSubmission.student_name}</h3>
                <p>{currentSubmission.student_email}</p>
                <p><strong>Submitted:</strong> {formatDate(currentSubmission.submitted_at)}</p>
                {currentSubmission.file_url && (
                  <button 
                    className="btn-view-file"
                    onClick={() => downloadFile(currentSubmission.file_url, currentSubmission.student_name)}
                  >
                    📄 View Submitted File
                  </button>
                )}
              </div>

              <form onSubmit={handleGradeSubmit}>
                <div className="form-group">
                  <label>
                    Marks Obtained *
                    <span className="total-marks">
                      (Out of {assignment?.total_marks || 100})
                    </span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    max={assignment?.total_marks || 100}
                    step="0.5"
                    value={gradeFormData.marks}
                    onChange={(e) => setGradeFormData({
                      ...gradeFormData,
                      marks: e.target.value
                    })}
                    placeholder="Enter marks"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>
                    Feedback (Optional)
                  </label>
                  <textarea
                    rows="5"
                    value={gradeFormData.feedback}
                    onChange={(e) => setGradeFormData({
                      ...gradeFormData,
                      feedback: e.target.value
                    })}
                    placeholder="Enter feedback for the student..."
                  />
                </div>

                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn-cancel"
                    onClick={() => setShowGradeModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-submit">
                    Submit Grade
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherSubmissions;
