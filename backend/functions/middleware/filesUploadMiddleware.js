const multer = require('multer');
const { processImages } = require('../utils/imageUpload');
const asyncHandler = require('express-async-handler');

// Configure multer for memory storage and file filtering
const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image')) {
      cb(null, true);
    } else {
      cb(new Error('Not an image! Please upload only images.'), false);
    }
  },
});

/**
 * Middleware to process images after multer has parsed them. 
 * It uploads them to storage and attaches full image metadata to req.body.
 * This should be used in the route chain *after* upload.array() or upload.single().
 * @param {string} destinationPath - The path in Firebase Storage where images will be stored.
 * @param {string} propertyId - Optional property ID for organizing images in storage
 */
const processAndAttachUrls = (destinationPath, propertyId = null) => asyncHandler(async (req, res, next) => {
  if (!req.files || req.files.length === 0) {
    return next(); // No files to process, continue to the next middleware.
  }

  try {
    // Use property ID in path if available for better organization
    const storagePath = propertyId ? `${destinationPath}/${propertyId}` : destinationPath;
    const imageObjects = await processImages(req.files, storagePath);
    
    // Store full image metadata objects instead of just URLs
    // This includes: id, url, path, size, originalname, and order
    req.body.images = imageObjects.map((img, index) => ({
      id: img.id,
      url: img.url,
      path: img.path, // Storage path for cleanup
      size: img.size,
      originalName: img.originalname,
      order: index, // Maintain upload order
      uploadedAt: new Date()
    }));
    
    next();
  } catch (error) {
    // Pass any errors to the Express error handler.
    next(error);
  }
});

module.exports = {
  upload,
  processAndAttachUrls,
};