import React from 'react';
import AdminAssignmentsView from '../../components/AdminAssignmentsView';
import '../../styles/assignment.css';

const AdminAssignments = () => {
    return (
        <div className="admin-assignments-container">
            <div className="assignments-header">
                <h1>Assignment Management</h1>
                <p className="subtitle">Monitor all assignments and submissions across the system</p>
            </div>

            <AdminAssignmentsView />

            <style jsx>{`
                .admin-assignments-container {
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

export default AdminAssignments;
