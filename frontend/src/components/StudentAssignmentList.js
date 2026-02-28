import React, { useState, useEffect } from 'react';
import '../styles/assignment.css';

const StudentAssignmentList = ({ onSubmit, onRefresh }) => {
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchAssignments();
    }, [onRefresh]);

    const fetchAssignments = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const res = await fetch('/api/assignments/student/list', {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (!res.ok) {
                const errorData = await res.json();
                setError(errorData.message || 'Error fetching assignments');
                setAssignments([]);
                setLoading(false);
                return;
            }

            const data = await res.json();
            setAssignments(data.assignments || []);
            setError('');
        } catch (err) {
            setError('Error fetching assignments');
            console.error(err);
            setAssignments([]);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString();
    };

    const getTimeRemaining = (deadline) => {
        const now = new Date();
        const deadlineDate = new Date(deadline);
        const diff = deadlineDate - now;

        if (diff < 0) {
            return { text: 'Deadline Passed', class: 'deadline-passed' };
        }

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

        if (days > 0) {
            return { text: `${days}d ${hours}h remaining`, class: 'time-remaining' };
        } else if (hours > 0) {
            return { text: `${hours}h ${minutes}m remaining`, class: 'time-remaining warning' };
        } else {
            return { text: `${minutes}m remaining`, class: 'time-remaining critical' };
        }
    };

    const getStatusBadgeClass = (status) => {
        switch(status) {
            case 'submitted': return 'status-submitted';
            case 'graded': return 'status-graded';
            case 'late': return 'status-late';
            default: return 'status-pending';
        }
    };

    if (loading) return <div className="loading">Loading assignments...</div>;

    return (
        <div className="student-assignment-list">
            {error && <div className="error-message">{error}</div>}

            {assignments.length === 0 ? (
                <div className="empty-state">
                    <p>No assignments assigned to you yet</p>
                </div>
            ) : (
                <div className="assignments-grid">
                    {assignments.map(assignment => (
                        <div key={assignment.id} className="assignment-card">
                            <div className="card-header">
                                <h3>{assignment.title}</h3>
                                <span className={`status-badge ${getStatusBadgeClass(assignment.submission_status)}`}>
                                    {assignment.submission_status.charAt(0).toUpperCase() + assignment.submission_status.slice(1)}
                                </span>
                            </div>

                            <div className="card-body">
                                <div className="assignment-meta">
                                    <div className="meta-item">
                                        <span className="meta-label">Class:</span>
                                        <span className="meta-value">{assignment.class_title}</span>
                                    </div>
                                    <div className="meta-item">
                                        <span className="meta-label">Total Marks:</span>
                                        <span className="meta-value">{assignment.total_marks}</span>
                                    </div>
                                </div>

                                {assignment.description && (
                                    <div className="assignment-description">
                                        {assignment.description.substring(0, 100)}...
                                    </div>
                                )}

                                <div className={`deadline-info ${getTimeRemaining(assignment.deadline).class}`}>
                                    <strong>Deadline:</strong> {formatDate(assignment.deadline)}
                                    <div className="time-remaining-text">
                                        ⏱️ {getTimeRemaining(assignment.deadline).text}
                                    </div>
                                </div>

                                {assignment.file_url && (
                                    <div className="assignment-file">
                                        <a href={assignment.file_url} target="_blank" rel="noopener noreferrer">
                                            📄 View Assignment File
                                        </a>
                                    </div>
                                )}

                                {assignment.marks !== null && assignment.submission_status === 'graded' && (
                                    <div className="marks-display">
                                        <strong>Your Marks:</strong> {assignment.marks}/{assignment.total_marks}
                                        {assignment.feedback && (
                                            <div className="feedback-preview">
                                                <strong>Feedback:</strong>
                                                <p>{assignment.feedback}</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="card-footer">
                                {assignment.submission_status === 'pending' && !assignment.deadline_passed && (
                                    <button
                                        className="btn-primary"
                                        onClick={() => onSubmit(assignment.id, assignment.title)}
                                    >
                                        Submit Assignment
                                    </button>
                                )}
                                {assignment.submission_status === 'submitted' && (
                                    <button
                                        className="btn-primary"
                                        onClick={() => onSubmit(assignment.id, assignment.title)}
                                    >
                                        Resubmit
                                    </button>
                                )}
                                {assignment.deadline_passed && assignment.submission_status === 'pending' && (
                                    <div className="no-submit-info">
                                        Deadline has passed
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default StudentAssignmentList;
