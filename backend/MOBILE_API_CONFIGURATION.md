# Mobile API Configuration Guide

## Overview
This guide explains how to configure the Aura Shop backend API to work with Android/iOS Capacitor apps and provides the necessary frontend configuration.

## Backend Changes Made

### 1. Enhanced CORS Configuration
The server now supports:
- **Web Development**: `http://localhost:5173`, `http://127.0.0.1:5173`
- **Capacitor Apps**: `https://localhost`, `capacitor://localhost`, `ionic://localhost`
- **Dynamic Ports**: Regex patterns for any localhost port
- **Additional Headers**: Required headers for mobile app compatibility

### 2. Mobile-Specific Features
- Preflight request handling for complex CORS scenarios
- Request logging for debugging mobile connections
- Additional API endpoints (`/api/info`) for connection testing
- Enhanced health check endpoint

## Frontend Configuration

### 1. Create API Configuration File
Create `src/config/api.js` in your frontend:

```js
// src/config/api.js
const isDevelopment = import.meta.env.DEV
const isCapacitor = window.Capacitor?.isNativePlatform?.()

// API Base URL Configuration
const getApiBaseUrl = () => {
  if (isCapacitor) {
    // For Capacitor apps, use your computer's IP address
    // Replace 'YOUR_IP_ADDRESS' with your actual IP
    return 'http://YOUR_IP_ADDRESS:5000/api'
  }
  
  if (isDevelopment) {
    // For web development
    return 'http://localhost:5000/api'
  }
  
  // For production
  return 'https://your-production-api.com/api'
}

export const API_BASE_URL = getApiBaseUrl()

// API instance with proper headers
export const apiClient = {
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...options.headers
      },
      ...options
    }
    
    // Add auth token if available
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    try {
      const response = await fetch(url, config)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      return await response.json()
    } catch (error) {
      console.error('API request failed:', error)
      throw error
    }
  },
  
  get(endpoint) {
    return this.request(endpoint, { method: 'GET' })
  },
  
  post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data)
    })
  },
  
  put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT', 
      body: JSON.stringify(data)
    })
  },
  
  delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' })
  }
}
```

### 2. Update Your Vue Components
Replace direct fetch calls with the API client:

```js
// Before
fetch('http://localhost:5000/api/products')

// After  
import { apiClient } from '@/config/api'
apiClient.get('/products')
```

### 3. Capacitor Configuration
Ensure your `capacitor.config.json` allows HTTP requests:

```json
{
  "appId": "com.aurashop.app",
  "appName": "Aura Shop",
  "webDir": "dist",
  "bundledWebRuntime": false,
  "server": {
    "androidScheme": "https",
    "allowNavigation": [
      "http://YOUR_IP_ADDRESS:5000"
    ]
  },
  "plugins": {
    "CapacitorHttp": {
      "enabled": true
    }
  }
}
```

## Network Configuration

### 1. Find Your Computer's IP Address

**Windows:**
```cmd
ipconfig
```
Look for "IPv4 Address" (usually starts with 192.168.x.x or 10.x.x.x)

**Mac/Linux:**
```bash
ifconfig | grep "inet "
```

**Alternative method:**
```bash
hostname -I
```

### 2. Update API Configuration
Replace `YOUR_IP_ADDRESS` in the API configuration with your actual IP address.

### 3. Firewall Configuration
Ensure your firewall allows connections on port 5000:

**Windows:**
- Windows Defender Firewall → Advanced Settings
- Inbound Rules → New Rule → Port → TCP → Specific Local Ports: 5000

**Mac:**
```bash
sudo pfctl -e
```

**Linux (UFW):**
```bash
sudo ufw allow 5000
```

## Testing the Connection

### 1. Test Backend Health
Navigate to: `http://YOUR_IP_ADDRESS:5000/`

Expected response:
```json
{
  "message": "Aura Shop API is running...",
  "timestamp": "2025-10-22T00:18:04.000Z",
  "environment": "development"
}
```

### 2. Test API Info
Navigate to: `http://YOUR_IP_ADDRESS:5000/api/info`

Expected response:
```json
{
  "message": "Aura Shop API Information",
  "version": "1.0.0",
  "endpoints": { /* ... */ },
  "cors": {
    "enabled": true,
    "allowsCredentials": true,
    "supportsMobile": true
  }
}
```

### 3. Test from Android App
In your app's browser console, test:
```js
fetch('http://YOUR_IP_ADDRESS:5000/api/info')
  .then(r => r.json())
  .then(console.log)
  .catch(console.error)
```

## Troubleshooting

### Common Issues:

**1. "Network Error" / "Failed to fetch"**
- Check if backend server is running
- Verify IP address is correct
- Ensure firewall allows port 5000
- Make sure phone/emulator is on same network

**2. CORS Errors**
- Check server logs for CORS-related messages
- Verify origin headers in browser developer tools
- Ensure `credentials: true` in API requests if using auth

**3. Connection Refused**
- Backend server may not be running
- Port 5000 may be blocked
- IP address may have changed

**4. Android Network Security**
For Android 9+, add to `android/app/src/main/res/xml/network_security_config.xml`:
```xml
<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
    <domain-config cleartextTrafficPermitted="true">
        <domain includeSubdomains="true">YOUR_IP_ADDRESS</domain>
        <domain includeSubdomains="true">localhost</domain>
        <domain includeSubdomains="true">10.0.2.2</domain>
    </domain-config>
</network-security-config>
```

And reference it in `android/app/src/main/AndroidManifest.xml`:
```xml
<application
    android:networkSecurityConfig="@xml/network_security_config">
```

## Production Deployment

For production:
1. Deploy backend to a cloud service (Heroku, Railway, etc.)
2. Update API_BASE_URL to production URL
3. Configure production CORS origins
4. Use HTTPS for all production APIs
5. Implement proper authentication and rate limiting

---

**Last Updated**: October 22, 2025  
**Status**: ✅ **READY** - Backend configured for mobile app access  
**Next Steps**: Update frontend API calls and test on Android device