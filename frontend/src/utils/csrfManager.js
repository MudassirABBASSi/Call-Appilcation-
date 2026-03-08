/**
 * CSRF Token Manager
 * Handles fetching, storing, and applying CSRF tokens for secure API requests
 * 
 * Usage in React:
 * - Call CsrfManager.init() in useEffect on app mount
 * - CsrfManager.getToken() returns current token
 * - Automatically applied to all API requests via CsrfManager.getHeaders()
 */

class CsrfManager {
  constructor() {
    this.token = null;
    this.isLoading = false;
    this.error = null;
  }

  /**
   * Initialize CSRF protection
   * Call this once when your React app mounts (in App.js or main component useEffect)
   * 
   * @returns {Promise<void>}
   */
  async init() {
    if (this.token || this.isLoading) {
      return; // Already initialized or initializing
    }

    this.isLoading = true;
    this.error = null;

    try {
      const response = await fetch('/api/csrf-token', {
        method: 'GET',
        credentials: 'include' // Important: Include cookies for CSRF token cookie
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch CSRF token: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.success && data.token) {
        this.token = data.token;
        console.log('✅ CSRF token initialized');
      } else {
        throw new Error('Invalid CSRF token response');
      }
    } catch (err) {
      this.error = err.message;
      console.error('❌ CSRF token initialization failed:', err);
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Get current CSRF token
   * @returns {string|null} The CSRF token or null if not initialized
   */
  getToken() {
    return this.token;
  }

  /**
   * Get headers object with CSRF token for state-changing requests
   * Use this for POST, PUT, DELETE, PATCH requests
   * 
   * @returns {Object} Headers object with x-csrf-token
   */
  getHeaders() {
    const headers = {
      'Content-Type': 'application/json'
    };

    if (this.token) {
      headers['x-csrf-token'] = this.token;
    }

    return headers;
  }

  /**
   * Check if CSRF is ready
   * @returns {boolean}
   */
  isReady() {
    return !!this.token && !this.isLoading;
  }

  /**
   * Get error message if initialization failed
   * @returns {string|null}
   */
  getError() {
    return this.error;
  }

  /**
   * Refresh CSRF token (call if token expires)
   * @returns {Promise<void>}
   */
  async refresh() {
    this.token = null;
    await this.init();
  }
}

// Create singleton instance
const csrfManager = new CsrfManager();

export default csrfManager;

/**
 * Example usage in React component:
 * 
 * import csrfManager from './utils/csrfManager';
 * 
 * useEffect(() => {
 *   csrfManager.init(); // Initialize on app mount
 * }, []);
 * 
 * // For API requests:
 * const handleSubmit = async (formData) => {
 *   try {
 *     const response = await fetch('/api/endpoint', {
 *       method: 'POST',
 *       credentials: 'include', // Important: Include cookies
 *       headers: csrfManager.getHeaders(), // Automatic CSRF header
 *       body: JSON.stringify(formData)
 *     });
 *     // Handle response
 *   } catch (error) {
 *     console.error('Request failed:', error);
 *   }
 * };
 */
