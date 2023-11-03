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


/**
 *
 * @param {string} regionId - The ID of the region for which we want to retrieve parking lots.
 * @return {object[]} - An array of parking lot data objects in the specified region.
 */
async function getParkingLotsInRegion(regionId) {
  try {
    const parkingLotsRef = db.collection('ParkingLots').where('regionID', '==', regionId);
    const parkingLotsSnapshot = await parkingLotsRef.get();

    if (!parkingLotsSnapshot.empty) {
      const parkingLotsData = [];
      parkingLotsSnapshot.forEach((parkingLotDoc) => {
        const parkingLotData = parkingLotDoc.data();
        parkingLotsData.push(parkingLotData);
      });
      console.log(parkingLotsData);
      return parkingLotsData;
    } else {
      return [];
    }
  } catch (err) {
    console.error('Error occurred while getting parking lots in the region: ', err.message);
    throw err;
  }
}

module.exports = {getParkingLotID, getParkingLotsInRegion};
