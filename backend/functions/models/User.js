const { db, docWithId, docsWithIds } = require('../config/firestore');

class User {
  /**
   * Create a new user in the database.
   * Assumes that the user has already been authenticated via Firebase and does not exist.
   */
  static async create(userData) {
    try {
      if (!userData.firebaseUid || !userData.phone) {
        throw new Error('Firebase UID and phone number are required to create a user.');
      }

      const docRef = await this.collection.add({
        ...userData,
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true,
        role: userData.role || 'user', // Default role
      });

      const doc = await docRef.get();
      return docWithId(doc);
    } catch (error) {
      console.error('Error creating user:', error);
      // Providing a more specific error message if it's a duplicate
      if (error.message.includes('already exists')) {
        throw new Error('A user with this phone number or Firebase UID already exists.');
      }
      throw error;
    }
  }

  /**
   * Find user by their phone number.
   */
  static async findByPhone(phone) {
    try {
      const snapshot = await this.collection.where('phone', '==', phone).limit(1).get();
      if (snapshot.empty) return null;
      return docWithId(snapshot.docs[0]);
    } catch (error) {
      console.error('Error finding user by phone:', error);
      throw error;
    }
  }

  /**
   * Find user by their unique Firebase UID.
   * This is the primary method for identifying users post-authentication.
   */
  static async findByFirebaseUid(firebaseUid) {
    try {
      const snapshot = await this.collection.where('firebaseUid', '==', firebaseUid).limit(1).get();
      if (snapshot.empty) return null;
      return docWithId(snapshot.docs[0]);
    } catch (error) {
      console.error('Error finding user by Firebase UID:', error);
      throw error;
    }
  }

  /**
   * Find user by their database ID.
   */
  static async findById(userId) {
    try {
      const doc = await this.collection.doc(userId).get();
      if (!doc.exists) return null;
      return docWithId(doc);
    } catch (error) {
      console.error('Error finding user by ID:', error);
      throw error;
    }
  }

  /**
   * Update a user's profile data.
   */
  static async update(userId, updateData) {
    try {
      // Ensure critical, immutable fields are not changed.
      delete updateData.firebaseUid;
      delete updateData.phone;
      delete updateData.role; // Role changes should be a separate, admin-only function.

      const docRef = this.collection.doc(userId);
      await docRef.update({
        ...updateData,
        updatedAt: new Date(),
      });

      return await this.findById(userId); // Return the updated document
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  /**
   * Soft delete a user by marking them as inactive.
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
   * Get all users (for admin purposes, with pagination).
   */
  static async findAll(options = {}) {
    try {
      const { limit = 50, startAfter = null } = options;
      let query = this.collection.orderBy('createdAt', 'desc');

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

// Define the Firestore collection for this model.
User.collection = db.collection('users');

module.exports = User;
