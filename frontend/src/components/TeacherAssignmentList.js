import React, { useState, useEffect } from 'react';
import '../styles/assignment.css';
import '../styles/dashboard.css';

const TeacherAssignmentList = ({ classId, onViewSubmissions, onEditAssignment, onRefresh }) => {
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchAssignments();
    }, [onRefresh, classId]);

    const fetchAssignments = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const url = classId ? `/api/teacher/assignments?class_id=${classId}` : '/api/teacher/assignments';
            const res = await fetch(url, {
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

    const handleDelete = async (assignmentId) => {
        if (!window.confirm('Are you sure you want to delete this assignment?')) return;

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`/api/assignments/teacher/${assignmentId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });

            if (!res.ok) {
                const errorData = await res.json();
                setError(errorData.message || 'Error deleting assignment');
                console.error('Delete error:', errorData);
                return;
            }

            setError('');
            onRefresh?.();
            fetchAssignments();
        } catch (err) {
            setError('Error deleting assignment');
            console.error('Delete error:', err);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString();
    };

    const isDeadlinePassed = (deadline) => {
        return new Date() > new Date(deadline);
    };

    if (loading) return <div className="loading">Loading assignments...</div>;

    return (
        <div className="assignment-list">
            {error && <div className="error-message">{error}</div>}

            {assignments.length === 0 ? (
                <div className="empty-state">
                    <p>No assignments created yet</p>
                </div>
            ) : (
                <div className="assignments-table">
                    <table className="custom-table">
                        <thead>
                            <tr>
                                <th>Title</th>
                                <th>Class</th>
                                <th>Total Marks</th>
                                <th>Deadline</th>
                                <th>Submissions</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {assignments.map(assignment => (
                                <tr key={assignment.id} className={isDeadlinePassed(assignment.deadline) ? 'deadline-passed' : ''}>
                                    <td>
                                        <div className="assignment-title" style={{display:'flex',alignItems:'center',gap:'8px'}}>
                                            <span style={{fontWeight:700}}>{assignment.title}</span>
                                            {assignment.file_url && (
                                                <a href={assignment.file_url} target="_blank" rel="noopener noreferrer" className="file-link">
                                                    📄
                                                </a>
                                            )}
                                        </div>
                                    </td>
                                    <td>
                                        <span className="badge badge-yellow">{assignment.class_title}</span>
                                    </td>
                                    <td>{assignment.total_marks}</td>
                                    <td>
                                        <span className={isDeadlinePassed(assignment.deadline) ? 'deadline-expired' : ''}>
                                            {formatDate(assignment.deadline)}
                                        </span>
                                    </td>
                                    <td>
                                        { (assignment.submission_count || 0) === 0 ? (
                                            <span className="badge badge-grey">0</span>
                                        ) : (
                                            <span className="badge badge-green">{assignment.submission_count}</span>
                                        )}
                                    </td>
                                    <td>
                                        <button
                                            className="btn btn-gold"
                                            onClick={() => onViewSubmissions(assignment.id)}
                                            title="View submissions"
                                            style={{marginRight:8}}
                                        >
                                            View
                                        </button>
                                        <button
                                            className="btn btn-warning"
                                            onClick={() => onEditAssignment(assignment.id)}
                                            title="Edit assignment"
                                            style={{marginRight:8}}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            className="btn btn-danger"
                                            onClick={() => handleDelete(assignment.id)}
                                            title="Delete assignment"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default TeacherAssignmentList;
