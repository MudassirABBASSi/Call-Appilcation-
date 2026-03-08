import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { authAPI } from '../api/api';
import { colors } from '../styles/colors';
import '../styles/dashboard.css';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  // Verify token on component mount
  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setMessage({ 
          type: 'error', 
          text: 'Invalid reset link. Please request a new password reset.' 
        });
        setVerifying(false);
        return;
      }

      try {
        const response = await authAPI.verifyResetToken(token);
        
        if (response.data.valid) {
          setTokenValid(true);
        } else {
          setMessage({ 
            type: 'error', 
            text: 'This reset link has expired or is invalid. Please request a new password reset.' 
          });
        }
      } catch (error) {
        setMessage({ 
          type: 'error', 
          text: error.response?.data?.message || 'Invalid or expired reset link.' 
        });
      } finally {
        setVerifying(false);
      }
    };

    verifyToken();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      const errorMsg = 'Passwords do not match';
      setMessage({ 
        type: 'error', 
        text: errorMsg
      });
      toast.error(errorMsg);
      setLoading(false);
      return;
    }

    // Validate password length
    if (formData.password.length < 6) {
      const errorMsg = 'Password must be at least 6 characters long';
      setMessage({ 
        type: 'error', 
        text: errorMsg
      });
      toast.error(errorMsg);
      setLoading(false);
      return;
    }

    try {
      const response = await authAPI.resetPassword(token, {
        password: formData.password,
        confirmPassword: formData.confirmPassword
      });
      
      setMessage({ 
        type: 'success', 
        text: response.data.message 
      });
      toast.success(response.data.message);
      setResetSuccess(true);
      setLoading(false);

      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to reset password. Please try again.';
      setMessage({ 
        type: 'error', 
        text: errorMsg
      });
      toast.error(errorMsg);
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Show loading while verifying token
  if (verifying) {
    return (
      <div className="login-container">
        <div className="login-box">
          <div className="logo">
            <h1>Alburhan Classroom</h1>
            <p style={styles.tagline}>Virtual Learning Platform</p>
          </div>
          <div style={styles.loadingContainer}>
            <div style={styles.spinner}></div>
            <p>Verifying reset link...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show error if token is invalid
  if (!tokenValid && !verifying) {
    return (
      <div className="login-container">
        <div className="login-box">
          <div className="logo">
            <h1>Alburhan Classroom</h1>
            <p style={styles.tagline}>Virtual Learning Platform</p>
          </div>

          <h2>🔐 Reset Password</h2>

          <div className="alert alert-error">
            {message.text}
          </div>

          <div style={styles.links}>
            <Link to="/forgot-password" style={styles.link}>
              Request New Reset Link
            </Link>
            <span style={{ margin: '0 10px', color: '#ccc' }}>•</span>
            <Link to="/login" style={styles.link}>
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Show success message after password reset
  if (resetSuccess) {
    return (
      <div className="login-container">
        <div className="login-box">
          <div className="logo">
            <h1>Alburhan Classroom</h1>
            <p style={styles.tagline}>Virtual Learning Platform</p>
          </div>

          <div style={styles.successContainer}>
            <div style={styles.successIcon}>✅</div>
            
            <h2>Password Reset Successful!</h2>

            <div className="alert alert-success">
              {message.text}
            </div>

            <p style={styles.redirectNote}>
              Redirecting you to login page...
            </p>

            <Link to="/login" className="btn btn-primary" style={styles.loginButton}>
              Go to Login Now
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Show password reset form
  return (
    <div className="login-container">
      <div className="login-box">
        <div className="logo">
          <h1>Alburhan Classroom</h1>
          <p style={styles.tagline}>Virtual Learning Platform</p>
        </div>

        <h2>🔐 Reset Password</h2>
        
        <p style={styles.description}>
          Enter your new password below.
        </p>

        {message.text && (
          <div className={`alert alert-${message.type}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>New Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter new password"
              required
              minLength="6"
              autoFocus
            />
            <small style={styles.helpText}>Minimum 6 characters</small>
          </div>

          <div className="form-group">
            <label>Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm new password"
              required
              minLength="6"
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={styles.submitButton}
            disabled={loading}
          >
            {loading ? 'Resetting Password...' : 'Reset Password'}
          </button>
        </form>

        <div style={styles.links}>
          <Link to="/login" style={styles.link}>
            ← Back to Login
          </Link>
        </div>
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
  loadingContainer: {
    textAlign: 'center',
    padding: '40px 20px'
  },
  spinner: {
    border: '4px solid #f3f3f3',
    borderTop: '4px solid ' + colors.primary,
    borderRadius: '50%',
    width: '40px',
    height: '40px',
    animation: 'spin 1s linear infinite',
    margin: '0 auto 20px'
  },
  successContainer: {
    textAlign: 'center',
    padding: '20px 0'
  },
  successIcon: {
    fontSize: '3rem',
    marginBottom: '20px'
  },
  redirectNote: {
    color: '#666',
    margin: '20px 0',
    fontSize: '0.9rem'
  },
  loginButton: {
    marginTop: '10px'
  },
  helpText: {
    color: '#666',
    fontSize: '0.85rem',
    marginTop: '5px',
    display: 'block'
  }
};

export default ResetPassword;
