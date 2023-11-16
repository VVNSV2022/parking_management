const {getFirestore} = require('firebase-admin/firestore');


const db = getFirestore();

/**
 *
 * @param {string} reservationID
 * @return {object} result
 */
async function findExtension(reservationID) {
  try {
    const docRef = db.collection('extensions').doc(reservationID);
    const doc = await docRef.get();
    if (!doc.exists) {
      return null;
    }
    return doc.data();
  } catch (err) {
    console.error('Error occured while getting the data to the firebase firestore: ', err.message);
    throw err;
  }
}

/**
 *
 * @param {string} reservationID
 * @param {object} data
 * @return {object} result
 */
async function addExtension(reservationID, data) {
  try {
    const docRef = db.collection('extensions').doc(reservationID);
    await docRef.set(data);
    return docRef;
  } catch (err) {
    console.error('Error occured while writing to the firebase firestore: ', err.message);
    throw err;
  }
}

/**
 *
 * @param {string} reservationID
 * @param {object} updatedData
 * @return {object} result
 */
async function updateExtension(reservationID, updatedData) {
  try {
    const docRef = db.collection('extensions').doc(reservationID);
    await docRef.set(updatedData, {merge: true});
    return docRef;
  } catch (err) {
    console.error('Error occured while updating the data to the firebase firestore: ', err.message);
    throw err;
  }
}

module.exports = {findExtension, addExtension, updateExtension};
