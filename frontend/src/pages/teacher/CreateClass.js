import React, { useState } from 'react';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import { teacherAPI } from '../../api/api';
import { colors } from '../../styles/colors';
import { useNavigate } from 'react-router-dom';
import '../../styles/dashboard.css';

const CreateClass = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: ''
  });
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await teacherAPI.createClass(formData);
      setMessage({ 
        type: 'success', 
        text: `Class created successfully! Room ID: ${response.data.roomId}` 
      });
      setFormData({ title: '', description: '', date: '' });
      
      setTimeout(() => {
        navigate('/teacher/my-classes');
      }, 2000);
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Error creating class' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="dashboard-container">
      <Navbar />
      <Sidebar />
      <div className="main-content">
        <div className="content-wrapper">
          <h1 style={styles.pageTitle}>Create New Class</h1>

          {message.text && (
            <div className={`alert alert-${message.type}`}>
              {message.text}
            </div>
          )}

          <div className="form-container">
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Class Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Enter class title"
                  required
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Enter class description"
                  rows="4"
                />
              </div>

              <div className="form-group">
                <label>Date & Time *</label>
                <input
                  type="datetime-local"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                />
              </div>

              <div style={styles.buttonGroup}>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? 'Creating...' : 'Create Class'}
                </button>
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => navigate('/teacher')}
                >
                  Cancel
                </button>
              </div>
            </form>

            <div style={styles.infoBox}>
              <h3>ℹ️ Information</h3>
              <p>• A unique Room ID will be automatically generated for this class</p>
              <p>• Students will be able to join the class at the scheduled time</p>
              <p>• You can start the class by clicking "Start Class" button</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  pageTitle: {
    color: colors.primary,
    marginBottom: '30px'
  },
  buttonGroup: {
    display: 'flex',
    gap: '10px',
    marginTop: '20px'
  },
  infoBox: {
    backgroundColor: colors.background,
    padding: '20px',
    borderRadius: '8px',
    marginTop: '30px',
    borderLeft: `4px solid ${colors.secondary}`
  }
};

export default CreateClass;
