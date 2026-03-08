import React, { useEffect, useState } from 'react';
import { submissionsAPI, assignmentsAPI } from '../api/api';
import { toast } from 'react-toastify';
import '../styles/grading.css';

const GradingInterface = ({ submissionId }) => {
  const [submission, setSubmission] = useState(null);
  const [assignment, setAssignment] = useState(null);
  const [formData, setFormData] = useState({
    marks_obtained: '',
    feedback: ''
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchSubmissionDetails();
  }, [submissionId]);

  const fetchSubmissionDetails = async () => {
    try {
      setLoading(true);
      const submissionRes = await submissionsAPI.getSubmissionById(submissionId);
      const submission = submissionRes.data.submission;
      setSubmission(submission);

      const assignmentRes = await assignmentsAPI.getAssignmentById(
        submission.assignment_id
      );
      setAssignment(assignmentRes.data.assignment);

      // Pre-fill marks if already graded
      if (submission.marks_obtained !== null) {
        setFormData({
          marks_obtained: submission.marks_obtained,
          feedback: submission.feedback || ''
        });
      }
    } catch (error) {
      console.error('Error fetching submission:', error);
      toast.error('Failed to load submission');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'marks_obtained' ? parseInt(value) || '' : value
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
    if (formData.marks_obtained === '') {
      newErrors.marks_obtained = 'Marks are required';
    } else if (
      formData.marks_obtained < 0 ||
      formData.marks_obtained > assignment.total_marks
    ) {
      newErrors.marks_obtained = `Marks must be between 0 and ${assignment.total_marks}`;
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setSubmitting(true);
      await submissionsAPI.gradeSubmission(submissionId, {
        marks_obtained: formData.marks_obtained,
        feedback: formData.feedback
      });
      toast.success('Grades submitted successfully');
      // Refresh submission
      fetchSubmissionDetails();
    } catch (error) {
      console.error('Error grading submission:', error);
      toast.error(error.response?.data?.message || 'Failed to grade submission');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading submission...</div>;
  }

  if (!submission || !assignment) {
    return <div className="error">Submission not found</div>;
  }

  return (
    <div className="grading-container">
      <div className="grading-header">
        <h1>Grade Submission</h1>
        <div className="submission-info">
          <p>
            <strong>Student:</strong> {submission.student_name}
          </p>
          <p>
            <strong>Assignment:</strong> {assignment.title}
          </p>
          <p>
            <strong>Submitted:</strong>{' '}
            {new Date(submission.submitted_at).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
        </div>
      </div>

      <div className="grading-content">
        <div className="submission-preview">
          <h2>Submission Preview</h2>
          {submission.file_url ? (
            <div className="submission-file">
              <a href={submission.file_url} target="_blank" rel="noopener noreferrer">
                View Submission File
              </a>
              <p className="file-url">{submission.file_url}</p>
            </div>
          ) : (
            <p>No file submitted</p>
          )}
        </div>

        <div className="grading-form">
          <h2>Grades</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="marks_obtained">
                Marks Obtained (0-{assignment.total_marks}) *
              </label>
              <input
                type="number"
                id="marks_obtained"
                name="marks_obtained"
                value={formData.marks_obtained}
                onChange={handleChange}
                min="0"
                max={assignment.total_marks}
                placeholder="Enter marks"
                className={errors.marks_obtained ? 'input-error' : ''}
              />
              {errors.marks_obtained && (
                <span className="error-message">{errors.marks_obtained}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="feedback">Feedback</label>
              <textarea
                id="feedback"
                name="feedback"
                value={formData.feedback}
                onChange={handleChange}
                placeholder="Add feedback for the student (optional)"
                rows="6"
              />
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => window.history.back()}
                disabled={submitting}
              >
                Back
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={submitting}
              >
                {submitting ? 'Saving...' : 'Save Grades'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {submission.marks_obtained !== null && (
        <div className="graded-badge">
          <strong>Status:</strong> Already graded
        </div>
      )}
    </div>
  );
};

export default GradingInterface;
