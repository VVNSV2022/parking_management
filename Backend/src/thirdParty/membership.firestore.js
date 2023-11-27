const {getFirestore} = require('firebase-admin/firestore');


const db = getFirestore();

/**
 *
 * @param {string} membershipID
 * @param {object} data
 * @return {object} - result
 */
async function createMembership(membershipID, data) {
  try {
    const docRef = db.collection('memberships').doc(membershipID);
    await docRef.set(data);
    return docRef;
  } catch (err) {
    console.error('Error occured while writing to the firebase firestore: ', err.message);
    throw err;
  }
}

/**
 *
 * @param {string} regionID - The regionID of the region whose memberships are to be fetched
 * @return {object} - result
 */
async function getRegionMemberships(regionID) {
  try {
    const docRef = await db.collection('region').where('regionID', '==', regionID).get();
    if (docRef.empty) {
      console.error('No such document!');
      return null;
    }
    const membershipData = [];
    docRef.forEach((doc) => {
      const regionData = doc.data();
      console.log('regionData: ', regionData);
      membershipData.push(regionData);
    });
    return membershipData;
  } catch (err) {
    console.error('Error occured while reading from the firebase firestore: ', err.message);
    throw err;
  }
}

/**
 *
 * @param {string} regionID - The regionID of the region whose parking lot is to be fetched
 * @return {object} - result
 */
async function getParkingLotByRegion(regionID) {
  try {
    const docRef = db.collection('ParkingLots').where('regionID', '==', regionID);
    const docs = await docRef.get();
    if (docs.empty) {
      console.error('No such document!');
      return null;
    }
    const parkingLots = {GOLD: [], SILVER: [], PLATINUM: []};
    docs.forEach((doc) => {
      const parkingLotData = doc.data();
      console.log('parkingLotData: ', parkingLotData);
      parkingLots[doc.data().parkingLotRank].push(doc.data());
    });
    return parkingLots;
  } catch (err) {
    console.error('Error occured while reading from the firebase firestore: ', err.message);
    throw err;
  }
}

module.exports = {createMembership, getRegionMemberships, getParkingLotByRegion};
