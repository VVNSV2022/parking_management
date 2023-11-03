const {getFirestore} = require('firebase-admin/firestore');

const db = getFirestore();

/**
 *
 * @param {string} parkingLotID - parking lot id
 * @return {object} string
 */
async function getParkingLotID(parkingLotID) {
  try {
    const parkingLotRef = db.collection('ParkingLots').doc(parkingLotID);
    const parkingLotSnapshot = await parkingLotRef.get();

    if (parkingLotSnapshot.exists) {
      const parkingLotData = parkingLotSnapshot.data();
      return parkingLotData;
    } else {
      return null;
    }
  } catch (err) {
    console.error('Error occured while getting parking lot id: ', err.message);
    throw err;
  }
}



module.exports = {getParkingLotID};


