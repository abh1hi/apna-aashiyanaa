const { db, docWithId, docsWithIds } = require('../config/firestore');
const admin = require('firebase-admin'); // Required for FieldValue
const slugify = require('slugify');

class Property {
  /**
   * Create a new property
   */
  static async create(propertyData) {
    try {
      const slug = slugify(propertyData.title, { lower: true, strict: true });
      const docRef = await this.collection.add({
        ...propertyData,
        slug: `${slug}-${Date.now()}`,
        createdAt: new Date(),
        updatedAt: new Date(),
        status: propertyData.status || 'active',
        views: 0,
        favorites: 0
      });
      const doc = await docRef.get();
      return docWithId(doc);
    } catch (error) {
      console.error('Error creating property:', error);
      throw error;
    }
  }

  /**
   * Find property by ID. This method no longer increments the view count.
   * The controller should handle view increments as a separate action.
   */
  static async findById(propertyId) {
    try {
      const doc = await this.collection.doc(propertyId).get();
      return docWithId(doc);
    } catch (error) {
      console.error('Error finding property by ID:', error);
      throw error;
    }
  }

  /**
   * Find property by slug. This method no longer increments the view count.
   */
  static async findBySlug(slug) {
    try {
      const snapshot = await this.collection.where('slug', '==', slug).limit(1).get();
      if (snapshot.empty) return null;
      return docWithId(snapshot.docs[0]);
    } catch (error) {
      console.error('Error finding property by slug:', error);
      throw error;
    }
  }

  /**
   * Get all properties with filters
   */
  static async findAll(filters = {}) {
    try {
      const { status = 'active', city, propertyType, minPrice, maxPrice, bedrooms, ownerId, limit = 50, startAfter = null, orderBy = 'createdAt', orderDirection = 'desc', isFeatured } = filters;
      let query = this.collection.where('status', '==', status);

      if (city) query = query.where('location.city', '==', city);
      if (propertyType) query = query.where('propertyType', '==', propertyType);
      if (ownerId) query = query.where('ownerId', '==', ownerId);
      if (bedrooms) query = query.where('bedrooms', '==', parseInt(bedrooms));
      if (isFeatured !== undefined) query = query.where('isFeatured', '==', isFeatured);

      if (minPrice) query = query.where('price', '>=', parseInt(minPrice));
      if (maxPrice) query = query.where('price', '<=', parseInt(maxPrice));
      
      query = query.orderBy('price').orderBy(orderBy, orderDirection);

      if (startAfter) query = query.startAfter(startAfter);

      query = query.limit(limit);

      const snapshot = await query.get();
      return docsWithIds(snapshot);
    } catch (error) {
      console.error('Error finding properties:', error);
      throw error;
    }
  }

  /**
   * Search properties. WARNING: This is a highly inefficient client-side search.
   * For production, replace this with a dedicated search service like Algolia.
   */
  static async search(searchTerm, filters = {}) {
    try {
      const allProperties = await this.findAll(filters);
      const searchLower = searchTerm.toLowerCase();
      return allProperties.filter(property => {
        const titleMatch = property.title?.toLowerCase().includes(searchLower);
        const descMatch = property.description?.toLowerCase().includes(searchLower);
        return titleMatch || descMatch;
      });
    } catch (error) {
      console.error('Error searching properties:', error);
      throw error;
    }
  }

  /**
   * Update property
   */
  static async update(propertyId, updateData) {
    try {
      if (updateData.title) {
        updateData.slug = `${slugify(updateData.title, { lower: true, strict: true })}-${Date.now()}`;
      }
      const docRef = this.collection.doc(propertyId);
      await docRef.update({
        ...updateData,
        updatedAt: new Date()
      });
      // Fetch the document directly after update to avoid side effects from other methods
      const doc = await docRef.get();
      return docWithId(doc);
    } catch (error) {
      console.error('Error updating property:', error);
      throw error;
    }
  }

  /**
   * Soft delete property
   */
  static async delete(propertyId) {
    try {
      await this.collection.doc(propertyId).update({ status: 'deleted', deletedAt: new Date() });
      return true;
    } catch (error) {
      console.error('Error deleting property:', error);
      throw error;
    }
  }

  /**
   * Hard delete property
   */
  static async hardDelete(propertyId) {
    try {
      await this.collection.doc(propertyId).delete();
      return true;
    } catch (error) {
      console.error('Error hard deleting property:', error);
      throw error;
    }
  }

  /**
   * Atomically increments the favorites count for a property.
   */
  static async incrementFavorites(propertyId) {
    try {
      await this.collection.doc(propertyId).update({
        favorites: admin.firestore.FieldValue.increment(1)
      });
      return true;
    } catch (error) {
      console.error('Error incrementing favorites:', error);
      throw error;
    }
  }

  /**
   * Atomically decrements the favorites count for a property.
   */
  static async decrementFavorites(propertyId) {
    try {
      await this.collection.doc(propertyId).update({
        favorites: admin.firestore.FieldValue.increment(-1)
      });
      return true;
    } catch (error) {
      console.error('Error decrementing favorites:', error);
      throw error;
    }
  }
}

Property.collection = db.collection('properties');

module.exports = Property;
