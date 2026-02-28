import React, { useEffect, useState } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import CreateClassModal from '../../components/CreateClassModal';
import ClassList from '../../components/ClassList';
import api from '../../api/api';
import toastService from '../../services/toastService';
import '../../styles/dashboard.css';

const ManageClasses = () => {
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filter, setFilter] = useState('active'); // 'active', 'all'

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [classesRes, teachersRes] = await Promise.all([
        api.get(`/classes/list?includeInactive=${filter === 'all'}`),
        api.get('/admin/teachers')
      ]);

      if (classesRes.data.success) {
        setClasses(classesRes.data.data);
      }
      if (teachersRes.data.success) {
        setTeachers(teachersRes.data.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toastService.error('Error loading classes');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClass = (newClass) => {
    setClasses([newClass, ...classes]);
    setIsModalOpen(false);
    toastService.success('Class created successfully!');
  };

  const handleDeleteClass = async (classId) => {
    if (window.confirm('Are you sure you want to delete this class? This action cannot be undone.')) {
      try {
        const response = await api.delete(`/classes/admin/classes/${classId}`);
        if (response.data.success) {
          setClasses(classes.filter(c => c.id !== classId));
          toastService.success('Class deleted successfully');
        }
      } catch (error) {
        toastService.error(error.response?.data?.message || 'Error deleting class');
      }
    }
  };

  const displayClasses = filter === 'active'
    ? classes.filter(c => c.is_active !== false)
    : classes;

  return (
    <div className="dashboard-container">
      <Navbar />
      <Sidebar />
      <div className="main-content">
        <div className="content-wrapper">
          <div className="page-container">
            <div className="page-header">
              <h1>📚 Manage Classes</h1>
              <button
                className="btn btn-primary"
                onClick={() => setIsModalOpen(true)}
              >
                + Create New Class
              </button>
            </div>

            <CreateClassModal
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              onSuccess={handleCreateClass}
              teachers={teachers}
            />

            <div className="filter-buttons" style={{ marginBottom: '20px' }}>
              <button
                className={`btn-small ${filter === 'active' ? 'active' : ''}`}
                onClick={() => {
                  setFilter('active');
                  fetchData();
                }}
              >
                Active Classes ({classes.filter(c => c.is_active !== false).length})
              </button>
              <button
                className={`btn-small ${filter === 'all' ? 'active' : ''}`}
                onClick={() => {
                  setFilter('all');
                  fetchData();
                }}
              >
                All Classes ({classes.length})
              </button>
            </div>

            <div className="card-container">
              <ClassList
                classes={displayClasses}
                loading={loading}
                type="view"
              />
            </div>

            {displayClasses.length > 0 && (
              <div style={{ marginTop: '30px', padding: '20px', background: '#f8f9fa', borderRadius: '8px' }}>
                <h3 style={{ color: '#0F3D3E', marginTop: 0 }}>Class Details</h3>
                <div style={{ overflowX: 'auto' }}>
                  <table className="admin-table" style={{ marginBottom: 0 }}>
                    <thead>
                      <tr>
                        <th>Title</th>
                        <th>Teacher</th>
                        <th>Date</th>
                        <th>Time</th>
                        <th>Students</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {displayClasses.map(cls => (
                        <tr key={cls.id}>
                          <td>
                            <strong>{cls.title}</strong>
                            {cls.description && <p className="text-muted">{cls.description}</p>}
                          </td>
                          <td>{cls.teacher_name}</td>
                          <td>{new Date(cls.date).toLocaleDateString()}</td>
                          <td>
                            <small>{cls.start_time} - {cls.end_time}</small>
                          </td>
                          <td>
                            <span className="badge badge-primary">{cls.enrolled_count || 0}</span>
                          </td>
                          <td>
                            <span className={`badge ${cls.is_active ? 'badge-success' : 'badge-info'}`}>
                              {cls.is_active !== false ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td>
                            <div className="action-buttons">
                              <button
                                className="btn-small btn-danger"
                                onClick={() => handleDeleteClass(cls.id)}
                                title="Delete class"
                              >
                                🗑️ Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <ToastContainer
        position="top-right"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </div>
  );
};

export default ManageClasses;
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
