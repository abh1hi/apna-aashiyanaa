import { app } from '../firebaseConfig';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';

const storage = getStorage(app);

/**
 * Uploads one or more images to a specified path in Firebase Storage.
 *
 * @param {File[]} files - An array of File objects to upload.
 * @param {string} path - The storage path to upload the files to (e.g., 'properties').
 * @returns {Promise<string[]>} A promise that resolves to an array of public download URLs.
 */
export const uploadImages = async (files, path) => {
  if (!files || files.length === 0) {
    return [];
  }

  const uploadPromises = files.map(file => {
    // Create a unique filename to prevent overwrites
    const fileExtension = file.name.split('.').pop();
    const uniqueFileName = `${uuidv4()}.${fileExtension}`;
    const storageRef = ref(storage, `${path}/${uniqueFileName}`);

    return uploadBytes(storageRef, file).then(snapshot => {
      return getDownloadURL(snapshot.ref);
    });
  });

  try {
    const downloadURLs = await Promise.all(uploadPromises);
    return downloadURLs;
  } catch (error) {
    console.error("Error uploading images:", error);
    throw new Error("Could not upload images. Please try again.");
  }
};
