const {db, docWithId, docsWithIds} = require('../config/firestore');
const bcrypt = require('bcrypt');

class User {
  /**
   * Create a new user
   */
  static async create(userData) {
    try {
      // Hash password if provided
      if (userData.password) {
        const salt = await bcrypt.genSalt(10);
        userData.password = await bcrypt.hash(userData.password, salt);
      }

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
   * Find user by phone number
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
   * Find user by email
   */
  static async findByEmail(email) {
    try {
      const snapshot = await this.collection
          .where('email', '==', email)
          .limit(1)
          .get();

      if (snapshot.empty) return null;
      return docWithId(snapshot.docs[0]);
    } catch (error) {
      console.error('Error finding user by email:', error);
      throw error;
    }
  }

  /**
   * Find user by ID
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
   * Find user by Firebase UID (for phone auth)
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
   * Update user
   */
  static async update(userId, updateData) {
    try {
      // Remove password from updateData if present (use separate method)
      delete updateData.password;

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
   * Update user password
   */
  static async updatePassword(userId, newPassword) {
    try {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      await this.collection.doc(userId).update({
        password: hashedPassword,
        updatedAt: new Date(),
      });

      return true;
    } catch (error) {
      console.error('Error updating password:', error);
      throw error;
    }
  }

  /**
   * Verify password
   */
  static async verifyPassword(plainPassword, hashedPassword) {
    try {
      return await bcrypt.compare(plainPassword, hashedPassword);
    } catch (error) {
      console.error('Error verifying password:', error);
      return false;
    }
  }

  /**
   * Delete user (soft delete)
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
   * Hard delete user (permanently remove)
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
   * Get all users (paginated)
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

User.collection = db.collection('users');

module.exports = User;
