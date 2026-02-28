import React, { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import StudentModal from '../../components/StudentModal';
import { adminAPI } from '../../api/api';
import { colors } from '../../styles/colors';
import '../../styles/dashboard.css';

const ManageStudents = () => {
  const [students, setStudents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await adminAPI.getStudents();
      setStudents(response.data);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const handleOpenModal = (student = null) => {
    setSelectedStudent(student);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedStudent(null);
  };

  const handleModalSave = () => {
    setMessage({ type: 'success', text: selectedStudent ? 'Student updated successfully!' : 'Student added successfully!' });
    fetchStudents();
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      try {
        await adminAPI.deleteStudent(id);
        setMessage({ type: 'success', text: 'Student deleted successfully!' });
        fetchStudents();
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      } catch (error) {
        setMessage({ type: 'error', text: 'Error deleting student' });
      }
    }
  };

  return (
    <div className="dashboard-container">
      <Navbar />
      <Sidebar />
      <div className="main-content">
        <div className="content-wrapper">
          <div className="page-header">
            <h1>Manage Students</h1>
            <div className="page-header-actions">
              <button 
                onClick={() => handleOpenModal()}
                className="btn btn-gold"
              >
                + Add Student
              </button>
            </div>
          </div>

          {message.text && (
            <div className={`alert alert-${message.type}`}>
              {message.text}
            </div>
          )}

          <div className="table-container">
            <h2>Students List</h2>
            <div className="table-wrapper">
              <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Course</th>
                  <th>Teacher</th>
                  <th>Created At</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr key={student.id}>
                    <td>{student.id}</td>
                    <td>{student.name}</td>
                    <td>{student.email}</td>
                    <td>{student.phone || '-'}</td>
                    <td><span style={{backgroundColor: '#D4AF37', padding: '3px 8px', borderRadius: '3px', fontSize: '0.85rem'}}>{student.course_name || '-'}</span></td>
                    <td>{student.teacher_id ? 'Assigned' : 'Not Assigned'}</td>
                    <td>{new Date(student.created_at).toLocaleDateString()}</td>
                    <td>
                      <button
                        onClick={() => handleOpenModal(student)}
                        className="btn btn-warning"
                        style={{ marginRight: '10px' }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(student.id)}
                        className="btn btn-danger"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>            </div>          </div>

          <StudentModal 
            isOpen={showModal}
            onClose={handleCloseModal}
            onSave={handleModalSave}
            student={selectedStudent}
          />
        </div>
      </div>
    </div>
  );
};

const styles = {};

export default ManageStudents;
