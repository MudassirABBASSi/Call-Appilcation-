import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
      
      // Store token and user info
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

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={styles.loginButton}
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div style={styles.demoCredentials}>
          <h4>Demo Credentials:</h4>
          <p><strong>Admin:</strong> admin@alburhan.com / admin123</p>
          <p><strong>Teacher:</strong> Create via admin panel</p>
          <p><strong>Student:</strong> Create via admin panel</p>
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
  loginButton: {
    width: '100%',
    marginTop: '10px'
  },
  demoCredentials: {
    marginTop: '30px',
    padding: '15px',
    backgroundColor: colors.background,
    borderRadius: '8px',
    fontSize: '0.9rem'
  }
};

export default Login;
