const {getFirestore} = require('firebase-admin/firestore');


const db = getFirestore();

/**
 *
 * @param {string} collectionName - name of the table
 * @param {string} docName - row name
 * @param {object} data - all the data
 * @return {object} reference to the data object
 */
async function writeData(collectionName, docName, data) {
  try {
    const docRef = await db.collection(collectionName).doc(docName).set(data);
    return docRef;
  } catch (err) {
    console.error('Error occured while writing to the firebase firestore: ', err.message);
    throw err;
  }
}

/**
 *
 * @param {string} reservationId - reservation id of the reservation
 * @param {object} data - reservation data
 * @return {object} reservation document
 */
async function addReservation(reservationId, data) {
  try {
    const docRef = await db.collection('reservations').doc(reservationId).set(data);
    return docRef;
  } catch (err) {
    console.error('Error occured while writing to the firebase firestore: ', err.message);
    throw err;
  }
}

async function getParkingLotCount(){
  try {
<<<<<<< HEAD
    const docRef = await db.collection('reservations').
=======
    const docRef = await db.collection('reservations');
>>>>>>> 9e7eb84 (Customer subgroup commit)
    return docRef;
  } catch (err) {
    console.error('Error occured while writing to the firebase firestore: ', err.message);
    throw err;
  }
}


modules.export = {writeData, addReservation};
