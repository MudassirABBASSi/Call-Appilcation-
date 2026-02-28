import React, { useState, useEffect } from 'react';
import '../styles/assignment.css';

const AdminAssignmentsView = () => {
    const [assignments, setAssignments] = useState([]);
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filterTab, setFilterTab] = useState('assignments');
    const [filterStatus, setFilterStatus] = useState('');

    useEffect(() => {
        if (filterTab === 'assignments') {
            fetchAssignments();
        } else {
            fetchSubmissions();
        }
    }, [filterTab]);

    const fetchAssignments = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const res = await fetch('/api/assignments/admin/list', {
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

    const fetchSubmissions = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            let url = '/api/submissions/admin/all';
            if (filterStatus) {
                url += `?status=${filterStatus}`;
            }
            const res = await fetch(url, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (!res.ok) {
                const errorData = await res.json();
                setError(errorData.message || 'Error fetching submissions');
                setSubmissions([]);
                setLoading(false);
                return;
            }

            const data = await res.json();
            setSubmissions(data.submissions || []);
            setError('');
        } catch (err) {
            setError('Error fetching submissions');
            console.error(err);
            setSubmissions([]);
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

    return (
        <div className="admin-assignments-view">
            <div className="view-tabs">
                <button
                    className={`tab-btn ${filterTab === 'assignments' ? 'active' : ''}`}
                    onClick={() => setFilterTab('assignments')}
                >
                    All Assignments
                </button>
                <button
                    className={`tab-btn ${filterTab === 'submissions' ? 'active' : ''}`}
                    onClick={() => setFilterTab('submissions')}
                >
                    All Submissions
                </button>
            </div>

            {error && <div className="error-message">{error}</div>}

            {filterTab === 'assignments' ? (
                <div className="assignments-section">
                    <h2>All Assignments</h2>
                    {loading ? (
                        <div className="loading">Loading assignments...</div>
                    ) : assignments.length === 0 ? (
                        <div className="empty-state">
                            <p>No assignments found</p>
                        </div>
                    ) : (
                        <div className="assignments-table">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Title</th>
                                        <th>Teacher</th>
                                        <th>Class</th>
                                        <th>Total Marks</th>
                                        <th>Deadline</th>
                                        <th>Submissions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {assignments.map(assignment => (
                                        <tr key={assignment.id}>
                                            <td>{assignment.title}</td>
                                            <td>{assignment.teacher_name}</td>
                                            <td>{assignment.class_title}</td>
                                            <td>{assignment.total_marks}</td>
                                            <td>{formatDate(assignment.deadline)}</td>
                                            <td>{assignment.submission_count || 0}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            ) : (
                <div className="submissions-section">
                    <h2>All Submissions</h2>
                    <div className="submission-filters">
                        <select
                            value={filterStatus}
                            onChange={(e) => {
                                setFilterStatus(e.target.value);
                            }}
                            className="filter-select"
                        >
                            <option value="">All Statuses</option>
                            <option value="pending">Pending</option>
                            <option value="submitted">Submitted</option>
                            <option value="graded">Graded</option>
                            <option value="late">Late</option>
                        </select>
                        <button onClick={fetchSubmissions} className="btn-small btn-primary">
                            Apply Filter
                        </button>
                    </div>

                    {loading ? (
                        <div className="loading">Loading submissions...</div>
                    ) : submissions.length === 0 ? (
                        <div className="empty-state">
                            <p>No submissions found</p>
                        </div>
                    ) : (
                        <div className="submissions-table">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Student</th>
                                        <th>Teacher</th>
                                        <th>Assignment</th>
                                        <th>Class</th>
                                        <th>Status</th>
                                        <th>Submitted At</th>
                                        <th>Marks</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {submissions.map(submission => (
                                        <tr key={submission.id}>
                                            <td>
                                                <div>
                                                    <div>{submission.student_name}</div>
                                                    <small>{submission.student_email}</small>
                                                </div>
                                            </td>
                                            <td>{submission.teacher_name}</td>
                                            <td>{submission.assignment_title}</td>
                                            <td>{submission.class_title}</td>
                                            <td>
                                                <span className={`status-badge ${getStatusBadgeClass(submission.status)}`}>
                                                    {submission.status.charAt(0).toUpperCase() + submission.status.slice(1)}
                                                </span>
                                            </td>
                                            <td>{formatDate(submission.submitted_at)}</td>
                                            <td>
                                                {submission.marks !== null
                                                    ? `${submission.marks}`
                                                    : '-'
                                                }
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default AdminAssignmentsView;
