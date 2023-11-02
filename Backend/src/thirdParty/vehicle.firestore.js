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
    }
    return null;
  } catch (err) {
    console.error('Error occured while getting the paymentID from firestore: ', err.message);
    throw err;
  }
}


module.exports = {getVehicleID};
