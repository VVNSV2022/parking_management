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
 * Get all the regions
 * @return {object} regions
 */
async function getRegions() {
  try {
    const regionsRef = db.collection('region');
    const regionsSnapshot = await regionsRef.get();

    if (regionsSnapshot.empty) {
      console.log('No matching documents');
      return null;
    }

    const regions = [];
    regionsSnapshot.forEach((doc) => {
      regions.push(doc.data());
    });
    return regions;
  } catch (err) {
    console.error('Error occured while getting regions: ', err.message);
    throw err;
  }
}

async function getParkingLotsInRegion(regionId) {
  try {
    const parkingLotsRef = db.collection('ParkingLots');
    const parkingLotsSnapshot = await parkingLotsRef.where('regionID', '==', regionId).get();

    if (parkingLotsSnapshot.empty) {
      console.log('No matching documents');
      return null;
    }
    const parkingLots = [];
    parkingLotsSnapshot.forEach((doc) => {
      parkingLots.push(doc.data());
    });
    console.log(parkingLots)
    return parkingLots;
  } catch (err) {
    console.error('Error occured while getting parking lots in region: ', err.message);
    throw err;
  }
}

async function getParkingLots() {
  try {
    const parkingLotRef = db.collection('ParkingLots');
    const parkingLotSnapshot = await parkingLotRef.get();
    if (parkingLotSnapshot.empty) {
      return null;
    }
    const parkingLotData = [];

    parkingLotSnapshot.forEach((doc) => {
      const docData = doc.data();
        parkingLotData.push(docData);
    });

    return parkingLotData;
  
  } catch (err) {
    console.error('Error occured while getting parking lot', err.message);
    throw err;
  }
}


module.exports = {getParkingLotID, getRegions, getParkingLotsInRegion,getParkingLots};
