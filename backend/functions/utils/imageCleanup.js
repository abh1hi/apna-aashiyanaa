const admin = require('firebase-admin');

/**
 * Delete images from Firebase Storage
 * @param {Array<string>} imagePaths - Array of storage paths to delete
 * @returns {Promise<{success: number, failed: number, errors: Array}>}
 */
const deleteImagesFromStorage = async (imagePaths) => {
  if (!imagePaths || imagePaths.length === 0) {
    return { success: 0, failed: 0, errors: [] };
  }

  const bucket = admin.storage().bucket();
  const results = {
    success: 0,
    failed: 0,
    errors: []
  };

  const deletePromises = imagePaths.map(async (imagePath) => {
    try {
      // Handle both full paths and just the path portion
      const path = imagePath.startsWith('gs://') 
        ? imagePath.replace(`gs://${bucket.name}/`, '')
        : imagePath;
      
      const file = bucket.file(path);
      const [exists] = await file.exists();
      
      if (exists) {
        await file.delete();
        results.success++;
      } else {
        console.warn(`Image not found in storage: ${path}`);
        results.success++; // Count as success since it's already gone
      }
    } catch (error) {
      console.error(`Error deleting image ${imagePath}:`, error);
      results.failed++;
      results.errors.push({ path: imagePath, error: error.message });
    }
  });

  await Promise.all(deletePromises);
  return results;
};

/**
 * Extract image paths from property images array
 * Supports both old format (URL strings) and new format (metadata objects)
 * @param {Array} images - Array of image URLs or image metadata objects
 * @returns {Array<string>} Array of storage paths
 */
const extractImagePaths = (images) => {
  if (!images || !Array.isArray(images)) {
    return [];
  }

  return images
    .map(img => {
      // New format: image object with path property
      if (typeof img === 'object' && img.path) {
        return img.path;
      }
      // New format: image object with storagePath property
      if (typeof img === 'object' && img.storagePath) {
        return img.storagePath;
      }
      // Old format: URL string - extract path from URL
      if (typeof img === 'string' && img.includes('storage.googleapis.com')) {
        try {
          const url = new URL(img);
          // Remove leading slash and bucket name from path
          const path = url.pathname.substring(1);
          const bucketIndex = path.indexOf('/');
          if (bucketIndex > 0) {
            return path.substring(bucketIndex + 1);
          }
          return path;
        } catch (e) {
          console.warn(`Could not extract path from URL: ${img}`);
          return null;
        }
      }
      return null;
    })
    .filter(path => path !== null);
};

/**
 * Clean up all images associated with a property
 * @param {Object} property - Property object with images array
 * @returns {Promise<Object>} Cleanup results
 */
const cleanupPropertyImages = async (property) => {
  if (!property || !property.images) {
    return { success: 0, failed: 0, errors: [] };
  }

  const imagePaths = extractImagePaths(property.images);
  return await deleteImagesFromStorage(imagePaths);
};

module.exports = {
  deleteImagesFromStorage,
  extractImagePaths,
  cleanupPropertyImages,
};

