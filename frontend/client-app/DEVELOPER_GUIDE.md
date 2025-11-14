# Developer Guide

This guide provides instructions for setting up and developing the frontend application.

## Environment Variables

The application uses `.env` files to manage environment-specific variables, such as the backend API URL.

Create a `.env.development` file in the root of the `client-app` directory for your local development setup. You can create other `.env` files for different environments (e.g., `.env.production`).

### VITE_API_BASE_URL

This is the most important variable. It defines the base URL of the backend API.

-   **For Web Development:**
    ```
    VITE_API_BASE_URL="http://localhost:5000"
    ```

-   **For Mobile (Capacitor) Development:**
    To connect to your local backend from a mobile device or emulator, you must use your computer's local network IP address. Create a `.env.local` file (which is ignored by git) and add the following:
    ```
    VITE_API_BASE_URL="http://YOUR_COMPUTER_IP:5000"
    ```
    Replace `YOUR_COMPUTER_IP` with your actual IP address.

## API Services

To ensure consistency and maintainability, all HTTP requests to the backend API **must** be made through the centralized `apiClient`.

-   **Location:** `src/config/api.js`
-   **Usage:** Import the `apiClient` in your service file and use its methods (`.get()`, `.post()`, `.put()`, `.delete()`).

### Example:

```javascript
// src/services/myNewService.js
import { apiClient } from '../config/api';

const getSomeData = () => {
  // The apiClient will automatically prepend the base URL and '/api'
  return apiClient.get('/my-endpoint'); 
};

export default {
  getSomeData,
};
```

Do not use `fetch` directly or create separate API wrappers in your components or services.
