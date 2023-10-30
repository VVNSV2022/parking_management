const {getParkingLotID} = require('../thirdParty/parkingLot.firestore');
const {getReservationsByTime} = require('../thirdParty/reservation.firestore');

/**
 *
 * @param {string} parkingLotID - id of the parking lot
 * @return {boolean} result
 */
async function verifyParkingLotID(parkingLotID) {
  try {
    const result = await getParkingLotID(parkingLotID);

    if (result.parkingLotID == parkingLotID) {
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
 * @param {string} parkingLotID
 * @param {number} numberofParkingSpots
 * @param {time} startTime
 * @param {time} endTime
 * @return {object} result
 */
async function verifyAndBookSlot(parkingLotID, numberofParkingSpots, startTime, endTime) {
  try {
    const result = await getReservationsByTime(parkingLotID, startTime, endTime);
    if (result) {
      if (result.size >= numberofParkingSpots) {
        return {message: 'parking lot is fully booked', success: false};
      }
      const reservedSpotNumbers = new Set();
      result.forEach((doc)=>{
        const reservationData = doc.data();
        reservedSpotNumbers.add(reservationData.parking_spot);
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

module.exports = {verifyParkingLotID, verifyAndBookSlot};
