/*
  File: src/config/api.js
  Purpose: Centralized API client configuration for Property Dealer App.
  It reads the base URL from environment variables and provides a consistent client for all services.
*/

// The base URL for the API is now configured in your .env file (VITE_API_BASE_URL).
// For mobile/Capacitor development, create a .env.local file and set:
// VITE_API_BASE_URL=http://YOUR_COMPUTER_IP:5000
// Note: The base URL should already include /api if needed
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://5001-firebase-property-dealer-app-1762795971496.cluster-va5f6x3wzzh4stde63ddr3qgge.cloudworkstations.dev/test1-50da1/us-central1/api';

// Enhanced API client with error handling
export const apiClient = {
  /**
   * Make HTTP request with proper headers and error handling.
   * @param {string} endpoint - API endpoint (e.g., '/auth/register', '/properties')
   * @param {object} options - Fetch options
   */
  async request(endpoint, options = {}) {
    // Construct URL - endpoint should start with / and not include /api
    const url = `${API_BASE_URL}${endpoint}`;
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...options.headers
      },
      ...options
    };
    
    // Add auth token if available
    try {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      console.warn('Could not access localStorage:', e);
    }
    
    try {
      console.log(`API Request: ${options.method || 'GET'} ${url}`);
      if (options.body) {
        console.log('Request body:', JSON.parse(options.body));
      }
      
      const response = await fetch(url, config);
      
      if (!response.ok) {
        let errorData = null;
        let errorMessage = `HTTP ${response.status}`;
        
        try {
          errorData = await response.json();
          console.error(`API Error ${response.status}:`, errorData);
          
          // Extract error message from various possible formats
          if (errorData.message) {
            errorMessage = errorData.message;
          } else if (errorData.errors && Array.isArray(errorData.errors)) {
            errorMessage = errorData.errors.map(e => e.msg || e.message).join(', ');
          } else if (errorData.error) {
            errorMessage = errorData.error;
          }
        } catch (e) {
          // If JSON parsing fails, try to get text
          try {
            const errorText = await response.text();
            errorMessage = errorText || errorMessage;
            console.error(`API Error ${response.status}:`, errorText);
          } catch (textError) {
            console.error(`API Error ${response.status}: Could not parse error response`);
          }
        }
        
        // Create error object with response for better error handling
        const error = new Error(errorMessage);
        error.response = {
          status: response.status,
          data: errorData
        };
        throw error;
      }
      
      // Handle responses with no content
      if (response.status === 204) {
        return null;
      }

      const data = await response.json();
      console.log(`API Response: ${options.method || 'GET'} ${url} - Success`);
      return data;
      
    } catch (error) {
      // If error doesn't have response property, it's a network error
      if (!error.response) {
        console.error('Network error:', {
          url,
          error: error.message,
          options
        });
      }
      throw error;
    }
  },
  
  /**
   * Make GET request
   * @param {string} endpoint - API endpoint
   * @param {object} params - Query parameters
   */
  get(endpoint, params = {}) {
    // Build query string from params
    const queryString = Object.keys(params)
      .filter(key => params[key] !== undefined && params[key] !== null && params[key] !== '')
      .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
      .join('&');
    
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    return this.request(url, { method: 'GET' });
  },
  
  /**
   * Make POST request
   * @param {string} endpoint - API endpoint
   * @param {object} data - Request body
   */
  post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },
  
  /**
   * Make PUT request
   * @param {string} endpoint - API endpoint
   * @param {object} data - Request body
   */
  put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT', 
      body: JSON.stringify(data)
    });
  },
  
  /**
   * Make DELETE request
   * @param {string} endpoint - API endpoint
   */
  delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }
};