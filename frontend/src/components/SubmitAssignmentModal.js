import React, { useState, useEffect } from 'react';
import '../styles/assignment.css';

const SubmitAssignmentModal = ({ isOpen, assignmentId, assignmentTitle, onClose, onSuccess }) => {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [assignment, setAssignment] = useState(null);
    const [submission, setSubmission] = useState(null);

    useEffect(() => {
        if (isOpen && assignmentId) {
            fetchAssignmentDetail();
        }
    }, [isOpen, assignmentId]);

    const fetchAssignmentDetail = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`/api/assignments/student/${assignmentId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (!res.ok) {
                const errorData = await res.json();
                setError(errorData.message || 'Error fetching assignment details');
                setAssignment(null);
                setSubmission(null);
                return;
            }

            const data = await res.json();
            setAssignment(data.assignment);
            setSubmission(data.submission);
            setError('');
        } catch (err) {
            setError('Error fetching assignment details');
            console.error(err);
            setAssignment(null);
            setSubmission(null);
        }
    };

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            const allowedTypes = ['application/pdf', 'application/msword',
                                'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
            if (!allowedTypes.includes(selectedFile.type)) {
                setError('Only PDF, DOC, and DOCX files are allowed');
                setFile(null);
                return;
            }
            if (selectedFile.size > 10 * 1024 * 1024) {
                setError('File size must be less than 10MB');
                setFile(null);
                return;
            }
            setFile(selectedFile);
            setError('');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (!file) {
            setError('Please select a file to submit');
            setLoading(false);
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const formData = new FormData();
            formData.append('file', file);

            const res = await fetch(`/api/submissions/${assignmentId}/submit`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
                body: formData
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.message || 'Error submitting assignment');
                setLoading(false);
                return;
            }

            onSuccess();
            onClose();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen || !assignment) return null;

    const isDeadlinePassed = new Date() > new Date(assignment.deadline);
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString();
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h2>Submit Assignment - {assignmentTitle}</h2>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>

                <div className="assignment-details">
                    <div className="detail-row">
                        <span className="label">Deadline:</span>
                        <span className={isDeadlinePassed ? 'deadline-passed' : ''}>
                            {formatDate(assignment.deadline)}
                            {isDeadlinePassed && <strong style={{ marginLeft: '10px', color: '#e74c3c' }}>(PASSED)</strong>}
                        </span>
                    </div>
                    <div className="detail-row">
                        <span className="label">Total Marks:</span>
                        <span>{assignment.total_marks}</span>
                    </div>
                    {assignment.description && (
                        <div className="detail-row">
                            <span className="label">Description:</span>
                            <span>{assignment.description}</span>
                        </div>
                    )}
                    {assignment.file_url && (
                        <div className="detail-row">
                            <span className="label">Assignment File:</span>
                            <a href={assignment.file_url} target="_blank" rel="noopener noreferrer" className="file-link">
                                📄 Download
                            </a>
                        </div>
                    )}
                </div>

                {submission?.status === 'graded' && (
                    <div className="grading-info">
                        <h3>Your Grading</h3>
                        <div className="grade-display">
                            <div className="marks-box">
                                <div className="marks-value">{submission.marks}/{assignment.total_marks}</div>
                                <div className="marks-label">Marks</div>
                            </div>
                        </div>
                        {submission.feedback && (
                            <div className="feedback-box">
                                <h4>Teacher Feedback:</h4>
                                <p>{submission.feedback}</p>
                            </div>
                        )}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="submit-form">
                    {error && <div className="error-message">{error}</div>}

                    <div className="form-group">
                        <label>Submit Your Assignment File (PDF, DOC, DOCX) *</label>
                        <input
                            type="file"
                            onChange={handleFileChange}
                            accept=".pdf,.doc,.docx"
                            disabled={isDeadlinePassed && submission?.status === 'pending'}
                        />
                        {file && <p className="file-info">Selected: {file.name}</p>}
                    </div>

                    {submission?.status === 'submitted' && (
                        <div className="info-message">
                            ℹ️ You have already submitted this assignment on {formatDate(submission.submitted_at)}.
                            You can resubmit to replace your previous submission.
                        </div>
                    )}

                    {submission?.status === 'late' && (
                        <div className="warning-message">
                            ⚠️ Your previous submission was marked as LATE. Resubmitting will not change this status.
                        </div>
                    )}

                    <div className="modal-footer">
                        <button type="button" className="btn-cancel" onClick={onClose} disabled={loading}>
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn-primary"
                            disabled={loading || (isDeadlinePassed && submission?.status === 'pending')}
                        >
                            {loading ? 'Submitting...' : 'Submit Assignment'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SubmitAssignmentModal;
