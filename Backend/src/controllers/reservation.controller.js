const {v4: uuidv4} = require('uuid');

const {addReservation} = require('../thirdParty/reservation.firestore.js');
const {verifyPaymentID, checkMembershipStatus} = require('../controllers/payment.controller.js');
const {verifyParkingLotID, verifyAndBookSlot} = require('../controllers/parkingLot.controller.js');
const {verifyVehicleID} = require('../controllers/vehicle.controller.js');
const {currentFirestoreTimestamp} = require('../utilities/util.js');


/**
 *
 * @param {string} userID
 * @param {string} startTime
 * @param {string} endTime
 * @param {string} parkingLotID
 * @param {string} price
 * @param {string} permitType
 * @param {string} vehicleID
 * @param {string} paymentID
 * @param {string} membershipID
 * @return {object} result
 */
async function createReservation(userID, startTime, endTime, parkingLotID, price, permitType, vehicleID, paymentID='', membershipID='') {
  try {
    // price verify
    // check the membership ID
    // permit validy for this reservation
    // check to count number of reservations user can make for a day
    startTime = new Date(startTime);
    endTime = new Date(endTime);

    if (!((endTime>startTime) && (startTime.getTime()>new Date().getTime()))) { // also set time limit upto 7days something
      return {message: 'Invalid Times are sent', success: false};
    }
    const parsedPrice = parseFloat(price).toFixed(2);

    if (isNaN(parsedPrice)) {
      return {message: 'invalid amount type', success: false};
    }
    const parkingLotResult = await verifyParkingLotID(parkingLotID);
    if (!parkingLotResult) {
      return {message: 'Invalid parkingLot ID', success: false};
    }

    const vehicleResult = await verifyVehicleID(userID, vehicleID);
    if (!vehicleResult.success) {
      return {message: 'Invalid Vehicle ID', success: false};
    }

    // either membersip ID or paymentID
    if (membershipID) {
      const membershipResult = await checkMembershipStatus(userID, parkingLotResult.regionID, parkingLotResult.parkingLotRank);
      if (!membershipResult.success) {
        return {message: membershipResult.message, success: false};
      }
    } else {
      const paymentResult = await verifyPaymentID(paymentID);
      if (!paymentResult.success) {
        return {message: 'Invalid payment ID', success: false};
      }
    }

    const parkingSpotResult = await verifyAndBookSlot(parkingLotID, parkingLotResult.numberOfParkingSpots, startTime, endTime);
    if (!parkingSpotResult.success) {
      return {message: parkingSpotResult.message, success: false};
    }

    const reservationID = uuidv4();
    const reservationData = {
      reservationID: reservationID,
      userID: userID,
      startTime: startTime,
      endTime: endTime,
      parkingLotID: parkingLotID,
      price: parsedPrice,
      permitType: permitType,
      paymentID: [paymentID],
      vehicleID: vehicleID,
      parkingSpot: parkingSpotResult.parkingSpot,
      reservationCreatedTime: currentFirestoreTimestamp(),
      reservationStatus: 'inactive',
      paymentStatus: 'incomplete',
    };
    const result = await addReservation(reservationID, reservationData);
    if (result) {
      return {message: 'Successfully made the reservation', success: true, data: result.id};
    }
    return {message: 'Failed to make the reservation', success: false};
  } catch (err) {
    console.error('Error occured while creating the reservation: ', err.message);
    throw err;
  }
}


module.exports = {createReservation};
