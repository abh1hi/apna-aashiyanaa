/**
 * Firebase Cloud Functions Main Entry Point (2nd Gen)
 * This file is the single source of truth for all deployed functions.
 */

const { setGlobalOptions } = require("firebase-functions/v2");
const admin = require('firebase-admin');

// Set global options for all functions. This must be done first.
setGlobalOptions({ region: "us-central1" });

// Initialize Firebase Admin SDK once globally.
if (!admin.apps.length) {
  admin.initializeApp();
}

// Import and export the main API application.
// All individual functions and routes are handled within the Express app.
const api = require('./api');
exports.api = api.api;
