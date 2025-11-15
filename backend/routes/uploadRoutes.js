const express = require('express');
const router = express.Router();
const { uploadPropertyImages } = require('../controllers/propertyController');
const { protect } = require('../middleware/authMiddleware');
const { upload, handleMulterError } = require('../middleware/upload');

// Generic image upload endpoint
router.post(
  '/',
  protect,
  upload.array('images', 10),
  handleMulterError,
  async (req, res) => {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No images uploaded'
        });
      }

      const { processImages } = require('../utils/imageUpload');
      
      const processedImages = await processImages(req.files, {
        maxSizeInBytes: 2 * 1024 * 1024,
        quality: 80,
        format: 'webp'
      });
      
      const imageUrls = processedImages.map(img => img.data);

      res.status(200).json({
        success: true,
        images: imageUrls,
        count: imageUrls.length,
        message: 'Images uploaded and compressed successfully'
      });
    } catch (error) {
      console.error('Error uploading images:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to upload images',
        error: error.message
      });
    }
  }
);

module.exports = router;
