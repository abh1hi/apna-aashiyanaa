/**
 * Firebase Cloud Functions Main Entry Point
 * Updated to include Phone Authentication endpoints
 */

const functions = require('firebase-functions');
const admin = require('firebase-admin');

// Initialize Firebase Admin
admin.initializeApp();

// Import auth functions
const authFunctions = require('./auth');

// Export all auth-related Cloud Functions
exports.getUserProfile = authFunctions.getUserProfile;
exports.updateUserProfile = authFunctions.updateUserProfile;
exports.getUserByPhone = authFunctions.getUserByPhone;
exports.createCustomToken = authFunctions.createCustomToken;
exports.deleteUserAccount = authFunctions.deleteUserAccount;
exports.onUserCreate = authFunctions.onUserCreate;
exports.onUserDelete = authFunctions.onUserDelete;

// Add your other existing Cloud Functions below
// Example:
// const propertyFunctions = require('./property');
// exports.getProperties = propertyFunctions.getProperties;

