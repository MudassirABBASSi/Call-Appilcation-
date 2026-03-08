import { useEffect } from 'react';
import { csrfAPI } from '../api/api';

/**
 * useCsrf Hook
 * Initialize CSRF token on component mount
 * Use this in your main App component or layout component
 * 
 * @returns {Object} { isReady: boolean, error: string|null }
 */
export const useCsrf = () => {
  useEffect(() => {
    const initializeCsrfToken = async () => {
      try {
        // Check if token already exists and is recent (less than 55 minutes old)
        const existingToken = localStorage.getItem('csrf-token');
        const tokenTimestamp = localStorage.getItem('csrf-token-timestamp');
        const now = Date.now();
        const maxAge = 55 * 60 * 1000; // 55 minutes (token expires in 1 hour)

        if (
          existingToken &&
          tokenTimestamp &&
          now - parseInt(tokenTimestamp) < maxAge
        ) {
          console.log('✅ Using existing CSRF token');
          return; // Use existing token
        }

        // Fetch new CSRF token
        const response = await csrfAPI.getToken();

        if (response.data.success && response.data.token) {
          localStorage.setItem('csrf-token', response.data.token);
          localStorage.setItem('csrf-token-timestamp', Date.now().toString());
          console.log('✅ CSRF token initialized successfully');
        } else {
          throw new Error('Failed to get CSRF token');
        }
      } catch (error) {
        console.error('❌ CSRF token initialization failed:', error);
        // Don't break the app, just warn the user
        // CSRF protection will be handled by server-side validation
      }
    };

    initializeCsrfToken();

    // Optional: Refresh CSRF token every 50 minutes
    const refreshInterval = setInterval(() => {
      initializeCsrfToken();
    }, 50 * 60 * 1000);

    return () => clearInterval(refreshInterval);
  }, []);

  return {
    isReady: !!localStorage.getItem('csrf-token'),
    token: localStorage.getItem('csrf-token')
  };
};

export default useCsrf;

/**
 * Usage in App.js:
 * 
 * import useCsrf from './hooks/useCsrf';
 * 
 * function App() {
 *   const { isReady, token } = useCsrf();
 *   
 *   return (
 *     <div>
 *       {!isReady && <p>Initializing security...</p>}
 *       [Your app routes go here]
 *     </div>
 *   );
 * }
 */
