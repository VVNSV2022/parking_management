const {v4: uuidv4} = require('uuid');

const {addReservation, usersReservations, getReservation, updateDetails, deleteDetails} = require('../thirdParty/reservation.firestore.js');
const {makePayment, checkMembershipStatus, refundPaidPayment} = require('./payment.controller.js');
const {verifyParkingLotID, verifyAndBookSlot} = require('./parkingLot.controller.js');
const {verifyVehicleID} = require('./vehicle.controller.js');
const {getUser} = require('./users.controller');

const {currentFirestoreTimestamp} = require('../utilities/util.js');


/**
 *
 * @param {*} userID
 * @param {*} startTime
 * @param {*} endTime
 * @param {*} parkingLotID
 * @param {*} price
 * @param {*} permitType
 * @param {*} vehicleID
 * @param {*} paymentID
 * @param {*} paymentType
 * @param {*} paymentMethod
 * @return {object} result
 */
async function createReservation(userID, startTime, endTime, parkingLotID, price, permitType, vehicleID, paymentID='', paymentType='card', paymentMethod='new') {
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
    if (!['membership', 'hourly', 'daily'].includes(permitType)) {
      return {message: 'invalid permit type', success: false};
    }
    const parkingLotResult = await verifyParkingLotID(parkingLotID);
    if (!parkingLotResult) {
      return {message: 'Invalid parkingLot ID', success: false};
    }

    const vehicleResult = await verifyVehicleID(userID, vehicleID);
    if (!vehicleResult.success) {
      return {message: 'Invalid Vehicle ID', success: false};
    }
    const userResult = await getUser(userID, '');
    if (!userResult) {
      return {message: 'user does not exists in our app', success: false};
    }

    // if it comes here every detail sent is valid except the payment
    const membershipID = '';
    let paymentNumber = '';
    if (permitType === 'membership') {
      const membershipResult = await checkMembershipStatus(userID, parkingLotResult.regionID, parkingLotResult.parkingLotRank);
      if (!membershipResult.success) {
        return {message: membershipResult.message, success: false};
      }
    } else {
      
      let savePaymentMethodID=' '; let newPaymentMethodID=' '; let newPaymentMethodType='';
      if (paymentMethod === 'saved') {
        savePaymentMethodID = paymentID;
      } else if (paymentMethod === 'new') {
        newPaymentMethodID = paymentID;
        newPaymentMethodType = paymentType;
      }
      const result = await makePayment(userID, price, 'making payment for the reservation', savePaymentMethodID, newPaymentMethodID, newPaymentMethodType );
      paymentNumber = result.id;
      if (!result.success) {
        return {message: 'Invalid payment', success: false};
      }
    }
    // if it comes here then payment is verified
    const parkingSpotResult = await verifyAndBookSlot(parkingLotID, parkingLotResult.numberOfParkingSpots, startTime, endTime);
    if (!parkingSpotResult.success) {
      return {message: parkingSpotResult.message, success: false};
    }
    // if it comes here then parking spot is booked
    const reservationID = uuidv4();
    const reservationData = {
      reservationID: reservationID,
      userID: userID,
      startTime: startTime,
      endTime: endTime,
      parkingLotID: parkingLotID,
      price: parsedPrice,
      permitType: permitType,
      paymentID: [membershipID? membershipID: paymentNumber],
      vehicleID: vehicleID,
      parkingSpot: parkingSpotResult.parkingSpot,
      reservationCreatedTime: currentFirestoreTimestamp(),
      reservationStatus: 'inactive',
      paymentStatus: 'incomplete',
    };
    // adding the reservation into the database
    const result = await addReservation(reservationID, reservationData);
    if (result) {
      return {message: 'Successfully made the reservation', data: result, success: true, data: result.id};
    }
    return {message: 'Failed to make the reservation', success: false};
  } catch (err) {
    console.error('Error occured while creating the reservation: ', err.message);
    throw err;
  }
}

