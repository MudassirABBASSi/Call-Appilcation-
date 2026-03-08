import React, { useEffect, useState } from 'react';
import { assignmentsAPI } from '../api/api';
import { toast } from 'react-toastify';
import CreateAssignmentForm from './CreateAssignmentForm';
import '../styles/assignments.css';

const AssignmentsList = ({ courseId, userRole }) => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    fetchAssignments();
  }, [courseId, userRole]);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const response = await assignmentsAPI.getAllAssignments();
      // Filter by course if courseId is provided
      const filtered = courseId
        ? response.data.assignments.filter((a) => a.course_id === parseInt(courseId))
        : response.data.assignments;
      setAssignments(filtered || []);
    } catch (error) {
      console.error('Error fetching assignments:', error);
      toast.error('Failed to load assignments');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignmentCreated = () => {
    fetchAssignments();
    setShowCreateForm(false);
    toast.success('Assignment created successfully');
  };

  const handleAssignmentDeleted = (assignmentId) => {
    setAssignments((prev) => prev.filter((a) => a.id !== assignmentId));
    toast.success('Assignment deleted successfully');
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

  if (loading) {
    return <div className="loading">Loading assignments...</div>;
  }

  return (
    <div className="assignments-container">
      <div className="assignments-header">
        <h2>Assignments</h2>
        {userRole === 'teacher' && (
          <button
            className="btn btn-primary"
            onClick={() => setShowCreateForm(true)}
          >
            Create Assignment
          </button>
        )}
      </div>

      {showCreateForm && userRole === 'teacher' && (
        <CreateAssignmentForm
          courseId={courseId}
          onClose={() => setShowCreateForm(false)}
          onAssignmentCreated={handleAssignmentCreated}
        />
      )}

      {assignments.length === 0 ? (
        <div className="no-data">
          No assignments available
        </div>
      ) : (
        <div className="assignments-list">
          {assignments.map((assignment) => (
            <div key={assignment.id} className="assignment-card">
              <div className="assignment-header">
                <h3>{assignment.title}</h3>
                {userRole === 'teacher' && (
                  <div className="assignment-actions">
                    <button
                      className="btn btn-sm btn-primary"
                      onClick={() =>
                        window.location.href = `/assignment/${assignment.id}`
                      }
                    >
                      View Details
                    </button>
                    <button
                      className="btn btn-sm btn-secondary"
                      onClick={() => handleDeleteAssignment(assignment.id)}
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
              <p className="assignment-description">{assignment.description}</p>
              <div className="assignment-meta">
                <span>Total Marks: {assignment.total_marks}</span>
                <span>Due: {formatDate(assignment.due_date)}</span>
              </div>
              {userRole === 'student' && (
                <button
                  className="btn btn-secondary"
                  onClick={() =>
                    window.location.href = `/assignment/${assignment.id}/submit`
                  }
                >
                  View & Submit
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  async function handleDeleteAssignment(assignmentId) {
    if (!window.confirm('Are you sure you want to delete this assignment?')) {
      return;
    }
    try {
      await assignmentsAPI.deleteAssignment(assignmentId);
      handleAssignmentDeleted(assignmentId);
    } catch (error) {
      console.error('Error deleting assignment:', error);
      toast.error('Failed to delete assignment');
    }
  }
};

export default AssignmentsList;
