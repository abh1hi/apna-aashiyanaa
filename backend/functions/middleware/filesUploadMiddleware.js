const multer = require('multer');
const { processImages } = require('../utils/imageUpload');
const asyncHandler = require('express-async-handler');

// Configure multer for memory storage and file filtering
const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    console.log(`[multer.fileFilter] Processing file: ${file.originalname}, mimetype: ${file.mimetype}`);
    if (file.mimetype.startsWith('image')) {
      console.log(`[multer.fileFilter] ✓ File accepted: ${file.originalname}`);
      cb(null, true);
    } else {
      console.log(`[multer.fileFilter] ✗ File rejected (not image): ${file.originalname}`);
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
  console.log(`[processAndAttachUrls] Called with path=${destinationPath}`);
  console.log(`[processAndAttachUrls] req.files = ${req.files ? `Array(${req.files.length})` : 'undefined'}`);
  
  if (req.files && req.files.length > 0) {
    console.log(`[processAndAttachUrls] Found ${req.files.length} file(s) to upload`);
    req.files.forEach((f, i) => {
      console.log(`  [${i}] ${f.originalname} (${f.size} bytes, ${f.mimetype})`);
    });
  }

  if (!req.files || req.files.length === 0) {
    console.log('[processAndAttachUrls] No files to process');
    req.body.images = [];
    return next(); // No files to process, continue to the next middleware.
  }

  try {
    console.log(`[processAndAttachUrls] Processing ${req.files.length} files to ${destinationPath}`);
    const imageObjects = await processImages(req.files, destinationPath);
    console.log(`[processAndAttachUrls] Successfully processed ${imageObjects.length} images`);
    imageObjects.forEach((img, i) => {
      console.log(`  [${i}] URL: ${img.url}`);
    });
    // Attach image URLs to the request body for the controller to use.
    req.body.images = imageObjects.map(img => img.url);
    console.log(`[processAndAttachUrls] Attached ${req.body.images.length} image URLs to req.body`);
    next();
  } catch (error) {
    console.error('[processAndAttachUrls] Error processing images:', error.message, error.stack);
    // Pass any errors to the Express error handler.
    next(error);
  }
});

module.exports = {
  upload,
  processAndAttachUrls,
};