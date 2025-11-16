const multer = require('multer');
const { processImages } = require('../utils/imageUpload');
const asyncHandler = require('express-async-handler');

// Configure multer for memory storage
const multerStorage = multer.memoryStorage();

const upload = multer({
  storage: multerStorage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image')) {
      cb(null, true);
    } else {
      cb(new Error('Not an image! Please upload only images.'), false);
    }
  },
});

/**
 * Middleware to handle multiple image uploads, process them, and attach their URLs to the request.
 * @param {string} fieldName - The name of the field in the multipart form data for the images.
 * @param {string} destinationPath - The path in Firebase Storage where images will be stored.
 */
const filesUploadMiddleware = (fieldName, destinationPath) => asyncHandler(async (req, res, next) => {
  // Use multer to parse the files
  upload.array(fieldName)(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ message: err.message });
    }

    // Process and upload images
    if (req.files) {
      try {
        const imageObjects = await processImages(req.files, destinationPath);
        // Attach image URLs to the request body
        req.body.images = imageObjects.map(img => img.url);
      } catch (uploadError) {
        return res.status(500).json({ message: uploadError.message });
      }
    }

    next();
  });
});

module.exports = filesUploadMiddleware;
