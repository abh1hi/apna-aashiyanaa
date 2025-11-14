const { db, docWithId, docsWithIds } = require('../config/firestore');

class Favorite {
  /**
   * Add a property to user's favorites
   */
  static async create(userId, propertyId) {
    try {
      const docRef = await this.collection.add({
        userId,
        propertyId,
        createdAt: new Date(),
      });
      const doc = await docRef.get();
      return docWithId(doc);
    } catch (error) {
      console.error('Error adding favorite:', error);
      throw error;
    }
  }

  /**
   * Find all favorites for a user
   */
  static async findByUserId(userId) {
    try {
      const snapshot = await this.collection
        .where('userId', '==', userId)
        .orderBy('createdAt', 'desc')
        .get();
      return docsWithIds(snapshot);
    } catch (error) {
      console.error('Error finding user favorites:', error);
      throw error;
    }
  }

  /**
   * Find a specific favorite by userId and propertyId
   */
  static async findByUserIdAndPropertyId(userId, propertyId) {
    try {
      const snapshot = await this.collection
        .where('userId', '==', userId)
        .where('propertyId', '==', propertyId)
        .limit(1)
        .get();
      if (snapshot.empty) return null;
      return docWithId(snapshot.docs[0]);
    } catch (error) {
      console.error('Error finding favorite by user and property ID:', error);
      throw error;
    }
  }

  /**
   * Delete a favorite
   */
  static async delete(favoriteId) {
    try {
      await this.collection.doc(favoriteId).delete();
      return true;
    } catch (error) {
      console.error('Error deleting favorite:', error);
      throw error;
    }
  }

  /**
   * Delete a favorite by userId and propertyId
   */
  static async deleteByUserIdAndPropertyId(userId, propertyId) {
    try {
      const favorite = await this.findByUserIdAndPropertyId(userId, propertyId);
      if (favorite) {
        await this.collection.doc(favorite.id).delete();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error deleting favorite by user and property ID:', error);
      throw error;
    }
  }
}

Favorite.collection = db.collection('favorites');

module.exports = Favorite;
