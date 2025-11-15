const {db, docWithId, docsWithIds} = require('../config/firestore');

/**
 * User Model
 * 
 * This class encapsulates all database interactions for the 'users' collection.
 * It now exclusively supports a passwordless, Firebase UID-based system.
 * All methods related to email or password have been removed.
 */
class User {
  /**
   * Creates a new user document in the database.
   * @param {object} userData - The data for the new user.
   * Must include firebaseUid, phone, and name.
   * @returns {Promise<object>} The newly created user object, including its Firestore ID.
   */
  static async create(userData) {
    try {
      const docRef = await this.collection.add({
        ...userData,
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true,
        role: userData.role || 'user',
      });

      const doc = await docRef.get();
      return docWithId(doc);
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  /**
   * Finds a user by their phone number.
   * @param {string} phone - The user's 10-digit phone number.
   * @returns {Promise<object|null>} The user object or null if not found.
   */
  static async findByPhone(phone) {
    try {
      const snapshot = await this.collection
          .where('phone', '==', phone)
          .limit(1)
          .get();

      if (snapshot.empty) return null;
      return docWithId(snapshot.docs[0]);
    } catch (error) {
      console.error('Error finding user by phone:', error);
      throw error;
    }
  }

  /**
   * Finds a user by their unique Firebase UID.
   * This is the primary method for looking up a user in the new auth system.
   * @param {string} firebaseUid - The user's Firebase Unique ID.
   * @returns {Promise<object|null>} The user object or null if not found.
   */
  static async findByFirebaseUid(firebaseUid) {
    try {
      const snapshot = await this.collection
          .where('firebaseUid', '==', firebaseUid)
          .limit(1)
          .get();

      if (snapshot.empty) return null;
      return docWithId(snapshot.docs[0]);
    } catch (error) {
      console.error('Error finding user by Firebase UID:', error);
      throw error;
    }
  }

  /**
   * Finds a user by their Firestore document ID.
   * @param {string} userId - The Firestore document ID.
   * @returns {Promise<object>} The user object.
   */
  static async findById(userId) {
    try {
      const doc = await this.collection.doc(userId).get();
      return docWithId(doc);
    } catch (error) {
      console.error('Error finding user by ID:', error);
      throw error;
    }
  }

  /**
   * Updates a user's profile data.
   * @param {string} userId - The Firestore document ID of the user to update.
   * @param {object} updateData - An object containing the fields to update.
   * @returns {Promise<object>} The updated user object.
   */
  static async update(userId, updateData) {
    try {
      await this.collection.doc(userId).update({
        ...updateData,
        updatedAt: new Date(),
      });

      return await this.findById(userId);
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  /**
   * Performs a soft delete on a user by setting them as inactive.
   * @param {string} userId - The ID of the user to delete.
   * @returns {Promise<boolean>} True if the operation was successful.
   */
  static async delete(userId) {
    try {
      await this.collection.doc(userId).update({
        isActive: false,
        deletedAt: new Date(),
      });
      return true;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }

  /**
   * Permanently deletes a user document from the database.
   * @param {string} userId - The ID of the user to delete permanently.
   * @returns {Promise<boolean>} True if the operation was successful.
   */
  static async hardDelete(userId) {
    try {
      await this.collection.doc(userId).delete();
      return true;
    } catch (error) {
      console.error('Error hard deleting user:', error);
      throw error;
    }
  }

  /**
   * Retrieves all active users, with options for pagination and filtering.
   * @param {object} [options] - Optional parameters for the query.
   * @param {number} [options.limit=50] - The maximum number of users to return.
   * @param {object} [options.startAfter=null] - A Firestore document snapshot to start after for pagination.
   * @param {string} [options.role=null] - An optional user role to filter by.
   * @returns {Promise<Array<object>>} An array of user objects.
   */
  static async findAll(options = {}) {
    try {
      const {limit = 50, startAfter = null, role = null} = options;

      let query = this.collection
          .where('isActive', '==', true)
          .orderBy('createdAt', 'desc');

      if (role) {
        query = query.where('role', '==', role);
      }

      if (startAfter) {
        query = query.startAfter(startAfter);
      }

      query = query.limit(limit);

      const snapshot = await query.get();
      return docsWithIds(snapshot);
    } catch (error) {
      console.error('Error finding all users:', error);
      throw error;
    }
  }
}

// Statically assign the collection to the class.
User.collection = db.collection('users');

module.exports = User;
