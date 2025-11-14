# Capacitor Android Troubleshooting and Implementation Guide

## Problem Identification

The **blank screen issue** in the Android Capacitor build was caused by several configuration problems:

1. **JavaScript Runtime Error**: `TypeError: u.then is not a function` in the minified bundle
2. **Missing Asset Files**: Vite assets not properly copied to Capacitor's expected directory
3. **Circular Dependency**: Router importing globalState from main.js causing initialization issues
4. **Build Configuration**: Incorrect base path and output directory settings

## Root Causes

### 1. Vite Configuration Issues
- Missing `defineConfig` import in `vite.config.js`
- Incorrect `base` path for Capacitor builds
- Missing explicit `outDir` configuration

### 2. Capacitor Configuration Issues
- `webDir` pointing to wrong directory (`www` instead of `dist`)
- Missing `bundledWebRuntime` configuration

### 3. Vue Router Circular Dependency Issues
- Router importing globalState from main.js
- Dynamic component function causing `u.then is not a function` error
- Using `createMemoryHistory()` instead of `createWebHashHistory()`

### 4. localStorage Access in Capacitor
- localStorage access in main module before WebView is ready
- Need safe localStorage access patterns

## Solutions Implemented

### 1. Fixed `vite.config.js`
```js
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  base: './',  // Relative paths for Capacitor
  build: {
    outDir: 'dist'  // Explicit output directory
  }
});
```

### 2. Updated `capacitor.config.json`
```json
{
  "appId": "com.aurashop.app",
  "appName": "Aura Shop",
  "webDir": "dist",  // Points to Vite's output directory
  "bundledWebRuntime": false,
  "server": {
    "androidScheme": "https"
  }
}
```

### 3. Fixed Circular Dependency in `src/main.js`
```js
// Import router AFTER globalState is defined
import { createApp, reactive } from 'vue'
import App from './App.vue'
import './index.css'

// Safe localStorage access
let savedUser = null
try {
  savedUser = localStorage?.getItem('user')
} catch (e) {
  console.warn('localStorage not available:', e)
}

export const globalState = reactive({
  isLoggedIn: !!savedUser,
  user: savedUser ? JSON.parse(savedUser) : null,
})

// Import router AFTER globalState
import router from './router'

const app = createApp(App)
app.use(router)

// Simple mount without router.isReady()
if (typeof document !== 'undefined') {
  app.mount('#app')
}
```

### 4. Fixed Router Structure (`src/router/index.js`)
```js
import { createRouter, createWebHashHistory } from 'vue-router';

// Remove dynamic component that caused circular dependency
const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomeNotLogin, // Default to non-logged in
  },
  {
    path: '/home-logged-in',
    name: 'HomeLoggedIn',
    component: Home,
    meta: { requiresAuth: true },
  },
  // ... other routes
];

// Safe globalState access without circular dependency
function getGlobalState() {
  try {
    if (typeof localStorage !== 'undefined') {
      const savedUser = localStorage.getItem('user');
      return {
        isLoggedIn: !!savedUser,
        user: savedUser ? JSON.parse(savedUser) : null,
      };
    }
  } catch (e) {
    console.warn('Could not access localStorage:', e);
  }
  return { isLoggedIn: false, user: null };
}

const router = createRouter({
  history: createWebHashHistory(), // Better for Capacitor WebView
  routes,
});

router.beforeEach((to, from, next) => {
  const globalState = getGlobalState();
  
  // Handle home page routing
  if (to.name === 'Home' && globalState.isLoggedIn) {
    next({ name: 'HomeLoggedIn' });
    return;
  }
  
  // ... other auth checks
});
```

## Build and Deployment Steps

### 1. Pull Latest Changes
```bash
cd metainflu/frontend/client-app
git pull origin main
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Build the Web Application
```bash
npm run build
```

### 4. Copy Assets to Android
```bash
npx cap copy android
npx cap sync android
```

### 5. Open in Android Studio
```bash
npx cap open android
```

### 6. Clean Build and Run
- In Android Studio: **Build → Clean Project**
- Then **Build → Rebuild Project** 
- Install on device or emulator

## Verification Steps

1. **Check Build Output**: Ensure `dist/` directory contains `index.html` and assets
2. **Verify Capacitor Config**: Run `npx cap doctor` to check configuration
3. **Test in Browser**: Test the built app with `npx serve dist` before deploying
4. **Check Android Logs**: Use `adb logcat | grep Capacitor` to monitor for errors
5. **Verify No Console Errors**: Should see no `TypeError: u.then is not a function` errors

## Common Issues and Solutions

### Issue: "Could not find web assets directory"
**Solution**: Ensure `webDir` in `capacitor.config.json` matches your build output directory.

### Issue: "TypeError: u.then is not a function" 
**Solution**: 
- ✅ **FIXED**: Removed circular dependency between main.js and router
- ✅ **FIXED**: Replaced dynamic component with proper route navigation
- ✅ **FIXED**: Safe localStorage access patterns

### Issue: Assets not loading (404 errors)
**Solution**: 
- Set `base: './'` in `vite.config.js`
- Verify assets are copied with `npx cap copy`

### Issue: Blank screen but no errors
**Solution**: 
- Check browser developer tools in the WebView
- Verify all Vue components are properly imported
- Test router navigation manually

### Issue: "Unable to open asset URL: vite.svg"
**Solution**: This is a minor warning and doesn't affect functionality. The missing vite.svg is not critical.

## Key Learnings

1. **Avoid Circular Dependencies**: Never import from main.js in router files
2. **Use Static Routes**: Dynamic component functions can cause issues in production builds
3. **Safe localStorage Access**: Always wrap in try/catch for Capacitor compatibility
4. **Hash History for Capacitor**: `createWebHashHistory()` works better than memory or web history
5. **Simple Mount Pattern**: Avoid complex router initialization in Capacitor

## Performance Optimizations

1. **Enable Code Splitting**: Vite automatically splits large bundles
2. **Optimize Images**: Use appropriate formats and sizes for mobile
3. **Minimize Dependencies**: Remove unused packages to reduce bundle size
4. **Enable Compression**: Configure server compression for assets

## Testing Checklist

- [x] App loads without blank screen ✅
- [x] No `TypeError: u.then is not a function` ✅
- [x] Navigation between pages works ✅
- [x] Authentication flow functions ✅
- [ ] API calls work properly
- [ ] Touch gestures respond correctly
- [ ] App works offline (if applicable)
- [ ] Performance is acceptable on target devices

## Troubleshooting Commands

```bash
# Check Capacitor configuration
npx cap doctor

# View detailed sync output
npx cap sync android --verbose

# Clear Capacitor cache
rm -rf android/app/src/main/assets/public
npx cap copy android

# Check Android logs
adb logcat | grep -i capacitor

# Check for JavaScript errors
adb logcat | grep "Console"
```

## Additional Resources

- [Capacitor Android Troubleshooting](https://capacitorjs.com/docs/android/troubleshooting)
- [Vite Build Configuration](https://vitejs.dev/config/build-options.html)
- [Vue Router Hash Mode](https://router.vuejs.org/guide/essentials/history-mode.html#hash-mode)
- [Capacitor Configuration Reference](https://capacitorjs.com/docs/config)
- [Vue 3 Circular Dependencies](https://vuejs.org/guide/best-practices/performance.html#avoid-unnecessary-component-abstractions)

---

**Last Updated**: October 22, 2025  
**Status**: ✅ **RESOLVED** - Circular dependency eliminated, TypeError fixed  
**Next Steps**: Test full app functionality and deploy to production