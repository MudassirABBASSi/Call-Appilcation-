// API Configuration for Production Deployment
// This file centralizes API endpoint configuration

const API_BASE_URL = 
  process.env.REACT_APP_API_URL || 
  (process.env.NODE_ENV === 'production' 
    ? 'https://app.alburhanacademy.com/api'
    : 'http://localhost:5000/api');

const API_CONFIG = {
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for CSRF and session cookies
};

// Health check endpoint
export const healthCheck = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    return await response.json();
  } catch (error) {
    console.error('Health check failed:', error);
    return { status: 'error', message: error.message };
  }
};

export { API_BASE_URL };
export default API_CONFIG;
