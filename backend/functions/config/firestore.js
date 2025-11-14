const admin = require("firebase-admin");

// Get Firestore instance
const db = admin.firestore();

// Configure Firestore settings
db.settings({
  ignoreUndefinedProperties: true,
  timestampsInSnapshots: true,
});

// Helper function to convert Firestore timestamp to Date
const timestampToDate = (timestamp) => {
  if (!timestamp) return null;
  return timestamp.toDate ? timestamp.toDate() : timestamp;
};

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

module.exports = {
  db,
  timestampToDate,
  docWithId,
  docsWithIds,
};

