import React, { useState } from 'react';
import { submissionsAPI } from '../api/api';
import { toast } from 'react-toastify';
import '../styles/modal.css';

const SubmissionForm = ({ assignmentId, onClose, onSubmissionSuccess }) => {
  const [formData, setFormData] = useState({
    assignment_id: assignmentId,
    file_url: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.file_url.trim()) {
      newErrors.file_url = 'File URL is required';
    } else if (!isValidUrl(formData.file_url)) {
      newErrors.file_url = 'Please enter a valid URL';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setLoading(true);
      await submissionsAPI.submitAssignment(formData);
      setFormData({
        assignment_id: assignmentId,
        file_url: ''
      });
      onSubmissionSuccess();
    } catch (error) {
      console.error('Error submitting assignment:', error);
      toast.error(error.response?.data?.message || 'Failed to submit assignment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Submit Assignment</h2>
          <button className="modal-close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="file_url">Submission File URL *</label>
            <input
              type="url"
              id="file_url"
              name="file_url"
              value={formData.file_url}
              onChange={handleChange}
              placeholder="https://example.com/your-submission.pdf"
              className={errors.file_url ? 'input-error' : ''}
            />
            {errors.file_url && (
              <span className="error-message">{errors.file_url}</span>
            )}
            <small>Enter the URL of your submission file (must be a valid URL)</small>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Submitting...' : 'Submit Assignment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SubmissionForm;
