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
 * @param {string} reservationID - reservation id
 * @param {object} updatedData - reservation data
 * @return {object} - result
 */
async function updateDetails(reservationID, updatedData) {
  try {
    const docRef = db.collection('reservations').doc(reservationID);
    await docRef.set(updatedData, {merge: true});
    return docRef;
  } catch (err) {
    console.error('Error occured while updating the data to the firebase firestore: ', err.message);
    throw err;
  }
}

/**
 *
 * @param {string} reservationID - reservation id
 * @return {object} - result
 */
async function deleteDetails(reservationID) {
  try {
    const docRef = db.collection('reservations').doc(reservationID);
    await docRef.set({reservationStatus: 'cancelled'}, {merge: true});
    return docRef;
  } catch (err) {
    console.error('Error occured while updating the data to the firebase firestore: ', err.message);
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
    // .and('end_time', '>', startTime).and('reservationStatus', '!=', 'cancelled').get();
    console.log(reservationSnapshot);
    if (reservationSnapshot.empty) {
      return [];
    }
    const reservationData=[];
    reservationSnapshot.forEach((doc)=>{
      const docData = doc.data();
      console.log(docData);
      console.log(docData.startTime.toDate(), startTime, docData.endTime.toDate(), endTime);
      if (docData.reservationStatus != 'cancelled' && docData.endTime.toDate() >= startTime && docData.startTime.toDate() <= endTime) {
        reservationData.push(docData);
      }
    });
    console.log(reservationData);
    return reservationData;
  } catch (err) {
    console.error('Error occured while getting reservations from the firebase firestore: ', err.message);
    throw err;
  }
}

/**
 *
 * @param {*} userID
 * @param {*} startTime
 * @param {*} endTime
 * @param {*} maxReservations
 * @return {object} result
 */
async function hasMaxReservations(userID, startTime, endTime, maxReservations) {
  try {
    const reservationRef = db.collection('reservations');
    const reservationSnapshot = await reservationRef.where('userID', '==', userID).get();
    if (reservationSnapshot.empty) {
      return null;
    }
    const reservationData=[];
    reservationSnapshot.forEach((doc)=>{
      const docData = doc.data();
      if (docData.reservationStatus != 'cancelled' && docData.endTime.toDate() <= endTime && docData.startTime.toDate() >= startTime) {
        reservationData.push(docData);
      }
    });
    if (reservationData.length >= maxReservations) {
      return true;
    }
    return false;
  } catch (err) {
    console.error('Error occured while getting reservations from the firebase firestore: ', err.message);
    throw err;
  }
}

/**
 * Check if user has already booked a reservation in the given time interval
 * @param {string} userID
 * @param {Date} startTime
 * @param {Date} endTime
 * @return {boolean} true if user has already booked a reservation, false otherwise
 */
async function hasReservation(userID, startTime, endTime) {
  try {
    const reservationsRef = db.collection('reservations');
    const reservationsSnapshot = await reservationsRef.where('userID', '==', userID).get();
    if (reservationsSnapshot.empty) {
      return false;
    }
    let status = false;
    reservationsSnapshot.forEach((doc)=>{
      const docData = doc.data();
      console.log(docData.endTime.toDate(), docData.startTime.toDate(), startTime, endTime);
      console.log(docData.reservationStatus != 'cancelled' && docData.endTime.toDate() >= startTime && docData.startTime.toDate() <= endTime);
      if (docData.reservationStatus != 'cancelled' && docData.endTime.toDate() >= startTime && docData.startTime.toDate() <= endTime) {
        status = true;
      }
    },
    );
    if (status) {
      return true;
    }
    return false;
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
      return null;
    }
    const reservationData=[];
    reservationSnapshot.forEach((doc)=>{
      const docData = doc.data();
      if (docData.reservationStatus != 'cancelled') {
        reservationData.push(docData);
      }
    });
    return reservationData;
  } catch (err) {
    console.error('Error occured while getting reservations from the firebase firestore: ', err.message);
    throw err;
  }
}

/**
 *
 * @param {string} reservationID
 * @return {result} result
 */
async function getReservation(reservationID) {
  try {
    const reservationRef = db.collection('reservations');
    const reservationSnapshot = await reservationRef.where('reservationID', '==', reservationID).get();

    if (reservationSnapshot.empty) {
      return null;
    }
    const reservationData=[];
    reservationSnapshot.forEach((doc)=>{
      const docData = doc.data();
      if (docData.reservationStatus != 'cancelled') {
        reservationData.push(docData);
      }
    });
    if (reservationData.length === 0) {
      return null;
    }
    return reservationData;
  } catch (err) {
    console.error('Error occured while getting reservatio ndata from the firebase firestore: ', err.message);
    throw err;
  }
}

/**
 *
 * @return {result} result
 */
async function getAllReservations() {
  try {
    const reservationRef = db.collection('reservations');
    const reservationSnapshot = await reservationRef.get();

    if (reservationSnapshot.empty) {
      return null;
    }

    const reservationData = [];

    reservationSnapshot.forEach((doc) => {
      const docData = doc.data();
      if (docData.reservationStatus != 'cancelled') {
        reservationData.push(docData);
      }
    });

    return reservationData;
  } catch (err) {
    console.error('Error occurred while getting reservation data from the Firebase Firestore: ', err.message);
    throw err;
  }
}

module.exports = {addReservation, updateDetails, deleteDetails, getReservationsByTime, hasMaxReservations, hasReservation, getReservation, usersReservations,getAllReservations};
