const {getVehicleID} = require('../thirdParty/vehicle.firestore.js');

/**
 * @param {string} userID - user id
 * @param {string} vehicleID - vehicle id
 * @return {object} result
 */
async function verifyVehicleID(userID, vehicleID) {
  try {
    const result = await getVehicleID(userID, vehicleID);
    if (result) {
      return {message: 'vehicle is verified successfully', success: true};
    }
    return {message: 'vehicleID is failed to verify', success: false};
  } catch (err) {
    console.error('Error occred while fetching verifying the vehicleID: ', err.message);
    throw err;
  }
}


module.exports = {verifyVehicleID};
