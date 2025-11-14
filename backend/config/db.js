const admin = require('firebase-admin');

// Initialize Firebase Admin SDK.
if (admin.apps.length === 0) {
  admin.initializeApp();
  console.log('✅ Firebase Admin SDK initialized');
}

const db = admin.firestore();

// Helper function to get document with ID
const docWithId = (doc) => {
  if (!doc.exists) return null;
  return {
    id: doc.id,
    ...doc.data(),
  };
};

// Helper function to get collection with IDs
const docsWithIds = (snapshot) => {
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
};

module.exports = { admin, db, docWithId, docsWithIds };