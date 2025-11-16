const { v4: uuidv4 } = require('uuid');
const admin = require('firebase-admin');

/**
 * Upload image directly to Firebase Storage without compression.
 * Uses Firebase Admin SDK's save method for simplicity and reliability.
 */
const processAndUploadImage = async (file, path) => {
  if (!file.mimetype || !file.mimetype.startsWith('image')) {
    throw new Error('File is not an image.');
  }

  try {
    console.log(`[processAndUploadImage] Starting upload for ${file.originalname}`);
    const bucket = admin.storage().bucket();
    const fileId = uuidv4();
    const ext = (file.originalname && file.originalname.split('.').pop()) || 'jpg';
    const filePath = `${path}/${fileId}.${ext}`;

    console.log(`[processAndUploadImage] Uploading to: ${filePath} (size=${file.buffer.length}, mime=${file.mimetype})`);

    // Upload using save method (simpler and more reliable than createWriteStream)
    await bucket.file(filePath).save(file.buffer, {
      metadata: {
        contentType: file.mimetype,
      },
    });

    console.log(`[processAndUploadImage] ✓ Upload successful: ${filePath}`);

    // Make file public
    try {
      await bucket.file(filePath).makePublic();
      const publicUrl = `https://storage.googleapis.com/${bucket.name}/${filePath}`;
      console.log(`[processAndUploadImage] ✓ File made public: ${publicUrl}`);
      
      return {
        id: fileId,
        url: publicUrl,
        size: file.buffer.length,
        path: filePath,
        originalname: file.originalname,
        public: true,
      };
    } catch (publicErr) {
      console.warn(`[processAndUploadImage] ⚠ Could not make file public: ${publicErr.message}`);
      // Return gs:// URL if makePublic fails (file still uploaded)
      const gsPath = `gs://${bucket.name}/${filePath}`;
      return {
        id: fileId,
        url: gsPath,
        size: file.buffer.length,
        path: filePath,
        originalname: file.originalname,
        public: false,
      };
    }
  } catch (error) {
    console.error(`[processAndUploadImage] ✗ Error uploading image: ${error.message}`, error.stack);
    throw error;
  }
};


/**
 * Processes and uploads multiple images.
 *
 * @param {Array} files - Array of file objects from multer.
 * @param {string} path - The path in Firebase storage.
 * @returns {Promise<Array>} An array of image metadata objects.
 */
const processImages = async (files, path = 'images') => {
  if (!files || files.length === 0) {
    return [];
  }
  const uploadPromises = files.map(file => processAndUploadImage(file, path));
  return Promise.all(uploadPromises);
};


module.exports = {
  processImages,
  processAndUploadImage,
};