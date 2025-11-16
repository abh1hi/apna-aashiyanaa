const sharp = require('sharp');
const { v4: uuidv4 } = require('uuid');
const { admin } = require('../config/firebase');

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

/**
 * Compresses an image file.
 *
 * @param {Buffer} fileBuffer - The buffer of the image file.
 * @returns {Promise<object>} An object containing the compressed image data and its size.
 */
const compressImage = async (fileBuffer) => {
  try {
    let buffer = await sharp(fileBuffer)
      .webp({ quality: 80 })
      .toBuffer();

    if (buffer.length > MAX_FILE_SIZE) {
      buffer = await sharp(buffer)
        .resize({ width: 1024, withoutEnlargement: true })
        .toBuffer();
    }

    return { data: buffer, size: buffer.length };
  } catch (error) {
    console.error('Error compressing image:', error);
    throw new Error('Could not process image.');
  }
};


const processAndUploadImage = async (file, path) => {
  if (!file.mimetype.startsWith('image')) {
    throw new Error('File is not an image.');
  }

  const result = await compressImage(file.buffer);
  
  // --- STORAGE UPLOAD SECTION ---
  const bucket = admin.storage().bucket();
  const fileId = uuidv4();
  const filePath = `${path}/${fileId}.webp`;
  const fileUpload = bucket.file(filePath);

  const stream = fileUpload.createWriteStream({
    metadata: {
      contentType: 'image/webp',
    },
    resumable: false
  });

  return new Promise((resolve, reject) => {
    stream.on('error', (err) => {
      console.error('Failure during upload', err);
      reject(new Error('Image upload failed.'));
    });

    stream.on('finish', async () => {
      try {
        await fileUpload.makePublic();
        const publicUrl = `https://storage.googleapis.com/${bucket.name}/${filePath}`;
        
        resolve({
          id: fileId,
          url: publicUrl,
          size: result.size,
          path: filePath,
          originalname: file.originalname,
        });
      } catch (err) {
        console.error('Could not make file public', err);
        reject(new Error('Failed to make image public.'));
      }
    });

    stream.end(result.data);
  });
};


/**
 * Processes and uploads multiple images.
 *
 * @param {Array<object>} files - Array of file objects from multer.
 * @param {string} path - The path in Firebase storage (e.g., 'properties', 'avatars').
 * @returns {Promise<Array<object>>} An array of image metadata objects.
 */
const processImages = async (files, path = 'images') => {
    if (!files || files.length === 0) {
        return [];
    }
  const uploadPromises = files.map(file => processAndUploadImage(file, path));
  return Promise.all(uploadPromises);
};


module.exports = {
  compressImage,
  processImages,
  processAndUploadImage,
};