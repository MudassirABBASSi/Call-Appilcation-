import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../api/api';
import { colors } from '../styles/colors';
import '../styles/dashboard.css';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await authAPI.login(formData);
      
      // Check if 2FA OTP is required
      if (response.data.requireOTP) {
        // Store email for OTP verification page
        localStorage.setItem('pendingOTPEmail', formData.email);
        setMessage({ type: 'success', text: 'OTP sent to your email. Redirecting to verification...' });
        
        // Redirect to OTP verification page
        setTimeout(() => {
          navigate('/verify-otp', { state: { email: formData.email } });
        }, 500);
      } else {
        // No 2FA, proceed with normal login
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));

        setMessage({ type: 'success', text: 'Login successful! Redirecting...' });

        // Redirect based on role
        setTimeout(() => {
          const role = response.data.user.role;
          if (role === 'admin') {
            navigate('/admin');
          } else if (role === 'teacher') {
            navigate('/teacher');
          } else if (role === 'student') {
            navigate('/student');
          }
        }, 1000);
      }
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Login failed. Please try again.' 
      });
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
    <div className="login-container">
      <div className="login-box">
        <div className="logo">
          <h1>Alburhan Classroom</h1>
          <p style={styles.tagline}>Virtual Learning Platform</p>
        </div>

        <h2>Login</h2>

        {message.text && (
          <div className={`alert alert-${message.type}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
            />
          </div>

          <div style={styles.forgotPasswordContainer}>
            <Link to="/forgot-password" style={styles.forgotPasswordLink}>
              Forgot Password?
            </Link>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={styles.loginButton}
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
};

const styles = {
  tagline: {
    color: colors.primary,
    marginTop: '5px'
  },
  forgotPasswordContainer: {
    textAlign: 'right',
    marginTop: '10px',
    marginBottom: '5px'
  },
  forgotPasswordLink: {
    color: colors.primary,
    textDecoration: 'none',
    fontSize: '0.9rem',
    fontWeight: '500'
  },
  loginButton: {
    width: '100%',
    marginTop: '10px'
  }
};

export default Login;
