const {getParkingLotID, getRegions, getParkingLotsInRegion} = require('../thirdParty/parkingLot.firestore');
const {getReservationsByTime} = require('../thirdParty/reservation.firestore');

/**
 *
 * @param {string} parkingLotID - id of the parking lot
 * @return {boolean} result
 */
async function verifyParkingLotID(parkingLotID) {
  try {
    const result = await getParkingLotID(parkingLotID);
    if (result && (result.parkingLotID == parkingLotID)) {
      return result;
    }
    return false;
  } catch (err) {
    console.error('Error occured while verifying the parking lotID: ', err.message);
    throw err;
  }
}

/**
 *
 * @param {string} regionId - The ID of the region to fetch data for.
 * @return {object} - An object containing a list of regions with region IDs and parking lots under each region.
 */
async function getRegionsAndParkingLots(regionId) {
  try {
    const parkingLots = await getParkingLotsInRegion(regionId);
    return {
      message: 'successfully fetched all regions and parking lots',
      regionId: regionId,
      parkingLots: parkingLots,
      success: true,
    };
  } catch (error) {
    console.error('Error occurred while fetching regions and parking lots: ', error.message);
    throw error;
  }
}

/**
 *
 * @param {string} userID
 * @param {string} parkingLotID
 * @param {number} numberofParkingSpots
 * @param {time} startTime
 * @param {time} endTime
 * @return {object} result
 */
async function verifyAndBookSlot(userID, parkingLotID, numberofParkingSpots, startTime, endTime) {
  try {
    const result = await getReservationsByTime(parkingLotID, startTime, endTime);
    if (result) {
      if (result.size >= numberofParkingSpots) {
        return {message: 'parking lot is fully booked', success: false};
      }
      const reservedSpotNumbers = new Set();
      result.forEach((reservationData)=>{
        reservedSpotNumbers.add(reservationData.parkingSpot);
      });
      let availableSpotNumber;
      do {
        availableSpotNumber = Math.floor(Math.random() * numberofParkingSpots) + 1;
      } while (reservedSpotNumbers.has(availableSpotNumber));
      return {message: 'successfully holded the parking slot', success: true, parkingSpot: availableSpotNumber};
    }
    return {message: 'error occured while booking the slot', success: false};
  } catch (err) {
    console.error('Error occured while verifying and booking the slot: ', err.message);
    throw err;
  }
}

/**
 *
 * @return {object} regions
 */
async function getAllRegions() {
  try {
    const regions = await getRegions();
    if (regions) {
      return {message: 'successfully fetched all regions', success: true, regions: regions};
    }
    return {message: 'did not find any regions', success: false};
  } catch (err) {
    console.error('Error occured while fetching all regions: ', err.message);
    throw err;
  }
}

module.exports = {verifyParkingLotID, verifyAndBookSlot, getRegionsAndParkingLots, getAllRegions};
