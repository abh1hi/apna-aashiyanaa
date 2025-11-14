const sharp = require('sharp');
const { v4: uuidv4 } = require('uuid');
// For prod cloud storage upload (commented for emulator/dev)
// const { Storage } = require('@google-cloud/storage');
// const path = require('path');
// const storage = new Storage(); // Uses GOOGLE_APPLICATION_CREDENTIALS env var

/**
 * Compress and optimize image buffer
 * @param {Buffer} buffer - Image buffer from multer
 * @param {Object} options - Compression options
 * @returns {Promise<Object>} - Compressed image data
 */
const compressImage = async (buffer, options = {}) => {
  try {
    const {
      maxSizeInBytes = 2 * 1024 * 1024, // 2MB default
      quality = 80,
      format = 'webp'
    } = options;
    if (!buffer || !(buffer instanceof Buffer) || buffer.length === 0) {
      throw new Error('Invalid image input: input is not a non-empty Buffer');
    }
    let metadata;
    try {
      metadata = await sharp(buffer).metadata();
    } catch (metaErr) {
      throw new Error('Unable to get image metadata, likely non-image file: ' + metaErr.message);
    }
    let compressed = buffer;
    let currentQuality = quality;
    let outputBuffer;
    while (currentQuality >= 20) {
      if (format === 'webp') {
        outputBuffer = await sharp(compressed)
          .webp({ quality: currentQuality })
          .toBuffer();
      } else if (format === 'jpeg') {
        outputBuffer = await sharp(compressed)
          .jpeg({ quality: currentQuality, mozjpeg: true })
          .toBuffer();
      } else {
        outputBuffer = await sharp(compressed)
          .png({ quality: currentQuality, compressionLevel: 9 })
          .toBuffer();
      }
      if (outputBuffer.length <= maxSizeInBytes) {
        break;
      }
      currentQuality -= 10;
    }
    if (outputBuffer.length > maxSizeInBytes) {
      const scaleFactor = Math.sqrt(maxSizeInBytes / outputBuffer.length);
      const newWidth = Math.floor(metadata.width * scaleFactor);
      const newHeight = Math.floor(metadata.height * scaleFactor);
      outputBuffer = await sharp(compressed)
        .resize(newWidth, newHeight, { fit: 'inside' })
        .webp({ quality: 70 })
        .toBuffer();
    }
    // --- STORAGE UPLOAD SECTION (Commented for emulator) ---
    /*
    // Upload to Firebase Storage in 'properties/' with unique filename based on UUID
    const filename = `${uuidv4()}.${format}`;
    const filePath = `properties/${filename}`;
    const bucket = storage.bucket();
    const file = bucket.file(filePath);
    await file.save(outputBuffer, { contentType: `image/${format}` });
    // Optionally make public or add token for download URLs
    // const url = `https://storage.googleapis.com/${bucket.name}/${filePath}`;
    // return {
    //   success: true,
    //   url,
    //   ...
    // };
    */
    // --- END STORAGE UPLOAD SECTION ---
    // For now, just return the data URL for emulator compatibility
    const base64Image = `data:image/${format};base64,${outputBuffer.toString('base64')}`;
    return {
      success: true,
      data: base64Image,
      size: outputBuffer.length,
      originalSize: buffer.length,
      compressionRatio: ((1 - outputBuffer.length / buffer.length) * 100).toFixed(2) + '%',
      format,
      width: metadata.width,
      height: metadata.height,
      // url, // future: uncomment field returned from upload section
    };
  } catch (error) {
    console.error('Image compression error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};
/**
 * Process multiple images
 * @param {Array} files - Array of multer file objects
 * @param {Object} options - Compression options
 * @returns {Promise<Array>} - Array of processed images (URLs or data URLs for emulator)
 */
const processImages = async (files, options = {}) => {
  if (!files || files.length === 0) {
    return [];
  }
  const processedImages = [];
  for (const file of files) {
    if (!file || !file.buffer || !file.mimetype || file.buffer.length === 0) {
      console.warn('processImages skipped invalid file:', file && file.originalname);
      continue;
    }
    if (!isValidImage(file)) {
      console.warn('processImages rejected file not valid image:', file && file.mimetype, file && file.originalname);
      continue;
    }
    const result = await compressImage(file.buffer, options);
    if (result.success) {
      processedImages.push({
        id: uuidv4(),
        // url: result.url, // for prod Storage use
        data: result.data,
        size: result.size,
        originalSize: result.originalSize,
        compressionRatio: result.compressionRatio,
        originalName: file.originalname,
        mimeType: file.mimetype
      });
    }
  }
  return processedImages;
};
const isValidImage = (file) => {
  const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  return !!(file && allowedMimes.includes(file.mimetype));
};

module.exports = {
  compressImage,
  processImages,
  isValidImage
};
