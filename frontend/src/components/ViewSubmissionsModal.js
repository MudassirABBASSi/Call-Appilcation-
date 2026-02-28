import React, { useState, useEffect } from 'react';
import '../styles/assignment.css';

const ViewSubmissionsModal = ({ isOpen, assignmentId, assignmentTitle, onClose, onGrade }) => {
    const [submissions, setSubmissions] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen && assignmentId) {
            fetchSubmissions();
        }
    }, [isOpen, assignmentId]);

    const fetchSubmissions = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const res = await fetch(`/api/submissions/assignment/${assignmentId}/submissions`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (!res.ok) {
                const errorData = await res.json();
                setError(errorData.message || 'Error fetching submissions');
                setSubmissions([]);
                setStats(null);
                setLoading(false);
                return;
            }

            const data = await res.json();
            setSubmissions(data.submissions || []);
            setStats(data.stats || null);
            setError('');
        } catch (err) {
            setError('Error fetching submissions');
            console.error(err);
            setSubmissions([]);
            setStats(null);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString();
    };

    const getStatusBadgeClass = (status) => {
        switch(status) {
            case 'submitted': return 'status-submitted';
            case 'graded': return 'status-graded';
            case 'late': return 'status-late';
            default: return 'status-pending';
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content modal-large">
                <div className="modal-header">
                    <h2>Submissions - {assignmentTitle}</h2>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>

                <div className="submission-stats">
                    {stats && (
                        <div className="stats-grid">
                            <div className="stat-card">
                                <div className="stat-value">{stats.total_submissions}</div>
                                <div className="stat-label">Total Submissions</div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-value">{stats.submitted_count || 0}</div>
                                <div className="stat-label">Submitted</div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-value">{stats.late_count || 0}</div>
                                <div className="stat-label">Late</div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-value">{stats.graded_count || 0}</div>
                                <div className="stat-label">Graded</div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-value">{stats.average_marks?.toFixed(1) || '-'}</div>
                                <div className="stat-label">Average Marks</div>
                            </div>
                        </div>
                    )}
                </div>

                {error && <div className="error-message">{error}</div>}

                {loading ? (
                    <div className="loading">Loading submissions...</div>
                ) : submissions.length === 0 ? (
                    <div className="empty-state">
                        <p>No submissions yet</p>
                    </div>
                ) : (
                    <div className="submissions-table">
                        <table>
                            <thead>
                                <tr>
                                    <th>Student Name</th>
                                    <th>Email</th>
                                    <th>Status</th>
                                    <th>Submitted At</th>
                                    <th>Marks</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {submissions.map(submission => (
                                    <tr key={submission.id}>
                                        <td>{submission.student_name}</td>
                                        <td>{submission.student_email}</td>
                                        <td>
                                            <span className={`status-badge ${getStatusBadgeClass(submission.status)}`}>
                                                {submission.status.charAt(0).toUpperCase() + submission.status.slice(1)}
                                            </span>
                                        </td>
                                        <td>{formatDate(submission.submitted_at)}</td>
                                        <td>
                                            {submission.marks !== null 
                                                ? `${submission.marks}/${submission.total_marks || '?'}`
                                                : '-'
                                            }
                                        </td>
                                        <td>
                                            <a 
                                                href={submission.file_url} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="btn-small btn-download"
                                                title="Download submission"
                                            >
                                                Download
                                            </a>
                                            <button
                                                className="btn-small btn-grade"
                                                onClick={() => onGrade(submission.id, submission.student_name)}
                                                title="Grade submission"
                                            >
                                                Grade
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                <div className="modal-footer">
                    <button type="button" className="btn-cancel" onClick={onClose}>
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ViewSubmissionsModal;
