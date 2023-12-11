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
    // console.log(reservationSnapshot);
    if (reservationSnapshot.empty) {
      return [];
    }
    const reservationData=[];
    reservationSnapshot.forEach((doc)=>{
      const docData = doc.data();
      // console.log(docData);
      // console.log(docData.startTime.toDate(), startTime, docData.endTime.toDate(), endTime);
      if (docData.reservationStatus != 'cancelled' && docData.endTime.toDate() >= startTime && docData.startTime.toDate() <= endTime) {
        reservationData.push(docData);
      }
    });
    // console.log(reservationData);
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
 * @param {string} parkingLotID - id of the parkig lot
 * @param {string} toTime - to time
 * @param {string} fromTime - from time
 * @return {result} result
 */
async function getReservationDetailsByTimePeriodAndParkingLot(parkingLotID, toTime, fromTime) {
  try {
    const reservationRef = db.collection('reservations');

    let reservations = await reservationRef.where('parkingLotId', '==', parkingLotID).get();

    reservations = reservations.docs.filter(
      (doc) => doc.data().startTime >= fromTime && doc.data().endTime <= toTime && doc.data().reservationStatus !== 'cancelled'
    );

    const reservationData = [];
    reservations.forEach((doc) => {
      const docData = doc.data();
      reservationData.push(docData);
    });

    return reservationData;
  } catch (err) {
    console.error('Error occurred while getting reservation data from Firebase Firestore: ', err.message);
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

// thirdParty/reservations.firestore.js

/**
 * Checks for overlapping reservations.
 *
 * @param {string} currentReservationID The ID of the current reservation
 * @param {string} parkingLotID The ID of the parking lot to check for overlapping reservations
 * @param {number} currentTime The current time in milliseconds
 * @return {Promise<boolean>} True if there is an overlapping reservation, false otherwise
 */
async function checkOverlappingReservations(currentReservationID, parkingLotID, parkingSpot, currentTime) {
  try {
    const reservationRef = db.collection('reservations');
    const overlappingReservationsSnapshot = await reservationRef
        .where('parkingLotID', '==', parkingLotID)
        .where('parkingSpot', '==', parkingSpot)
        .where('reservationStatus', '!=', 'inactive')
        .get();

    if (overlappingReservationsSnapshot.empty) {
      return false;
    }

    let isOverlap = false;
    overlappingReservationsSnapshot.forEach((doc) => {
      // Skip the current reservation
      if (doc.id === currentReservationID) {
        return;
      }

      const reservation = doc.data();
      const startTime = reservation.startTime.toDate().getTime();
      const endTime = reservation.endTime.toDate().getTime();

      if (currentTime >= startTime && currentTime <= endTime) {
        isOverlap = true;
      }
    });

    return isOverlap;
  } catch (err) {
    console.error('Error occurred while checking overlapping reservations: ', err.message);
    throw err;
  }
}


/**
 * Retrieves the penalty amount for a given parking lot.
 *
 * @param {string} parkingLotID
 * @return {Promise<number>}
 */
async function getPenaltyAmount(parkingLotID) {
  try {
    const parkingLotRef = db.collection('parkingLots').doc(parkingLotID);
    const doc = await parkingLotRef.get();
    if (!doc.exists) {
      console.log('No such parking lot found!');
      return null;
    }
    const parkingLotData = doc.data();
    return parkingLotData.penalties || null;
  } catch (err) {
    console.error('Error occurred while getting penalty amount: ', err.message);
    throw err;
  }
}

async function getReservationsWithinTimeFrame(parkingLotID, fromDate, toDate) {
  try {
    const reservationRef = db.collection('reservations');
    const querySnapshot = await reservationRef
        .where('parkingLotID', '==', parkingLotID)
        .where('startTime', '>=', fromDate)
        .get();

    if (querySnapshot.empty) {
      return [];
    }

    const reservations = [];
    querySnapshot.forEach((doc) => {
      const reservation = doc.data();
      if (reservation.endTime.toDate() <= toDate) {
        reservations.push(reservation);
      }
    });

    return reservations;
  } catch (err) {
    console.error('Error occurred while fetching reservations: ', err.message);
    throw err;
  }
}


module.exports = {addReservation, updateDetails, deleteDetails, getReservationsByTime, hasMaxReservations, hasReservation, getReservation, usersReservations, getAllReservations, checkOverlappingReservations, getPenaltyAmount, getReservationsWithinTimeFrame,getReservationDetailsByTimePeriodAndParkingLot};
