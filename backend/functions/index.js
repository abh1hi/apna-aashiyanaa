/**
 * Firebase Cloud Functions Main Entry Point (2nd Gen)
 * This file should be the single source of truth for global configuration.
 */

const { setGlobalOptions } = require("firebase-functions/v2");

// Set global options for all functions in the project.
// This MUST be called before any other function files are imported.
setGlobalOptions({ region: "us-central1" });

const admin = require('firebase-admin');

// Initialize Firebase Admin once.
if (!admin.apps.length) {
  admin.initializeApp();
}

// Import and re-export the functions from their individual files.
// This pattern allows for better organization of function code.
const api = require('./api');
const auth = require('./auth');

exports.api = api.api;
exports.getUserProfile = auth.getUserProfile;
exports.updateUserProfile = auth.updateUserProfile;
exports.getUserByPhone = auth.getUserByPhone;
exports.createCustomToken = auth.createCustomToken;
exports.deleteUserAccount = auth.deleteUserAccount;
