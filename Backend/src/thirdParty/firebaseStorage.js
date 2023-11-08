require('dotenv').config();

const {getStorage} = require('firebase-admin/storage');


/**
 *
 * @param {string} userID - unique id of user
 * @param {string} fileType - type of the file
 * @param {string} filename - name of the file
 * @param {string} fileData - data of the file
 */
async function uploadImage(userID, fileType, filename, fileData ) {
  try {
    const bucket = getStorage().bucket(process.env.BUCKET_NAME);
    const remotefilepath= `${userID}/${filename}`;
    const storage = bucket.file(remotefilepath);

    await storage.save(fileData, {
      metadata: {
        metadata: {
          userID: userID,
          fileType: fileType,
        },
      },
      contentType: fileType,
      validation: 'md5',
    });
    console.log('Image uploaded to Firebase Storage');
    return true;
  } catch (err) {
    console.error('Error uploading image to Firebase Storage: ', err.message);
    if (err.code === 'FILE_NOT_FOUND') {
      console.error('File not found, please check your path');
      return null;
    } else if (err.code === 'UNAUTHORIZED') {
      console.error('Unauthorized, please check your credentials');
      return null;
    }
    throw err;
  }
}

/**
 *
 * @param {string} userID - unique id of the user
 * @param {string} filename - name of the file
 * @return {String} - image in the string format
 */
async function downloadImage(userID, filename) {
  try {
    const bucket = getStorage().bucket(process.env.BUCKET_NAME);
    const filepath = `${userID}/${filename}`;
    const file = bucket.file(filepath);

    const [exists] = await file.exists();
    if (!exists) {
      return null;
    }

    const [data] = await file.download();

    return data;
  } catch (err) {
    console.error('Error downloading image to Firebase Storage: ', err.message);
    if (err.code === 'FILE_NOT_FOUND') {
      console.error('File not found, please check your path');
      return null;
    } else if (err.code === 'UNAUTHORIZED') {
      console.error('Unauthorized, please check your credentials');
      return null;
    }
    throw err;
  }
}

module.exports = {uploadImage, downloadImage};
