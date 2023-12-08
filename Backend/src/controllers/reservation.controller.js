const {v4: uuidv4} = require('uuid');

const {addReservation, usersReservations, getReservation, updateDetails, deleteDetails, hasMaxReservations, hasReservation, getAllReservations, checkOverlappingReservations, getPenaltyAmount} = require('../thirdParty/reservation.firestore.js');
const {makePayment, checkMembershipStatus, refundPaidPayment} = require('./payment.controller.js');
const {updatePaymentIntent} = require('../thirdParty/StripeAPI.js');
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
 * @param {*} permitType
 * @param {*} isMembership
 * @param {*} vehicleID
 * @param {*} paymentID
 * @param {*} paymentType
 * @param {*} paymentMethod
 * @return {object} result
 */
async function createReservation(userID, startTime, endTime, parkingLotID, permitType, isMembership, vehicleID, paymentID='', paymentType='card', paymentMethod='new') {
  try {
    startTime = new Date(startTime);
    endTime = new Date(endTime);
    const currentTime = new Date();
    if (!((endTime > startTime) && (startTime.getTime() > (currentTime.getTime()-18000000)))) { // also set time limit up to 7 days something
      return {message: 'Invalid Times are sent', success: false};
    }
    if (!['membership', 'hourly', 'daily'].includes(permitType)) {
      return {message: 'invalid permit type', success: false};
    }
    const parkingLotResult = await verifyParkingLotID(parkingLotID);
    if (!parkingLotResult) {
      return {message: 'Invalid parkingLot ID', success: false};
    }
    let parsedPrice;
    if (permitType === 'hourly') {
      const hourlyRate = parkingLotResult.hourlyRate;
      if (!hourlyRate) {
        return {message: 'Parking Lot does not have hourly rate', success: false};
      }
      parsedPrice = hourlyRate * ((endTime.getTime() - startTime.getTime())/3600000);
    } else if (permitType === 'daily') {
      const dailyRate = parkingLotResult.dailyRate;
      if (!dailyRate) {
        return {message: 'Parking Lot does not have daily rate', success: false};
      }
      parsedPrice = dailyRate * Math.ceil((endTime.getTime() - startTime.getTime())/86400000);
      startTime.setHours(0, 0, 0, 0);
      endTime.setHours(23, 59, 59, 999);
    } else {
      return {message: 'Invalid permit type', success: false};
    }
    const vehicleResult = await verifyVehicleID(userID, vehicleID);
    if (!vehicleResult.success) {
      return {message: 'Invalid Vehicle ID', success: false};
    }
    const userResult = await getUser(userID, '');
    if (!userResult) {
      return {message: 'user does not exists in our app', success: false};
    }
    // check if user has already booked a slot in the given time
    // check if user has more than 4 reservations for day
    const morningTime = new Date(startTime);
    morningTime.setHours(0, 0, 0, 0);
    const nightTime = new Date(startTime);
    nightTime.setHours(23, 59, 59, 999);
    const hasMaxReservationsResult = await hasMaxReservations(userID, morningTime, nightTime, 4);
    if (hasMaxReservationsResult) {
      return {message: 'user has execeeded the maximum number of reservations for the day', success: false};
    }
    const hasReservationResult = await hasReservation(userID, startTime, endTime);
    if (hasReservationResult) {
      return {message: 'user has already booked a reservation in the given time interval', success: false};
    }

    const parkingSpotResult = await verifyAndBookSlot(userID, parkingLotID, parkingLotResult.numberOfParkingSpots, startTime, endTime);
    if (!parkingSpotResult.success) {
      return {message: parkingSpotResult.message, success: false};
    }

    // if it comes here every detail sent is valid , slot is booked, except the payment
    let membershipID = '';
    let paymentNumber = '';
    if (isMembership === 'true') {
      const membershipResult = await checkMembershipStatus(userID, parkingLotResult.regionID, parkingLotResult.parkingLotRank);
      if (!membershipResult.success) {
        return {message: membershipResult.message, success: false};
      }
      membershipID = membershipResult.id;
    } else {
      let savePaymentMethodID=''; let newPaymentMethodID=''; let newPaymentMethodType='';
      if (paymentMethod === 'saved') {
        savePaymentMethodID = paymentID;
      } else if (paymentMethod === 'new') {
        newPaymentMethodID = paymentID;
        newPaymentMethodType = paymentType;
      }
      const result = await makePayment(userID, parsedPrice, `making payment for the reservation using ${paymentMethod} payment details`, savePaymentMethodID, newPaymentMethodID, newPaymentMethodType );
      if (!result.success) {
        return {message: result.message, success: false};
      }
      paymentNumber = result.id;
    }
    // if it comes here then payment is verified
    const reservationID = uuidv4();
    const reservationData = {
      reservationID: reservationID,
      userID: userID,
      startTime: startTime,
      endTime: endTime,
      parkingLotID: parkingLotID,
      price: parseFloat(parsedPrice),
      permitType: permitType,
      isMembership: isMembership==='true'? true: false,
      paymentID: [membershipID? membershipID: paymentNumber],
      vehicleID: vehicleID,
      parkingSpot: parkingSpotResult.parkingSpot,
      reservationCreatedTime: currentFirestoreTimestamp(),
      reservationStatus: 'inactive',
      paymentStatus: membershipID? 'complete': 'incomplete',
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
 * @param {string} reservationID
 * @param {string} startTime
 * @param {string} endTime
 * @param {string} vehicleID
 * @return {object} result
 */
async function updateReservation(userID, reservationID, startTime='', endTime='', vehicleID='') {
  try {
    // getReservationID details
    // verify the userID will actual userID
    // change the updated details for that userID
    const result = await getReservation(reservationID);
    if (!result) {
      return {message: 'we cannot find the reservation id in our database', success: false};
    }
    if (!(result[0].userID === userID)) {
      return {message: 'you do not have access to edit this reservation', success: false};
    }
    const newData = {};
    let timeChange = false;
    if (startTime) {
      startTime = new Date(startTime);
      if (startTime < new Date()) {
        return {message: 'start time already finished', success: false};
      }
      newData.startTime = startTime;
      timeChange = true;
    }
    if (endTime) {
      endTime = new Date(endTime);
      if (endTime < new Date()) {
        return {message: 'end time is already finished', success: false};
      }
      newData.endTime = endTime;
      timeChange = true;
    }

    if (vehicleID) {
      const vehicleResult = await verifyVehicleID(userID, vehicleID);
      if (!vehicleResult.success) {
        return {message: 'Invalid Vehicle ID', success: false};
      }
      newData.vehicleID = vehicleID;
    }

    // check if the new start time and end times are correct
    // also check if the new start time and end times are causing any previous slot collision
    if (timeChange) {
      startTime = startTime || result[0].startTime.toDate();
      endTime = endTime || result[0].endTime.toDate();
      if (!((endTime>startTime) && (startTime.getTime()>new Date().getTime()))) { // also set time limit upto 7days something
        return {message: 'Invalid Times are sent', success: false};
      }
      // const hasReservationResult = await hasReservation(userID, startTime, endTime);
      // if (hasReservationResult) {
      //   return {message: 'user has already booked a reservation in the given time interval', success: false};
      // }
      const parkingLotResult = await verifyParkingLotID(result[0].parkingLotID);
      if (!parkingLotResult) {
        return {message: 'Invalid parkingLot ID', success: false};
      }
      const parkingspots = parkingLotResult.numberOfParkingSpots;
      const newSlotresult = await verifyAndBookSlot(userID, result[0].parkingLotID, parkingspots, startTime, endTime);
      if (!newSlotresult.success) {
        return {message: 'cannot update the reservation because there are no slots available for the given time', success: false};
      }
      // so the reservation result has actual startTime, endTime and price for that time
      // for the new start time and end time we need to calculate the new price based on the previous price
      const prevPricePerHour = result[0].price / ((result[0].endTime.toDate().getTime() - result[0].startTime.toDate().getTime())/3600000);
      const newPrice = prevPricePerHour * ((endTime.getTime() - startTime.getTime())/3600000);
      newData.parkingSpot = newSlotresult.parkingSpot;
      newData.price = newPrice;
    }

    const updatedResult = await updateDetails(reservationID, newData);
    if (updatedResult) {
      return {message: 'Successfully updated the reservation', parkingSpot: timeChange? newData.parkingSpot: result.parkingSpot, success: true};
    }
    return {message: 'Failed to update the reservation', success: false};
  } catch (err) {
    console.error('Error occured while updating the reservation: ', err.message);
    throw err;
  }
}

/**
 *
 * @param {string} userID
 * @param {atring} reservationID
 * @return {object} result
 */
async function deleteReservation(userID, reservationID, isAdmin=false) {
  const result = await getReservation(reservationID);
  if (!result) {
    return {message: 'we cannot find the reservation id in our database', success: false};
  }
  if (!isAdmin && !(result[0].userID === userID)) {
    return {message: 'you do not have access to edit this reservation', success: false};
  }
  if (!isAdmin && result[0].reservationStatus === 'active') {
    return {message: 'you cannot delete an active reservation', success: false};
  }

  const reservationTime = result[0].startTime.toDate().getTime();
  const currentTime = new Date().getTime();
  const oneHour = 3600000; // One hour in milliseconds

  // Regular users can only delete reservations more than one hour before the start time
  if (!isAdmin && (reservationTime - currentTime) < oneHour) {
    return {message: 'Time is expired to delete the reservation', success: false};
  }

  // Admins can delete reservations until the start time
  if (isAdmin && currentTime >= reservationTime) {
    return {message: 'Cannot delete past or ongoing reservations', success: false};
  }
  // delete the reservation and refund the money if possible
  const deletedResult = await deleteDetails(reservationID);
  if (deletedResult) {
    if (result[0].isMembership) {
      return {message: 'Successfully deleted the reservation', success: true};
    }
    const paymentID = result[0].paymentID[0];
    if (result[0].paymentStatus === 'complete') {
      return {message: 'Reservation is deleted but Cannot refund the money back payment is already completed', success: false};
    }
    const paymentResult = await refundPaidPayment(userID, paymentID);
    if (paymentResult.success) {
      return {message: 'Successfully deleted the reservation and payment refund is began', success: true};
    }
    return {message: 'Successfully deleted the reservation but failed to refund the payment', success: true};
  }
  return {message: 'Failed to delete the reservation', success: false};
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
 * @param {string} reservationID - id of the user
 * @return {object} result
 */
async function getReservationsByID(reservationID) {
  // we need to get the vehicle info and payment info for that
  try {
    const result = await getReservation(reservationID);
    if (result) {
      return {message: 'successfully got the reservation data for the user', data: result, success: true};
    }
    return {message: 'No reservation detail to get', data: [], success: true};
  } catch (err) {
    console.error('Error occured while getting the reservations: ', err.message);
    throw err;
  }
}

async function getReservationsAll() {
  // we need to get the vehicle info and payment info for that
  try {
    const result = await getAllReservations();
    if (result) {
      return {message: 'successfully got the reservation data for the user', data: result, success: true};
    }
    return {message: 'No reservation detail to get', data: [], success: true};
  } catch (err) {
    console.error('Error occured while getting the reservations: ', err.message);
    throw err;
  }
}

/**
 *
 * @param {string} userID
 * @param {string} reservationID
 * @return {object} result
 */
async function checkin(userID, reservationID) {
  try {
    // check if the reservation is valid
    // check if the user is connected with userID and reservationID
    // check if the reservation status
    // update the reservation status to active, add checkin time

    const result = await getReservation(reservationID);
    if (!result) {
      return {message: 'we cannot find the reservation id in our database', success: false};
    }
    if (!(result[0].userID === userID)) {
      return {message: 'you do not have access to edit this reservation', success: false};
    }
    if (result[0].reservationStatus === 'active') {
      return {message: 'reservation is already active', success: false};
    }
    const reservationTime = result[0].startTime.toDate().getTime();
    const currentTime = new Date().getTime();
    if (currentTime < reservationTime) {
      return {message: 'reservation time is is not started yet can you please wait for some time', success: false};
    }
    const updatedResult = await updateDetails(reservationID, {reservationStatus: 'active', checkinTime: currentFirestoreTimestamp()});
    if (updatedResult) {
      return {message: 'Successfully checked in the user for the reservation', success: true};
    }
    return {message: 'Failed to check in the user for the reservation', success: false};
  } catch (err) {
    console.error('Error occured while checking in the user: ', err.message);
    throw err;
  }
}

/**
 *
 * @param {string} userID
 * @param {string} reservationID
 * @return {object} result
 */
async function checkout(userID, reservationID) {
  try {
  // check if the reservation is valid
  // check if the user is connected with userID and reservationID
  // check if the reservation status is active or not
  // call the payment Intent confirmation.
  // update the reservation status to complete, add checkout time
  //
    let overstay = false;
    let penalty = false;
    const result = await getReservation(reservationID);
    if (!result) {
      return {message: 'we cannot find the reservation id in our database', success: false};
    }
    if (!(result[0].userID === userID)) {
      return {message: 'you do not have access to edit this reservation', success: false};
    }
    if (result[0].reservationStatus === 'inactive') {
      return {message: 'reservation is not active you cannot check out', success: false};
    }
    if (result[0].reservationStatus === 'complete') {
      return {message: 'reservation is already completed', success: false};
    }

    const reservationTime = result[0].endTime.toDate().getTime();
    const currentTime = new Date().getTime();

    let price; let changeAmount=false;
    if (currentTime <= reservationTime) {
      price = result[0].price;
    } else {
      overstay = true;
      const parkingResult = await verifyParkingLotID(result[0].parkingLotID);
      if (!parkingResult) {
        return {message: 'Invalid parkingLot ID', success: false};
      }
      // calculate the extra time in minutes and charge the user for that
      const extraTime = Math.ceil((currentTime - reservationTime)/3600000);
      const prevPricePerHour = result[0].price / ((result[0].endTime.toDate().getTime() - result[0].startTime.toDate().getTime())/3600000);
      const extraAmount = extraTime * prevPricePerHour + parkingResult.extraFine;
      price = result[0].price + extraAmount;
      changeAmount = true;
    }

    // Check for overlapping reservations
    const overlappingReservations = await checkOverlappingReservations(reservationID, result[0].parkingLotID, result[0].parkingSpot, currentTime);
    if (overlappingReservations) {
      penalty = true;
      const penaltyDetails = await getPenaltyAmount(result[0].parkingLotID); // Fetch penalty from parkingLots collection
      if (penaltyDetails) {
        price += penaltyDetails.penaltyAmount; // Add penalty to the total price
      } else {
        return {message: 'Details missings for penalty Calculation', success: false};
      }
    }

    // if membership then there is no payment
    // else then there will be a payment so we need to update the payment intent
    if (!result[0].isMembership) {
      const paymentID = result[0].paymentID[0];
      const updatePaymentResult = await updatePaymentIntent(paymentID, price, changeAmount);
      if (!updatePaymentResult) {
        return {message: 'Failed to update the payment failed to checkout the user', success: false};
      }
    }

    const remarksUpdate = overstay && penalty ? {remarks: 'overstay,penalty'} : overstay ? {remarks: 'overstay'} : {};
    const updatedResult = await updateDetails(reservationID, {reservationStatus: 'complete', paymentStatus: 'complete', price: price, checkoutTime: currentFirestoreTimestamp(), remarksUpdate});
    if (updatedResult) {
      return {message: 'Successfully checked out the user for the reservation', success: true};
    }
    return {message: 'Failed to check out the user for the reservation', success: false};
  } catch (err) {
    console.error('Error occured while checking out the user: ', err.message);
    throw err;
  }
}

/**
 *
 * @param {string} userID
 * @param {string} reservationID
 * @param {string} message
 * @param {string} newEndTime
 */
async function extendRequest(userID, reservationID, message, newEndTime) {
  // check if the reservation is valid
  // check if the user is connected with userID and reservationID
  // check if the reservation status is active or not
  // check if the reservation is already extended

  try {
    const result = await getReservation(reservationID);
    if (!result) {
      return {message: 'we cannot find the reservation id in our database', success: false};
    }
    if (!(result[0].userID === userID)) {
      return {message: 'you do not have access to edit this reservation', success: false};
    }
    if (result[0].reservationStatus === 'cancelled') {
      return {message: 'reservation is cancelled', success: false};
    }
    if (result[0].reservationStatus === 'inactive') {
      return {message: 'reservation is not active you cannot request to extend but you can try to request the update', success: false};
    }
    if (result[0].reservationStatus === 'complete') {
      return {message: 'reservation is already completed', success: false};
    }
    const endTime = new Date(newEndTime);
    if (endTime < new Date()) {
      return {message: 'end time is already finished', success: false};
    }
    if ( endTime < result[0].endTime.toDate()) {
      return {message: 'new end time should not be less than original end time ', success: false};
    }
    const extensionResult = await findExtension(reservationID);
    if (extensionResult) {
      return {message: 'reservation is already extended cannot extend more than once', success: false};
    }
    const updatedResult = await addExtension(reservationID, {reservationID: reservationID, message: message, newEndTime: endTime, active: true});
    if (updatedResult) {
      return {message: 'Successfully requested to extend the reservation', success: true};
    }
    return {message: 'Failed to request to extend the reservation', success: false};
  } catch (err) {
    console.error('Error occured while requesting the extend for the reservation: ', err.message);
    throw err;
  }
}

module.exports = {createReservation, getReservationsByUser, getReservationsByID, updateReservation, deleteReservation, getReservationsAll, checkin, checkout, extendRequest};
