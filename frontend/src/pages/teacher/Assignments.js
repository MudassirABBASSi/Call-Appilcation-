import React, { useState, useEffect } from 'react';
import CreateAssignmentModal from '../../components/CreateAssignmentModal';
import TeacherAssignmentList from '../../components/TeacherAssignmentList';
import ViewSubmissionsModal from '../../components/ViewSubmissionsModal';
import GradeSubmissionModal from '../../components/GradeSubmissionModal';
import '../../styles/assignment.css';
import '../../styles/dashboard.css';

const TeacherAssignments = () => {
    const [classes, setClasses] = useState([]);
    const [selectedClass, setSelectedClass] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [viewSubmissionsModalOpen, setViewSubmissionsModalOpen] = useState(false);
    const [gradeModalOpen, setGradeModalOpen] = useState(false);
    const [selectedAssignmentId, setSelectedAssignmentId] = useState(null);
    const [selectedSubmissionId, setSelectedSubmissionId] = useState(null);
    const [selectedStudentName, setSelectedStudentName] = useState('');

    useEffect(() => {
        fetchTeacherClasses();
    }, []);

    const fetchTeacherClasses = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const res = await fetch('/api/teacher/classes', {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (!res.ok) {
                const errorData = await res.json();
                setError(errorData.message || 'Error fetching classes');
                setClasses([]);
                setLoading(false);
                return;
            }

            const data = await res.json();
            setClasses(data || []);
            if (data && data.length > 0) {
                setSelectedClass(data[0]);
            }
            setError('');
        } catch (err) {
            setError('Error fetching classes');
            console.error(err);
            setClasses([]);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateAssignment = () => {
        if (!selectedClass) {
            setError('Please select a class first');
            return;
        }
        setCreateModalOpen(true);
    };

    const handleViewSubmissions = (assignmentId) => {
        setSelectedAssignmentId(assignmentId);
        setViewSubmissionsModalOpen(true);
    };

    const handleGradeSubmission = (submissionId, studentName) => {
        setSelectedSubmissionId(submissionId);
        setSelectedStudentName(studentName);
        setGradeModalOpen(true);
    };

    const handleSuccess = () => {
        setRefreshTrigger(prev => prev + 1);
    };

    if (loading) {
        return <div className="loading">Loading your classes...</div>;
    }

    return (
        <div className="page-container">
            <div className="card-container">
                <div className="page-header">
                    <h1>Assignment Management</h1>
                    <div className="page-header-actions">
                        <div className="class-selector">
                            <label htmlFor="class-select">Select Class:</label>
                            <select
                                id="class-select"
                                value={selectedClass?.id || ''}
                                onChange={(e) => {
                                    const classId = parseInt(e.target.value);
                                    const selected = classes.find(c => c.id === classId);
                                    setSelectedClass(selected);
                                }}
                            >
                                {classes.map(cls => (
                                    <option key={cls.id} value={cls.id}>{cls.title}</option>
                                ))}
                            </select>
                        </div>
                        <button className="btn btn-gold" onClick={handleCreateAssignment}>
                            + Create Assignment
                        </button>
                    </div>
                </div>

                {error && <div className="alert alert-error">{error}</div>}

                {classes.length === 0 ? (
                    <div className="empty-state">
                        <p>You haven't created any classes yet</p>
                    </div>
                ) : (
                    <div className="table-container">
                        <div className="table-header">
                            <h2>Assignments List</h2>
                        </div>
                        <div className="table-wrapper">
                            <TeacherAssignmentList
                                classId={selectedClass?.id}
                                onViewSubmissions={handleViewSubmissions}
                                onEditAssignment={(id) => console.log('Edit:', id)}
                                onRefresh={refreshTrigger}
                            />
                        </div>
                    </div>
                )}

            {selectedClass && (
                <CreateAssignmentModal
                    isOpen={createModalOpen}
                    classId={selectedClass.id}
                    classTitle={selectedClass.title}
                    onClose={() => setCreateModalOpen(false)}
                    onSuccess={handleSuccess}
                />
            )}

            <ViewSubmissionsModal
                isOpen={viewSubmissionsModalOpen}
                assignmentId={selectedAssignmentId}
                assignmentTitle="Assignment"
                onClose={() => setViewSubmissionsModalOpen(false)}
                onGrade={handleGradeSubmission}
            />

            <GradeSubmissionModal
                isOpen={gradeModalOpen}
                submissionId={selectedSubmissionId}
                studentName={selectedStudentName}
                assignmentId={selectedAssignmentId}
                onClose={() => setGradeModalOpen(false)}
                onSuccess={handleSuccess}
            />

            
            </div>
        </div>
    );
};

export default TeacherAssignments;
