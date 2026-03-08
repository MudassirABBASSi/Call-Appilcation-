import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { authAPI } from '../api/api';
import { colors } from '../styles/colors';
import '../styles/dashboard.css';

const VerifyOTP = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds
  const [isExpired, setIsExpired] = useState(false);

  // Get email from location state or localStorage
  useEffect(() => {
    const pendingEmail = location.state?.email || localStorage.getItem('pendingOTPEmail');
    if (!pendingEmail) {
      // No pending OTP verification, redirect to login
      navigate('/login');
      return;
    }
    setEmail(pendingEmail);
  }, [location.state, navigate]);

  // Countdown timer
  useEffect(() => {
    if (!email) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsExpired(true);
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [email]);

  const formatTimeLeft = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!otp) {
      toast.error('Please enter the OTP');
      return;
    }

    if (otp.length !== 6 || !/^\d+$/.test(otp)) {
      toast.error('OTP must be 6 digits');
      return;
    }

    setLoading(true);

    try {
      const response = await authAPI.verifyOtp({
        email,
        otp
      });

      // Store JWT token
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));

      // Clear pending OTP email from storage
      localStorage.removeItem('pendingOTPEmail');

      toast.success('OTP verified successfully!');

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
      }, 500);
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'OTP verification failed';
      
      // Handle account locked scenario
      if (error.response?.data?.isLocked) {
        toast.error(`${errorMessage} Please try again later.`);
      } else {
        toast.error(errorMessage);
      }

      // Clear OTP on error for user to retry
      setOtp('');
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (loading) return;

    setLoading(true);
    try {
      // Re-login to get new OTP
      const storedEmail = localStorage.getItem('pendingOTPEmail') || email;
      toast.info('Please log in again to receive a new OTP');
      localStorage.removeItem('pendingOTPEmail');
      navigate('/login');
    } catch (error) {
      toast.error('Failed to resend OTP');
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    localStorage.removeItem('pendingOTPEmail');
    navigate('/login');
  };

  if (!email) {
    return null; // Redirect in effect
  }

  return (
    <div className="login-container">
      <div className="login-box" style={styles.otpBox}>
        <div className="logo">
          <h1>Alburhan Classroom</h1>
          <p style={styles.tagline}>Two-Factor Authentication</p>
        </div>

        <h2>Verify Your Identity</h2>
        <p style={styles.description}>
          We've sent a 6-digit code to <strong>{email}</strong>
        </p>

        {isExpired && (
          <div style={styles.expiredAlert}>
            <strong>⏰ OTP Expired!</strong> The verification code has expired. Please log in again to request a new one.
          </div>
        )}

        {!isExpired && timeLeft < 60 && (
          <div style={styles.warningAlert}>
            <strong>⚠️ Time Running Out!</strong> OTP expires in {formatTimeLeft(timeLeft)}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email (Read-only)</label>
            <input
              type="email"
              value={email}
              readOnly
              style={styles.readOnlyInput}
            />
          </div>

          <div className="form-group">
            <label>Enter OTP Code</label>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="000000"
              maxLength="6"
              disabled={isExpired || loading}
              style={styles.otpInput}
              autoFocus
            />
            <small style={styles.otpHelper}>
              Enter the 6-digit code from your email. Expires in {formatTimeLeft(timeLeft)}
            </small>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={styles.verifyButton}
            disabled={loading || isExpired || !otp}
          >
            {loading ? 'Verifying...' : 'Verify OTP'}
          </button>
        </form>

        <div style={styles.actionButtons}>
          <button
            onClick={handleResendOTP}
            style={styles.secondaryButton}
            disabled={loading || isExpired}
          >
            Resend Code
          </button>
          <button
            onClick={handleBackToLogin}
            style={styles.backButton}
            disabled={loading}
          >
            Back to Login
          </button>
        </div>

        <div style={styles.helpText}>
          <p>
            <strong>Didn't receive the code?</strong> Check your spam folder or click "Resend Code"
          </p>
          <p>
            Never share your OTP with anyone. We'll never ask for it via email or support.
          </p>
        </div>
      </div>
    </div>
  );
};

const styles = {
  otpBox: {
    maxWidth: '450px'
  },
  tagline: {
    color: colors.primary,
    marginTop: '5px'
  },
  description: {
    textAlign: 'center',
    marginBottom: '20px',
    color: '#666',
    fontSize: '0.95rem'
  },
  readOnlyInput: {
    backgroundColor: '#f5f5f5',
    cursor: 'not-allowed',
    color: '#666'
  },
  otpInput: {
    fontSize: '28px',
    letterSpacing: '10px',
    textAlign: 'center',
    fontFamily: 'monospace',
    fontWeight: 'bold',
    width: '100%'
  },
  otpHelper: {
    display: 'block',
    marginTop: '8px',
    fontSize: '0.85rem',
    color: '#666'
  },
  verifyButton: {
    width: '100%',
    marginTop: '20px'
  },
  expiredAlert: {
    backgroundColor: '#fee',
    border: '1px solid #fcc',
    color: '#c33',
    padding: '12px',
    borderRadius: '6px',
    marginBottom: '15px',
    fontSize: '0.9rem'
  },
  warningAlert: {
    backgroundColor: '#fef3c7',
    border: '1px solid #fcd34d',
    color: '#d97706',
    padding: '12px',
    borderRadius: '6px',
    marginBottom: '15px',
    fontSize: '0.9rem'
  },
  actionButtons: {
    display: 'flex',
    gap: '10px',
    marginTop: '20px'
  },
  secondaryButton: {
    flex: 1,
    padding: '10px',
    backgroundColor: '#f0f0f0',
    border: '1px solid #ccc',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: '500',
    color: '#333',
    transition: 'all 0.3s ease'
  },
  backButton: {
    flex: 1,
    padding: '10px',
    backgroundColor: 'transparent',
    border: '1px solid #ccc',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: '500',
    color: '#666',
    transition: 'all 0.3s ease'
  },
  helpText: {
    marginTop: '25px',
    padding: '15px',
    backgroundColor: '#f9f9f9',
    borderRadius: '6px',
    fontSize: '0.85rem',
    color: '#666',
    borderLeft: `4px solid ${colors.primary}`
  }
};

export default VerifyOTP;
