import React, { useState, useEffect } from 'react';
import { classesAPI, adminAPI } from '../api/api';
import { toast } from 'react-toastify';
import { colors } from '../styles/colors';

const CreateClassModal = ({ isOpen, onClose, onClassCreated, editingClass = null }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    teacher_id: '',
    start_time: '',
    end_time: '',
    days: [] // New field for day selection
  });

  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isEditMode] = useState(!!editingClass);

  useEffect(() => {
    if (isOpen) {
      fetchTeachers();
      fetchStudents();
      if (editingClass) {
        setFormData({
          title: editingClass.title,
          description: editingClass.description,
          teacher_id: editingClass.teacher_id,
          start_time: formatDateTimeLocal(editingClass.start_time),
          end_time: formatDateTimeLocal(editingClass.end_time),
          days: editingClass.days || []
        });
      } else {
        setFormData({
          title: '',
          description: '',
          teacher_id: '',
          start_time: '',
          end_time: '',
          days: []
        });
        setSelectedStudents([]);
      }
      setError('');
    }
  }, [isOpen, editingClass]);

  const fetchTeachers = async () => {
    try {
      const response = await adminAPI.getTeachers();
      setTeachers(response.data || []);
    } catch (err) {
      console.error('Error fetching teachers:', err);
      toast.error('Failed to load teachers');
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await adminAPI.getStudents();
      setStudents(response.data || []);
    } catch (err) {
      console.error('Error fetching students:', err);
      toast.error('Failed to load students');
    }
  };

  const handleStudentToggle = (studentId) => {
    setSelectedStudents(prev => {
      if (prev.includes(studentId)) {
        return prev.filter(id => id !== studentId);
      } else {
        return [...prev, studentId];
      }
    });
  };

  const handleSelectAllStudents = () => {
    if (selectedStudents.length === getFilteredStudents().length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(getFilteredStudents().map(s => s.id));
    }
  };

  const getFilteredStudents = () => {
    if (!formData.teacher_id) return students;
    return students.filter(s => s.teacher_id === parseInt(formData.teacher_id));
  };

  const handleDayToggle = (day) => {
    setFormData(prev => {
      const days = prev.days || [];
      if (days.includes(day)) {
        return {
          ...prev,
          days: days.filter(d => d !== day)
        };
      } else {
        return {
          ...prev,
          days: [...days, day]
        };
      }
    });
  };

  const formatDateTimeLocal = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().slice(0, 16); // Format for datetime-local input
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      setError('Class title is required');
      return false;
    }

    if (!formData.teacher_id) {
      setError('Please select a teacher');
      return false;
    }

    if (!formData.start_time) {
      setError('Start time is required');
      return false;
    }

    if (!formData.end_time) {
      setError('End time is required');
      return false;
    }

    if (!formData.days || formData.days.length === 0) {
      setError('Please select at least one day for the class');
      return false;
    }

    const startDateTime = new Date(formData.start_time);
    const endDateTime = new Date(formData.end_time);
    const now = new Date();

    if (!isEditMode && startDateTime <= now) {
      setError('Start time must be in the future');
      return false;
    }

    if (endDateTime <= startDateTime) {
      setError('End time must be after start time');
      return false;
    }

    const durationHours = (endDateTime - startDateTime) / (1000 * 60 * 60);
    if (durationHours > 4) {
      setError('Class duration cannot exceed 4 hours');
      return false;
    }

    if (durationHours < 0.5) {
      setError('Class duration must be at least 30 minutes');
      return false;
    }

    return true;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const classData = { ...formData, student_ids: selectedStudents };
      
      if (isEditMode) {
        await classesAPI.updateClass(editingClass.id, classData);
        toast.success('Class updated successfully!');
      } else {
        await classesAPI.createClass(classData);
        toast.success(`Class created successfully! ${selectedStudents.length} students enrolled.`);
      }

      if (onClassCreated) {
        onClassCreated();
      }

      setFormData({
        title: '',
        description: '',
        teacher_id: '',
        start_time: '',
        end_time: ''
      });
      setSelectedStudents([]);

      onClose();
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to save class';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={styles.modalOverlay} onClick={onClose}>
      <div style={styles.modal} onClick={e => e.stopPropagation()}>
        <div style={styles.modalHeader}>
          <h2>{isEditMode ? 'Edit Class' : 'Create New Class'}</h2>
          <button onClick={onClose} style={styles.closeBtn}>×</button>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          {error && <div style={styles.errorAlert}>{error}</div>}

          <div style={styles.formGroup}>
            <label>Class Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., Advanced JavaScript"
              style={styles.input}
              maxLength={200}
            />
            <small>{formData.title.length}/200</small>
          </div>

          <div style={styles.formGroup}>
            <label>Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter class description"
              style={{ ...styles.input, minHeight: '100px', resize: 'vertical' }}
              maxLength={500}
            />
            <small>{formData.description.length}/500</small>
          </div>

          <div style={styles.formGroup}>
            <label>Teacher *</label>
            <select
              name="teacher_id"
              value={formData.teacher_id}
              onChange={handleChange}
              style={styles.input}
            >
              <option value="">Select a teacher</option>
              {teachers.map(teacher => (
                <option key={teacher.id} value={teacher.id}>
                  {teacher.name} ({teacher.email})
                </option>
              ))}
            </select>
          </div>

          <div style={styles.formGroup}>
            <label>
              Select Students {formData.teacher_id && `(Assigned to selected teacher)`}
              {!isEditMode && <span style={{ fontSize: '0.9rem', fontWeight: 'normal', marginLeft: '10px', color: '#666' }}>
                {selectedStudents.length} selected
              </span>}
            </label>
            {!formData.teacher_id && (
              <p style={{ fontSize: '0.9rem', color: '#999', marginBottom: '10px' }}>
                Select a teacher first to see their assigned students
              </p>
            )}
            {formData.teacher_id && (
              <>
                <div style={{ marginBottom: '10px' }}>
                  <button
                    type="button"
                    onClick={handleSelectAllStudents}
                    style={{ ...styles.button, ...styles.buttonSecondary, padding: '8px 15px', fontSize: '0.9rem' }}
                  >
                    {selectedStudents.length === getFilteredStudents().length ? 'Deselect All' : 'Select All'}
                  </button>
                </div>
                <div style={styles.studentList}>
                  {getFilteredStudents().length === 0 ? (
                    <p style={{ textAlign: 'center', color: '#999', padding: '20px' }}>
                      No students assigned to this teacher
                    </p>
                  ) : (
                    getFilteredStudents().map(student => (
                      <label key={student.id} style={styles.studentItem}>
                        <input
                          type="checkbox"
                          checked={selectedStudents.includes(student.id)}
                          onChange={() => handleStudentToggle(student.id)}
                          style={{ marginRight: '10px' }}
                        />
                        <span>{student.name}</span>
                      </label>
                    ))
                  )}
                </div>
              </>
            )}
          </div>

          <div style={styles.formGroup}>
            <label>Class Schedule - Select Days *</label>
            <div style={styles.daysContainer}>
              {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                <label key={day} style={styles.dayCheckbox}>
                  <input
                    type="checkbox"
                    checked={(formData.days || []).includes(day)}
                    onChange={() => handleDayToggle(day)}
                    style={{ marginRight: '8px' }}
                  />
                  {day}
                </label>
              ))}
            </div>
            {!formData.days || formData.days.length === 0 && (
              <small style={{ color: '#d32f2f' }}>Please select at least one day</small>
            )}
            {formData.days && formData.days.length > 0 && (
              <small style={{ color: '#4caf50' }}>Selected: {formData.days.join(', ')}</small>
            )}
          </div>

          <div style={styles.rowContainer}>
            <div style={{ ...styles.formGroup, flex: 1 }}>
              <label>Start Time *</label>
              <input
                type="datetime-local"
                name="start_time"
                value={formData.start_time}
                onChange={handleChange}
                style={styles.input}
              />
            </div>

            <div style={{ ...styles.formGroup, flex: 1 }}>
              <label>End Time *</label>
              <input
                type="datetime-local"
                name="end_time"
                value={formData.end_time}
                onChange={handleChange}
                style={styles.input}
              />
            </div>
          </div>

          <div style={styles.buttonContainer}>
            <button
              type="button"
              onClick={onClose}
              style={{ ...styles.button, ...styles.buttonSecondary }}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{ ...styles.button, ...styles.buttonPrimary }}
              disabled={loading}
            >
              {loading ? 'Saving...' : (isEditMode ? 'Update Class' : 'Create Class')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const styles = {
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000
  },
  modal: {
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '30px',
    maxWidth: '600px',
    width: '90%',
    maxHeight: '90vh',
    overflowY: 'auto',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)'
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    borderBottom: `2px solid ${colors.lightBg}`,
    paddingBottom: '15px'
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    fontSize: '24px',
    cursor: 'pointer',
    color: '#999'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px'
  },
  input: {
    padding: '10px',
    border: `1px solid #ddd`,
    borderRadius: '6px',
    fontSize: '14px',
    fontFamily: 'inherit',
    transition: 'border-color 0.3s'
  },
  rowContainer: {
    display: 'flex',
    gap: '15px'
  },
  errorAlert: {
    backgroundColor: '#fee',
    borderLeft: `4px solid #f44`,
    color: '#c00',
    padding: '12px',
    borderRadius: '4px',
    fontSize: '14px'
  },
  buttonContainer: {
    display: 'flex',
    gap: '10px',
    justifyContent: 'flex-end',
    marginTop: '20px'
  },
  button: {
    padding: '10px 20px',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 'bold',
    transition: 'all 0.3s'
  },
  buttonPrimary: {
    backgroundColor: colors.gold,
    color: colors.emerald
  },
  buttonSecondary: {
    backgroundColor: '#f0f0f0',
    color: '#333'
  },
  studentList: {
    border: '1px solid #ddd',
    borderRadius: '6px',
    maxHeight: '300px',
    overflowY: 'auto',
    padding: '10px',
    backgroundColor: '#f9f9f9'
  },
  studentItem: {
    display: 'flex',
    alignItems: 'center',
    padding: '10px',
    cursor: 'pointer',
    borderRadius: '4px',
    transition: 'background-color 0.2s',
    marginBottom: '5px',
    backgroundColor: 'white'
  },
  daysContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '12px',
    padding: '12px',
    backgroundColor: '#f9f9f9',
    borderRadius: '6px',
    border: `1px solid #ddd`
  },
  dayCheckbox: {
    display: 'flex',
    alignItems: 'center',
    padding: '8px 10px',
    cursor: 'pointer',
    borderRadius: '4px',
    transition: 'background-color 0.2s',
    backgroundColor: 'white'
  }
};

export default CreateClassModal;
