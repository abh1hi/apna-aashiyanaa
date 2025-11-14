/**
 * Firebase Cloud Functions Main Entry Point
 * Apna Aashiyanaa Property Management App
 */

const admin = require('firebase-admin');

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp();
}

// Import auth functions
const authFunctions = require('./auth');

// Import API function
// const {api} = require('./api');

// Export Cloud Functions
// Auth Functions
exports.getUserProfile = authFunctions.getUserProfile;
exports.updateUserProfile = authFunctions.updateUserProfile;
exports.getUserByPhone = authFunctions.getUserByPhone;
exports.createCustomToken = authFunctions.createCustomToken;
exports.deleteUserAccount = authFunctions.deleteUserAccount;
// exports.onUserCreate = authFunctions.onUserCreate;
// exports.onUserDelete = authFunctions.onUserDelete;

// API Function (Express app)
// exports.api = api;
