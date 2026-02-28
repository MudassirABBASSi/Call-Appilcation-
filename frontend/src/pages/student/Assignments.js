import React, { useState } from 'react';
import StudentAssignmentList from '../../components/StudentAssignmentList';
import SubmitAssignmentModal from '../../components/SubmitAssignmentModal';
import '../../styles/assignment.css';

const StudentAssignments = () => {
    const [submitModalOpen, setSubmitModalOpen] = useState(false);
    const [selectedAssignmentId, setSelectedAssignmentId] = useState(null);
    const [selectedAssignmentTitle, setSelectedAssignmentTitle] = useState('');
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const handleSubmit = (assignmentId, assignmentTitle) => {
        setSelectedAssignmentId(assignmentId);
        setSelectedAssignmentTitle(assignmentTitle);
        setSubmitModalOpen(true);
    };

    const handleSuccess = () => {
        setRefreshTrigger(prev => prev + 1);
    };

    return (
        <div className="student-assignments-container">
            <div className="assignments-header">
                <h1>My Assignments</h1>
                <p className="subtitle">View and submit your assigned classwork</p>
            </div>

            <StudentAssignmentList
                onSubmit={handleSubmit}
                onRefresh={refreshTrigger}
            />

            <SubmitAssignmentModal
                isOpen={submitModalOpen}
                assignmentId={selectedAssignmentId}
                assignmentTitle={selectedAssignmentTitle}
                onClose={() => setSubmitModalOpen(false)}
                onSuccess={handleSuccess}
            />

            <style jsx>{`
                .student-assignments-container {
                    min-height: 100vh;
                    background: #f5f5f5;
                }

                .assignments-header {
                    background: white;
                    padding: 30px;
                    border-bottom: 1px solid #e0e0e0;
                    margin-bottom: 20px;
                }

                .assignments-header h1 {
                    margin: 0 0 10px 0;
                    color: #333;
                }

                .subtitle {
                    margin: 0;
                    color: #666;
                    font-size: 1rem;
                }
            `}</style>
        </div>
    );
};

export default StudentAssignments;
