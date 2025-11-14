const { db, docWithId, docsWithIds } = require('../config/db');
const slugify = require('slugify');

class Property {
  /**
   * Create a new property
   */
  static async create(propertyData) {
    try {
      // Generate slug from title
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
   * Find property by ID
   */
  static async findById(propertyId) {
    try {
      const doc = await this.collection.doc(propertyId).get();
      
      if (doc.exists) {
        // Increment view count
        await this.collection.doc(propertyId).update({
          views: (doc.data().views || 0) + 1
        });
      }

      return docWithId(doc);
    } catch (error) {
      console.error('Error finding property by ID:', error);
      throw error;
    }
  }

  /**
   * Find property by slug
   */
  static async findBySlug(slug) {
    try {
      const snapshot = await this.collection
        .where('slug', '==', slug)
        .limit(1)
        .get();

      if (snapshot.empty) return null;
      
      const property = docWithId(snapshot.docs[0]);
      
      // Increment view count
      await this.collection.doc(property.id).update({
        views: (property.views || 0) + 1
      });

      return property;
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
      const {
        status = 'active',
        city,
        propertyType,
        minPrice,
        maxPrice,
        bedrooms,
        ownerId,
        limit = 50,
        startAfter = null,
        orderBy = 'createdAt',
        orderDirection = 'desc'
      } = filters;

      let query = this.collection.where('status', '==', status);

      // Apply filters
      if (city) {
        query = query.where('location.city', '==', city);
      }

      if (propertyType) {
        query = query.where('propertyType', '==', propertyType);
      }

      if (ownerId) {
        query = query.where('ownerId', '==', ownerId);
      }

      if (bedrooms) {
        query = query.where('bedrooms', '==', parseInt(bedrooms));
      }

      // Note: Firestore doesn't support multiple range queries on different fields
      // You'll need composite indexes for complex queries
      if (minPrice && !maxPrice) {
        query = query.where('price', '>=', parseInt(minPrice));
      } else if (maxPrice && !minPrice) {
        query = query.where('price', '<=', parseInt(maxPrice));
      } else if (minPrice && maxPrice) {
        query = query
          .where('price', '>=', parseInt(minPrice))
          .where('price', '<=', parseInt(maxPrice));
      }

      // Order and limit
      query = query.orderBy(orderBy, orderDirection);

      if (startAfter) {
        query = query.startAfter(startAfter);
      }

      query = query.limit(limit);

      const snapshot = await query.get();
      return docsWithIds(snapshot);
    } catch (error) {
      console.error('Error finding properties:', error);
      throw error;
    }
  }

  /**
   * Search properties by title or description
   */
  static async search(searchTerm, filters = {}) {
    try {
      // Note: Firestore doesn't have full-text search
      // This is a basic implementation. For production, use Algolia or similar
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
      // If title is updated, regenerate slug
      if (updateData.title) {
        updateData.slug = `${slugify(updateData.title, { lower: true, strict: true })}-${Date.now()}`;
      }

      await this.collection.doc(propertyId).update({
        ...updateData,
        updatedAt: new Date()
      });

      return await this.findById(propertyId);
    } catch (error) {
      console.error('Error updating property:', error);
      throw error;
    }
  }

  /**
   * Delete property (soft delete)
   */
  static async delete(propertyId) {
    try {
      await this.collection.doc(propertyId).update({
        status: 'deleted',
        deletedAt: new Date()
      });
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
   * Increment favorites count
   */
  static async incrementFavorites(propertyId) {
    try {
      const property = await this.findById(propertyId);
      if (!property) throw new Error('Property not found');

      await this.collection.doc(propertyId).update({
        favorites: (property.favorites || 0) + 1
      });

      return true;
    } catch (error) {
      console.error('Error incrementing favorites:', error);
      throw error;
    }
  }

  /**
   * Decrement favorites count
   */
  static async decrementFavorites(propertyId) {
    try {
      const property = await this.findById(propertyId);
      if (!property) throw new Error('Property not found');

      await this.collection.doc(propertyId).update({
        favorites: Math.max((property.favorites || 0) - 1, 0)
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
