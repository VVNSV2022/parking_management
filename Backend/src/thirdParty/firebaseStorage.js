require('dotenv').config();
const fs = require('fs');

const {getStorage} = require('firebase-admin/storage');


/**
 *
 * @param {string} userId - unique id of user
 * @param {string} localImagePath - path of the file
 */
async function uploadImage(userId, localImagePath ) {
  try {
    const bucket = getStorage().bucket(process.env.BUCKET_NAME);
    const filepath= `${userId}/profile_photo-${userId}`;
    const filestream = fs.createReadStream(localImagePath);
    const storage = bucket.file(filepath);

    await storage.save(filestream, {
      metadata: {
        contentType: 'image/jpeg',
      },
    });
  } catch (err) {
    console.error('Error uploading image to Firebase Storage: ', err.message);
    throw err;
  }
}

/**
 *
 * @param {string} userId - unique id of the user
 * @return {String} - image in the string format
 */
async function downloadImage(userId) {
  try {
    const bucket = getStorage().bucket(process.env.BUCKET_NAME);
    const filepath = `${userId}/profile_photo-${userId}`;
    const file = bucket.file(filepath);

    const [exists] = await file.exists();
    if (!exists) {
      throw new Error('Image not found in the firebase Storage');
    }

    const [data] = await file.download();

    return data;
  } catch (err) {
    console.error('Error downloading image to Firebase Storage: ', err.message);
    throw err;
  }
}

module.exports = {uploadImage, downloadImage};
