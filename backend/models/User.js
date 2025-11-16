const { db, docWithId } = require('../config/firestore');

/**
 * User Model
 * 
 * This class encapsulates all database interactions for the 'users' collection.
 * It is designed to work exclusively with Firebase Authentication UIDs.
 */
class User {
  /**
   * The Firestore collection reference.
   */
  static collection = db.collection('users');

  /**
   * Creates a new user document in the database.
   * This is typically called only once during registration.
   * 
   * @param {object} userData - The data for the new user.
   * Must include firebaseUid, mobile, name, and role.
   * @returns {Promise<object>} The newly created user object.
   */
  static async create(userData) {
    const newUser = {
      ...userData,
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true,
    };

    const docRef = await this.collection.add(newUser);
    const doc = await docRef.get();
    return docWithId(doc);
  }

  /**
   * Finds a user by their unique Firebase UID.
   * This is the primary method for looking up a user.
   * 
   * @param {string} firebaseUid - The user's Firebase Unique ID.
   * @returns {Promise<object|null>} The user object or null if not found.
   */
  static async findByFirebaseUid(firebaseUid) {
    const snapshot = await this.collection
        .where('firebaseUid', '==', firebaseUid)
        .limit(1)
        .get();

    if (snapshot.empty) {
      return null;
    }
    return docWithId(snapshot.docs[0]);
  }

  /**
   * Finds a user by their phone number.
   * Useful for checking if a number is already registered.
   * 
   * @param {string} mobile - The user's 10-digit phone number.
   * @returns {Promise<object|null>} The user object or null if not found.
   */
  static async findByPhone(mobile) {
    const snapshot = await this.collection
        .where('mobile', '==', mobile)
        .limit(1)
        .get();

    if (snapshot.empty) {
      return null;
    }
    return docWithId(snapshot.docs[0]);
  }

  /**
   * Updates a user's profile data.
   * 
   * @param {string} docId - The Firestore document ID of the user to update.
   * @param {object} updateData - An object containing the fields to update.
   * @returns {Promise<object>} The updated user object.
   */
  static async update(docId, updateData) {
    const docRef = this.collection.doc(docId);

    await docRef.update({
      ...updateData,
      updatedAt: new Date(),
    });

    const updatedDoc = await docRef.get();
    return docWithId(updatedDoc);
  }
}

module.exports = User;
