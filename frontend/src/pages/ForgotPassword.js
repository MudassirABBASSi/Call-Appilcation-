import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { authAPI } from '../api/api';
import { colors } from '../styles/colors';
import '../styles/dashboard.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await authAPI.forgotPassword({ email });
      
      setMessage({ 
        type: 'success', 
        text: response.data.message 
      });
      toast.success(response.data.message);
      setEmailSent(true);
      setLoading(false);
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to process request. Please try again.';
      setMessage({ 
        type: 'error', 
        text: errorMsg
      });
      toast.error(errorMsg);
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="logo">
          <h1>Alburhan Classroom</h1>
          <p style={styles.tagline}>Virtual Learning Platform</p>
        </div>

        <h2>🔐 Forgot Password</h2>
        
        {!emailSent ? (
          <>
            <p style={styles.description}>
              Enter your email address and we'll send you a link to reset your password.
            </p>

            {message.text && (
              <div className={`alert alert-${message.type}`}>
                {message.text}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  autoFocus
                />
              </div>

              <button 
                type="submit" 
                className="btn btn-primary" 
                style={styles.submitButton}
                disabled={loading}
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>

            <div style={styles.links}>
              <Link to="/login" style={styles.link}>
                ← Back to Login
              </Link>
            </div>
          </>
        ) : (
          <div style={styles.successContainer}>
            <div style={styles.successIcon}>✉️</div>
            
            <div className="alert alert-success">
              {message.text}
            </div>

            <div style={styles.successInfo}>
              <p>Please check your email inbox (and spam folder) for the password reset link.</p>
              <p style={styles.expiryNote}>
                <strong>Note:</strong> The reset link will expire in 1 hour.
              </p>
            </div>

            <button 
              onClick={() => setEmailSent(false)}
              style={styles.resendButton}
              className="btn btn-secondary"
            >
              Send Another Link
            </button>

            <div style={styles.links}>
              <Link to="/login" style={styles.link}>
                ← Back to Login
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  tagline: {
    color: colors.primary,
    marginTop: '5px'
  },
  description: {
    color: '#666',
    marginBottom: '20px',
    fontSize: '0.95rem',
    lineHeight: '1.5'
  },
  submitButton: {
    width: '100%',
    marginTop: '10px'
  },
  links: {
    marginTop: '20px',
    textAlign: 'center'
  },
  link: {
    color: colors.primary,
    textDecoration: 'none',
    fontSize: '0.9rem',
    fontWeight: '500'
  },
  successContainer: {
    textAlign: 'center'
  },
  successIcon: {
    fontSize: '3rem',
    marginBottom: '20px'
  },
  successInfo: {
    marginTop: '20px',
    marginBottom: '20px',
    color: '#666',
    fontSize: '0.9rem',
    lineHeight: '1.6'
  },
  expiryNote: {
    marginTop: '15px',
    padding: '10px',
    backgroundColor: '#fff3cd',
    borderRadius: '5px',
    borderLeft: '4px solid #ffc107'
  },
  resendButton: {
    marginTop: '15px',
    marginBottom: '15px'
  }
};

export default ForgotPassword;
