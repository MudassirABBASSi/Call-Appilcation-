import React, { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import TeacherModal from '../../components/TeacherModal';
import { adminAPI } from '../../api/api';
import { colors } from '../../styles/colors';
import '../../styles/dashboard.css';

const ManageTeachers = () => {
  const [teachers, setTeachers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    try {
      const response = await adminAPI.getTeachers();
      setTeachers(response.data);
    } catch (error) {
      console.error('Error fetching teachers:', error);
    }
  };

  const handleOpenModal = (teacher = null) => {
    setSelectedTeacher(teacher);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedTeacher(null);
  };

  const handleModalSave = () => {
    setMessage({ type: 'success', text: selectedTeacher ? 'Teacher updated successfully!' : 'Teacher added successfully!' });
    fetchTeachers();
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this teacher?')) {
      try {
        await adminAPI.deleteTeacher(id);
        setMessage({ type: 'success', text: 'Teacher deleted successfully!' });
        fetchTeachers();
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      } catch (error) {
        setMessage({ type: 'error', text: 'Error deleting teacher' });
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
            <h1>Manage Teachers</h1>
            <div className="page-header-actions">
              <button 
                onClick={() => handleOpenModal()}
                className="btn btn-gold"
              >
                + Add Teacher
              </button>
            </div>
          </div>

          {message.text && (
            <div className={`alert alert-${message.type}`}>
              {message.text}
            </div>
          )}

          <div className="table-container">
            <h2>Teachers List</h2>
            <div className="table-wrapper">
              <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Created At</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {teachers.map((teacher) => (
                  <tr key={teacher.id}>
                    <td>{teacher.id}</td>
                    <td>{teacher.name}</td>
                    <td>{teacher.email}</td>
                    <td>{new Date(teacher.created_at).toLocaleDateString()}</td>
                    <td>
                      <button
                        onClick={() => handleOpenModal(teacher)}
                        className="btn btn-warning"
                        style={{ marginRight: '10px' }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(teacher.id)}
                        className="btn btn-danger"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>            </div>          </div>

          <TeacherModal 
            isOpen={showModal}
            onClose={handleCloseModal}
            onSave={handleModalSave}
            teacher={selectedTeacher}
          />
        </div>
      </div>
    </div>
  );
};

const styles = {};

export default ManageTeachers;
