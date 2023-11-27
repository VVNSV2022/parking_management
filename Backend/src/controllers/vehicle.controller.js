const {v4: uuidv4} = require('uuid');

const {getVehicleID, addVehicle, checkVehicleExists, getVehicles, removeVehicle} = require('../thirdParty/vehicle.firestore.js');
const {getUser} = require('./users.controller');

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

/**
 *
 * @param {string} userID
 * @param {string} vehicleID
 * @return {object} result
 */
async function getVehicleByID(userID, vehicleID) {
  try {
    const result = await getVehicleID(userID, vehicleID);
    if (result) {
      return {message: 'vehicle data is successfully retrieved', success: true, data: result};
    }
    return {message: 'vehicle data is failed to retrieve', success: false};
  } catch (err) {
    console.error('Error occred while fetching verifying the vehicleID: ', err.message);
    throw err;
  }
}

/**
 *
 * @param {string} userID
 * @return {object} result
 */
async function getVehiclesByUser(userID) {
  try {
    const result = await getVehicles(userID);
    if (result) {
      return {message: 'vehicle data is successfully retrieved', success: true, data: result};
    }
    return {message: 'vehicle data is failed to retrieve', success: false};
  } catch (err) {
    console.error('Error occred while fetching verifying the vehicleID: ', err.message);
    throw err;
  }
}

/**
 *
 * @param {string} userID - user id
 * @param {string} licensePlateNumber - license plate number
 * @param {string} vehicleMake - vehicle make
 * @param {string} vehicleModel - vehicle model
 * @param {string} vehicleColor - vehicle color
 * @param {string} vehicleYear - vehicle year
 * @param {string} VIN - vehicle identification number
 * @param {string} ownersName - owners name
 * @param {string} isVehicleInsured - is vehicle insured
 * @param {string} isRental - is rental
 * @return {object} result
 */
async function addNewVehicle(userID, licensePlateNumber, vehicleMake, vehicleModel, vehicleColor, vehicleYear, VIN, ownersName, isVehicleInsured, isRental) {
  try {
    const checkLicensePlateNumber = /^[A-Za-z0-9]{1,7}$/.test(licensePlateNumber);
    const checkVehicleMake = /^[A-Za-z\s]{1,50}$/.test(vehicleMake);
    const checkVehicleModel = /^[A-Za-z0-9\s]{1,50}$/.test(vehicleModel);
    const checkVehicleColor = /^[A-Za-z\s]{1,20}$/.test(vehicleColor);
    const checkVehicleYear = /^(19|20)\d{2}$/.test(vehicleYear);
    const checkVIN = /^[A-HJ-NPR-Z0-9]{17}$/.test(VIN);
    const checkOwnersName = /^[A-Za-z\s]{1,50}$/.test(ownersName);

    // console.log(checkLicensePlateNumber, checkVehicleMake, checkVehicleModel, checkVehicleColor, checkVehicleYear, checkVIN, checkOwnersName);
    if (!checkVehicleMake || !checkVehicleModel || !checkVehicleColor || !checkOwnersName) {
      return {message: 'Invalid input', success: false};
    }
    // if ((isVehicleInsured === true || isVehicleInsured === false) && (isRental === true || isRental === false)) {
    //   return {message: 'Invalid input', success: false};
    // }
    // check if the userID existed
    const userResult = await getUser(userID, '');
    if (!userResult) {
      return {message: 'user does not exists in our app', success: false};
    }
    const vehicleID = uuidv4();
    const data = {
      userID: userID,
      vehicleID: vehicleID,
      licensePlateNumber: licensePlateNumber,
      vehicleMake: vehicleMake,
      vehicleModel: vehicleModel,
      vehicleColor: vehicleColor,
      vehicleYear: vehicleYear,
      VIN: VIN,
      ownersName: ownersName,
      isVehicleInsured: isVehicleInsured,
      isRental: isRental,
    };
    const checkVehicleID = await checkVehicleExists(VIN);
    if (checkVehicleID && checkVehicleID[0].userID === userID) {
      return {message: 'vehicle already exists in our app', success: false};
    }
    const result = await addVehicle(data);
    if (result) {
      return {message: 'vehicle is added successfully', success: true};
    }
    return {message: 'vehicle is failed to add', success: false};
  } catch (err) {
    console.error('Error occred while adding the vehicleID: ', err.message);
    throw err;
  }
}

/**
 *
 * @param {string} userID
 * @param {string} vehicleID
 * @return {object} result
 */
async function deleteVehicle(userID, vehicleID) {
  try {
    const checkVehicleID = await getVehicleID(userID, vehicleID);
    if (checkVehicleID === false) {
      return {message: 'you do not have this vehicle ID', success: false};
    }
    if ( checkVehicleID === null) {
      return {message: 'vehicle ID does not exist', success: false};
    }
    const result = await removeVehicle(vehicleID);
    if (result) {
      return {message: 'vehicle is deleted successfully', success: true};
    }
    return {message: 'vehicle is failed to delete', success: false};
  } catch (err) {
    console.error('Error occred while deleting the vehicleID: ', err.message);
    throw err;
  }
}

module.exports = {verifyVehicleID, addNewVehicle, getVehicleByID, getVehiclesByUser, deleteVehicle};
