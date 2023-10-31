const {getFirestore} = require('firebase-admin/firestore');


const db = getFirestore();

/**
 *
 * @param {string} reservationID - reservation id
 * @param {object} data - reservation data
 * @return {object} - result
 */
async function addReservation(reservationID, data) {
  try {
    const docRef = db.collection('reservations').doc(reservationID);
    await docRef.set(data);
    return docRef;
  } catch (err) {
    console.error('Error occured while writing to the firebase firestore: ', err.message);
    throw err;
  }
}

/**
 *
 * @param {string} parkingLotID
 * @param {time} startTime
 * @param {time} endTime
 * @return {object} result
 */
async function getReservationsByTime(parkingLotID, startTime, endTime) {
  try {
    const reservationRef = db.collection('reservations');
    const reservationSnapshot = await reservationRef.where('parkingLotID', '==', parkingLotID).get();
    // and('start_time', '<', endTime).and('end_time', '>', startTime).and('reservationStatus', '!=', 'cancelled').get();
    console.log(reservationSnapshot);
    if (reservationSnapshot.empty) {
      return [];
    }
    return reservationSnapshot;
  } catch (err) {
    console.error('Error occured while getting reservations from the firebase firestore: ', err.message);
    throw err;
  }
}

/**
 *
 * @param {string} userID - id of the user
 * @return {object} result
 */
async function usersReservations(userID) {
  try {
    const reservationRef = db.collection('reservations');
    const reservationSnapshot = await reservationRef.where('userID', '==', userID).get();

    if (reservationSnapshot.empty) {
      return [];
    }
    const reservationData=[];
    reservationSnapshot.forEach((doc)=>{
      reservationData.push(doc.data());
    });
    return reservationData;
  } catch (err) {
    console.error('Error occured while getting reservations from the firebase firestore: ', err.message);
    throw err;
  }
}

module.exports = {addReservation, getReservationsByTime, usersReservations};