/**
 *
 * @param {string} userID
 * @param {string} reserationID
 * @param {string} startTime
 * @param {string} endTime
 * @param {string} vehicleID
 * @return {object} result
 */
async function updateReservation(userID, reserationID, startTime='', endTime='', vehicleID='') {
  try {
    // getReservationID details
    // verify the userID will actual userID
    // change the updated details for that userID
    const result = await getReservation(reserationID);
    if (!result) {
      return {message: 'we cannot find the reservation id in our database', success: false};
    }
    if (!(result[0].userID === userID)) {
      return {message: 'you do not have access to edit this reservation', success: false};
    }
    const newData = {};
    if (startTime) {
      startTime = new Date(startTime);
      if (startTime < new Date()) {
        return {message: 'start time already finished', success: false};
      }
      newData.startTime = startTime;
    }
    if (endTime) {
      endTime = new Date(endTime);
      if (endTime < new Date()) {
        return {message: 'end time is already finished', success: false};
      }
      newData.endTime = endTime;
    }
    // check if the new start time and end times are correct

    if (vehicleID) {
      const vehicleResult = await verifyVehicleID(userID, vehicleID);
      if (!vehicleResult.success) {
        return {message: 'Invalid Vehicle ID', success: false};
      }
      newData.vehicleID = vehicleID;
    }

    const updatedResult = await updateDetails(reservationID, newData);
    if (updatedResult) {
      return {message: 'Successfully updated the reservation', success: true};
    }
    return {message: 'Failed to update the reservation', success: false};
  } catch (err) {
    console.error('Error occured while creating the reservation: ', err.message);
    throw err;
  }
}

/**
 *
 * @param {string} userID
 * @param {atring} reserationID
 * @return {object} result
 */
async function deleteReservation(userID, reserationID) {
  const result = await getReservation(reserationID);
  if (!result) {
    return {message: 'we cannot find the reservation id in our database', success: false};
  }
  if (!(result[0].userID === userID)) {
    return {message: 'you do not have access to edit this reservation', success: false};
  }
  if (result[0].reservationStatus === 'active') {
    return {message: 'you cannot delete an active reservation', success: false};
  }
  const reservationTime = new Date(result.startTime).getTime();
  const currentTime = new Date().getTime();
  if ((reservationTime - currentTime)<3600000) {
    return {message: 'Time is expired to delete the reservation', success: false};
  }
  // delete the reservation and
  const deletedResult = await deleteDetails(reserationID);
  if (deletedResult) {
    const paymentID = result.paymentID[0];
    if (result[0].paymentStatus === 'complete') {
      return {message: 'Reservation is deleted but Cannot refund the money back payment is already completed', success: false};
    }
    const paymentResult = await refundPaidPayment(userID, result.price, paymentID);
    if (paymentResult.success) {
      return {message: 'Successfully deleted the reservation and payment refund is began', success: true};
    }
  }
}

/**
 *
 * @param {string} userID - id of the user
 * @return {object} result
 */
async function getReservationsByUser(userID) {
  try {
    const result = await usersReservations(userID);
    if (result) {
      return {message: 'successfully got the reservations data for the user', data: result, success: true};
    }
    return {message: 'No reservation to get for the user', data: [], success: true};
  } catch (err) {
    console.error('Error occured while getting the reservations: ', err.message);
    throw err;
  }
}

/**
 *
 * @param {string} reserationID - id of the user
 * @return {object} result
 */
async function getReservationsByID(reserationID) {
  // we need to get the vehicle info and payment info for that
  try {
    const result = await getReservation(reserationID);
    if (result) {
      return {message: 'successfully got the reservation data for the user', data: result, success: true};
    }
    return {message: 'No reservation detail to get', data: [], success: true};
  } catch (err) {
    console.error('Error occured while getting the reservations: ', err.message);
    throw err;
  }
}

module.exports = {createReservation, getReservationsByUser, getReservationsByID, updateReservation, deleteReservation};
