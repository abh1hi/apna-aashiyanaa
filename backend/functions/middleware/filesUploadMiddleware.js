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
 * It uploads them to storage and attaches the URLs to req.body.
 * This should be used in the route chain *after* upload.array() or upload.single().
 * @param {string} destinationPath - The path in Firebase Storage where images will be stored.
 */
const processAndAttachUrls = (destinationPath) => asyncHandler(async (req, res, next) => {
  if (!req.files || req.files.length === 0) {
    return next(); // No files to process, continue to the next middleware.
  }

  try {
    const imageObjects = await processImages(req.files, destinationPath);
    // Attach image URLs to the request body for the controller to use.
    req.body.images = imageObjects.map(img => img.url);
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