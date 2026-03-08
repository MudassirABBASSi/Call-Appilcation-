import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CreateClassModal from '../../components/CreateClassModal';
import ClassList from '../../components/ClassList';
import { classesAPI } from '../../api/api';
import { colors } from '../../styles/colors';
import '../../styles/dashboard.css';

const ManageClasses = () => {
  const navigate = useNavigate();
  const [classes, setClasses] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingClass, setEditingClass] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      setIsLoading(true);
      const response = await classesAPI.getAllClasses();
      setClasses(response.data);
    } catch (error) {
      console.error('Error fetching classes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = (classToEdit = null) => {
    setEditingClass(classToEdit);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingClass(null);
  };

  const handleRefresh = () => {
    fetchClasses();
  };

  return (
          <div className="content-wrapper">
          <div className="page-header">
            <h1>Manage Classes</h1>
            <div className="page-header-actions">
              <button 
                onClick={() => navigate('/admin/manage-teachers')}
                className="btn btn-gold"
                style={{ backgroundColor: colors.gold, color: colors.darkBg }}
              >
                + Add Teacher
              </button>
              <button 
                onClick={() => navigate('/admin/manage-students')}
                className="btn btn-gold"
                style={{ backgroundColor: colors.gold, color: colors.darkBg }}
              >
                + Add Student
              </button>
              <button 
                onClick={() => handleOpenModal(null)}
                className="btn btn-gold"
                style={{ 
                  backgroundColor: colors.gold, 
                  color: colors.darkBg,
                  fontWeight: 'bold'
                }}
              >
                + Create New Class
              </button>
            </div>
          </div>

          {isLoading && (
            <div style={{
              textAlign: 'center',
              padding: '2rem',
              color: colors.emerald,
              fontSize: '1.1rem'
            }}>
              Loading classes...
            </div>
          )}

          {!isLoading && classes.length === 0 && (
            <div style={{
              textAlign: 'center',
              padding: '3rem 2rem',
              backgroundColor: colors.lightBg,
              borderRadius: '8px',
              color: colors.darkText,
              fontSize: '1.1rem'
            }}>
              <p>No classes found. Create one to get started!</p>
            </div>
          )}

          {!isLoading && classes.length > 0 && (
            <div className="table-container">
              <h2>All Classes ({classes.length})</h2>
              <ClassList 
                classes={classes}
                isAdmin={true}
                onEdit={(classItem) => handleOpenModal(classItem)}
                onDelete={fetchClasses}
                onRefresh={handleRefresh}
              />
            </div>
          )}

          <CreateClassModal 
            isOpen={showModal}
            onClose={handleCloseModal}
            editingClass={editingClass}
            onClassCreated={fetchClasses}
          />
        </div>
  );
};

export default ManageClasses;
