import React, { useEffect, useState } from 'react';
import { assignmentsAPI, submissionsAPI } from '../api/api';
import { toast } from 'react-toastify';
import SubmissionForm from './SubmissionForm';
import '../styles/assignment-detail.css';

const AssignmentDetail = ({ assignmentId, userRole }) => {
  const [assignment, setAssignment] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [mySubmission, setMySubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showSubmissionForm, setShowSubmissionForm] = useState(false);

  useEffect(() => {
    fetchAssignmentDetails();
  }, [assignmentId, userRole]);

  const fetchAssignmentDetails = async () => {
    try {
      setLoading(true);

      // Get assignment details
      const assignmentRes = await assignmentsAPI.getAssignmentById(assignmentId);
      setAssignment(assignmentRes.data.assignment);

      // If teacher, get submissions
      if (userRole === 'teacher' || userRole === 'admin') {
        const submissionsRes = await assignmentsAPI.getAssignmentSubmissions(
          assignmentId
        );
        setSubmissions(submissionsRes.data.submissions || []);
      }

      // If student, get own submission
      if (userRole === 'student') {
        try {
          const mySubmissionRes = await submissionsAPI.getSubmissionsByAssignment(
            assignmentId
          );
          if (mySubmissionRes.data.submissions.length > 0) {
            setMySubmission(mySubmissionRes.data.submissions[0]);
          }
        } catch (error) {
          // No submission yet
          setMySubmission(null);
        }
      }
    } catch (error) {
      console.error('Error fetching assignment:', error);
      toast.error('Failed to load assignment details');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmissionSuccess = () => {
    setShowSubmissionForm(false);
    fetchAssignmentDetails();
    toast.success('Assignment submitted successfully');
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No deadline';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isDeadlinePassed = assignment && new Date() > new Date(assignment.due_date);

  if (loading) {
    return <div className="loading">Loading assignment...</div>;
  }

  if (!assignment) {
    return <div className="error">Assignment not found</div>;
  }

  return (
    <div className="assignment-detail-container">
      <div className="assignment-detail">
        <h1>{assignment.title}</h1>

        <div className="assignment-info">
          <div className="info-section">
            <h3>Details</h3>
            <div className="info-row">
              <span className="label">Total Marks:</span>
              <span className="value">{assignment.total_marks}</span>
            </div>
            <div className="info-row">
              <span className="label">Due Date:</span>
              <span className={`value ${isDeadlinePassed ? 'deadline-passed' : ''}`}>
                {formatDate(assignment.due_date)}
              </span>
            </div>
            {assignment.day_of_week && (
              <div className="info-row">
                <span className="label">Day:</span>
                <span className="value">{assignment.day_of_week}</span>
              </div>
            )}
          </div>

          <div className="info-section">
            <h3>Description</h3>
            <p>{assignment.description || 'No description provided'}</p>
          </div>

          {assignment.file_url && (
            <div className="info-section">
              <h3>Resources</h3>
              <a href={assignment.file_url} target="_blank" rel="noopener noreferrer">
                Download Resource File
              </a>
            </div>
          )}
        </div>
      </div>

      {userRole === 'student' && (
        <div className="student-section">
          {mySubmission ? (
            <div className="submission-info">
              <h3>Your Submission</h3>
              <div className="submission-status">
                <p>
                  <strong>Submitted:</strong> {formatDate(mySubmission.submitted_at)}
                </p>
                {mySubmission.graded && (
                  <>
                    <p>
                      <strong>Marks Obtained:</strong> {mySubmission.marks_obtained}/{assignment.total_marks}
                    </p>
                    {mySubmission.feedback && (
                      <p>
                        <strong>Feedback:</strong> {mySubmission.feedback}
                      </p>
                    )}
                  </>
                )}
                {!mySubmission.graded && (
                  <p className="pending">Waiting for grades...</p>
                )}
              </div>
              {!mySubmission.graded && (
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowSubmissionForm(true)}
                >
                  Resubmit
                </button>
              )}
            </div>
          ) : (
            <div className="no-submission">
              <p>You have not submitted this assignment yet</p>
              {!isDeadlinePassed && (
                <button
                  className="btn btn-primary"
                  onClick={() => setShowSubmissionForm(true)}
                >
                  Submit Assignment
                </button>
              )}
              {isDeadlinePassed && (
                <p className="deadline-warning">Deadline has passed</p>
              )}
            </div>
          )}
        </div>
      )}

      {(userRole === 'teacher' || userRole === 'admin') && (
        <div className="submissions-section">
          <h2>Student Submissions ({submissions.length})</h2>
          {submissions.length === 0 ? (
            <p>No submissions yet</p>
          ) : (
            <table className="submissions-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Submitted</th>
                  <th>Status</th>
                  <th>Marks</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {submissions.map((submission) => (
                  <tr key={submission.id}>
                    <td>{submission.student_name}</td>
                    <td>{formatDate(submission.submitted_at)}</td>
                    <td>
                      <span
                        className={`status-badge ${
                          submission.graded ? 'graded' : 'pending'
                        }`}
                      >
                        {submission.graded ? 'Graded' : 'Pending'}
                      </span>
                    </td>
                    <td>
                      {submission.marks_obtained !== null
                        ? `${submission.marks_obtained}/${assignment.total_marks}`
                        : '-'}
                    </td>
                    <td>
                      <button
                        className="btn btn-sm btn-primary"
                        onClick={() =>
                          window.location.href = `/submission/${submission.id}`
                        }
                      >
                        Grade
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {showSubmissionForm && userRole === 'student' && (
        <SubmissionForm
          assignmentId={assignmentId}
          onClose={() => setShowSubmissionForm(false)}
          onSubmissionSuccess={handleSubmissionSuccess}
        />
      )}
    </div>
  );
};

export default AssignmentDetail;
