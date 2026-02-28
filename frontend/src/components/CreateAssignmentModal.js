import React, { useState, useEffect } from 'react';
import '../styles/assignment.css';

const CreateAssignmentModal = ({ isOpen, classId, classTitle, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        total_marks: '',
        deadline: ''
    });
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            const allowedTypes = ['application/pdf', 'application/msword', 
                                'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
            if (!allowedTypes.includes(selectedFile.type)) {
                setError('Only PDF, DOC, and DOCX files are allowed');
                return;
            }
            if (selectedFile.size > 10 * 1024 * 1024) {
                setError('File size must be less than 10MB');
                return;
            }
            setFile(selectedFile);
            setError('');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const token = localStorage.getItem('token');
            const formDataToSend = new FormData();
            formDataToSend.append('title', formData.title);
            formDataToSend.append('description', formData.description);
            formDataToSend.append('total_marks', formData.total_marks);
            formDataToSend.append('deadline', formData.deadline);
            formDataToSend.append('class_id', classId);
            if (file) {
                formDataToSend.append('file', file);
            }

            const res = await fetch('/api/teacher/assignments', {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
                body: formDataToSend
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.message || 'Error creating assignment');
                return;
            }

            onSuccess();
            onClose();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h2>Create Assignment - {classTitle}</h2>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>

                <form onSubmit={handleSubmit} className="assignment-form">
                    {error && <div className="error-message">{error}</div>}

                    <div className="form-group">
                        <label>Title *</label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            required
                            placeholder="Enter assignment title"
                        />
                    </div>

                    <div className="form-group">
                        <label>Description</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Enter assignment description"
                            rows="4"
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Total Marks *</label>
                            <input
                                type="number"
                                name="total_marks"
                                value={formData.total_marks}
                                onChange={handleChange}
                                required
                                min="1"
                                max="1000"
                                placeholder="e.g., 100"
                            />
                        </div>

                        <div className="form-group">
                            <label>Deadline *</label>
                            <input
                                type="datetime-local"
                                name="deadline"
                                value={formData.deadline}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Assignment File (PDF, DOC, DOCX)</label>
                        <input
                            type="file"
                            onChange={handleFileChange}
                            accept=".pdf,.doc,.docx"
                        />
                        {file && <p className="file-info">Selected: {file.name}</p>}
                    </div>


                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-gold" disabled={loading}>
                            {loading ? 'Creating...' : 'Create Assignment'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateAssignmentModal;
