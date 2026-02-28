import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import ClassModal from '../../components/ClassModal';
import { adminAPI } from '../../api/api';
import { colors } from '../../styles/colors';
import '../../styles/dashboard.css';

const ManageClasses = () => {
  const navigate = useNavigate();
  const [classes, setClasses] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const response = await adminAPI.getClasses();
      setClasses(response.data);
    } catch (error) {
      console.error('Error fetching classes:', error);
    }
  };

  const handleOpenModal = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleModalSave = () => {
    setMessage({ type: 'success', text: 'Class created successfully!' });
    fetchClasses();
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this class?')) {
      try {
        await adminAPI.deleteClass(id);
        setMessage({ type: 'success', text: 'Class deleted successfully!' });
        fetchClasses();
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      } catch (error) {
        setMessage({ type: 'error', text: 'Error deleting class' });
      }
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="dashboard-container">
      <Navbar />
      <Sidebar />
      <div className="main-content">
        <div className="content-wrapper">
          <div className="page-header">
            <h1>Manage Classes</h1>
            <div className="page-header-actions">
              <button 
                onClick={() => navigate('/admin/manage-teachers')}
                className="btn btn-gold"
              >
                + Add Teacher
              </button>
              <button 
                onClick={() => navigate('/admin/manage-students')}
                className="btn btn-gold"
              >
                + Add Student
              </button>
              <button 
                onClick={handleOpenModal}
                className="btn btn-gold"
              >
                + Add Class
              </button>
            </div>
          </div>

          {message.text && (
            <div className={`alert alert-${message.type}`}>
              {message.text}
            </div>
          )}

          <div className="table-container">
            <h2>All Classes</h2>
            <div className="table-wrapper">
              <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Title</th>
                  <th>Teacher</th>
                  <th>Students</th>
                  <th>Date & Time</th>
                  <th>Room ID</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {classes.map((classItem) => (
                  <tr key={classItem.id}>
                    <td>{classItem.id}</td>
                    <td>{classItem.title}</td>
                    <td>{classItem.teacher_name}</td>
                    <td style={{ textAlign: 'center', fontWeight: 'bold' }}>
                      {classItem.student_count || 0}
                    </td>
                    <td>{formatDate(classItem.date)}</td>
                    <td>{classItem.roomId}</td>
                    <td>
                      <button
                        onClick={() => handleDelete(classItem.id)}
                        className="btn btn-danger"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>            </div>          </div>

          <ClassModal 
            isOpen={showModal}
            onClose={handleCloseModal}
            onSave={handleModalSave}
          />
        </div>
      </div>
    </div>
  );
};

const styles = {};

export default ManageClasses;
