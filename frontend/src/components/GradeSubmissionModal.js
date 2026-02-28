import React, { useState, useEffect } from 'react';
import '../styles/assignment.css';

const GradeSubmissionModal = ({ isOpen, submissionId, studentName, assignmentId, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        marks: '',
        feedback: ''
    });
    const [submission, setSubmission] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [totalMarks, setTotalMarks] = useState(0);

    useEffect(() => {
        if (isOpen && submissionId) {
            fetchSubmissionDetail();
        }
    }, [isOpen, submissionId]);

    const fetchSubmissionDetail = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const res = await fetch(`/api/submissions/${submissionId}/detail`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (!res.ok) {
                const errorData = await res.json();
                setError(errorData.message || 'Error fetching submission details');
                setSubmission(null);
                setTotalMarks(0);
                setLoading(false);
                return;
            }

            const data = await res.json();
            setSubmission(data.submission);
            setTotalMarks(data.assignment?.total_marks || 0);
            setFormData({
                marks: data.submission?.marks || '',
                feedback: data.submission?.feedback || ''
            });
            setError('');
        } catch (err) {
            setError('Error fetching submission details');
            console.error(err);
            setSubmission(null);
            setTotalMarks(0);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        // Validation
        if (formData.marks === '') {
            setError('Marks are required');
            setLoading(false);
            return;
        }

        if (parseInt(formData.marks) > totalMarks) {
            setError(`Marks cannot exceed total marks (${totalMarks})`);
            setLoading(false);
            return;
        }

        if (parseInt(formData.marks) < 0) {
            setError('Marks cannot be negative');
            setLoading(false);
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`/api/submissions/${submissionId}/grade`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    marks: parseInt(formData.marks),
                    feedback: formData.feedback
                })
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.message || 'Error grading submission');
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

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h2>Grade Submission - {studentName}</h2>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>

                {loading ? (
                    <div className="loading">Loading submission details...</div>
                ) : (
                    <form onSubmit={handleSubmit} className="grade-form">
                        {error && <div className="error-message">{error}</div>}

                        <div className="form-group">
                            <label>Submission Status</label>
                            <div className="status-display">
                                {submission?.status.charAt(0).toUpperCase() + submission?.status.slice(1)}
                                {submission?.status === 'late' && <span className="late-badge">LATE</span>}
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Submitted At</label>
                            <div className="display-value">
                                {submission?.submitted_at && new Date(submission.submitted_at).toLocaleString()}
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Marks *</label>
                            <div className="marks-input-group">
                                <input
                                    type="number"
                                    name="marks"
                                    value={formData.marks}
                                    onChange={handleChange}
                                    required
                                    min="0"
                                    max={totalMarks}
                                    placeholder="Enter marks"
                                />
                                <span className="marks-out-of">/ {totalMarks}</span>
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Feedback</label>
                            <textarea
                                name="feedback"
                                value={formData.feedback}
                                onChange={handleChange}
                                placeholder="Add feedback for the student"
                                rows="6"
                            />
                        </div>

                        <div className="submission-file-info">
                            <p>
                                <strong>Submission File:</strong>
                                <a href={submission?.file_url} target="_blank" rel="noopener noreferrer" className="file-link">
                                    📄 View/Download
                                </a>
                            </p>
                        </div>

                        <div className="modal-footer">
                            <button type="button" className="btn-cancel" onClick={onClose} disabled={loading}>
                                Cancel
                            </button>
                            <button type="submit" className="btn-primary" disabled={loading}>
                                {loading ? 'Saving...' : 'Save Grade'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default GradeSubmissionModal;
