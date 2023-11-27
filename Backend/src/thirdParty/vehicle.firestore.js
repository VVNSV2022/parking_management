const {getFirestore} = require('firebase-admin/firestore');

const db = getFirestore();

/**
 *
 * @param {string} userID - user ID
 * @param {string} vehicleID - vehicle ID
 * @return {object} vehicle Data
 */
async function getVehicleID(userID, vehicleID) {
  try {
    const vehicleIDRef = db.collection('vehicles').doc(vehicleID);
    const vehicleIDSnapshot = await vehicleIDRef.get();

    if (vehicleIDSnapshot.exists) {
      const vehicleIDData = vehicleIDSnapshot.data();
      if (vehicleIDData.userID === userID) {
        return vehicleIDData;
      }
      return false;
    }
    return null;
  } catch (err) {
    console.error('Error occured while getting the vehicleID from firestore: ', err.message);
    throw err;
  }
}

/**
 *
 * @param {string} userID
 * @return {object} result
 */
async function getVehicles(userID) {
  try {
    const vehicleIDRef = db.collection('vehicles').where('userID', '==', userID);
    const vehicleIDSnapshot = await vehicleIDRef.get();
    if (vehicleIDSnapshot.empty) {
      return false;
    }
    const vehicleIDData = [];
    vehicleIDSnapshot.forEach((doc) => {
      vehicleIDData.push(doc.data());
    });
    return vehicleIDData;
  } catch (err) {
    console.error('Error occured while getting the vehicleID from firestore: ', err.message);
    throw err;
  }
}

/**
 *
 * @param {string} VIN - vehicle identification number
 * @return {boolean} result
 */
async function checkVehicleExists(VIN) {
  try {
    const vehicleIDRef = db.collection('vehicles').where('VIN', '==', VIN);
    const vehicleIDSnapshot = await vehicleIDRef.get();
    if (vehicleIDSnapshot.empty) {
      return false;
    }
    const vehicleIDData = [];
    vehicleIDSnapshot.forEach((doc) => {
      vehicleIDData.push(doc.data());
    });
    return vehicleIDData;
  } catch (err) {
    console.error('Error occured while checking the vehicle exists in firestore: ', err.message);
    throw err;
  }
}

/**
 *
 * @param {object} data
 * @return {boolean} result
 */
async function addVehicle(data) {
  try {
    const vehicleIDRef = db.collection('vehicles').doc(data.vehicleID);
    await vehicleIDRef.set(data);
    return true;
  } catch (err) {
    console.error('Error occured while adding the vehicle to firestore: ', err.message);
    throw err;
  }
}

/**
 *
 * @param {string} vehicleID
 * @return {boolean} result
 */
async function removeVehicle(vehicleID) {
  try {
    const documentRef = db.collection('vehicles').doc(vehicleID);
    await documentRef.delete();
    console.log('Document successfully removed');
    return true;
  } catch (err) {
    console.error('Error occured while removing the vehicle from firestore: ', err.message);
    throw err;
  }
}
module.exports = {getVehicleID, addVehicle, checkVehicleExists, getVehicles, removeVehicle};
