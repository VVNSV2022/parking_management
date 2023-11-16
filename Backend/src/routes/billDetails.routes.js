const {v4: uuidv4} = require('uuid');

const {CustomRoutes, CustomResponse} = require('../utilities/server');
const {getReservationsByID} = require('../controllers/reservation.controller');
const {getParkingLotID} = require('../thirdParty/parkingLot.firestore');
const {makePayment} = require('../controllers/payment.controller');
const {updatePaymentIntent} = require('../thirdParty/StripeAPI');
const {createMembership} = require('../thirdParty/membership.firestore');
// const {getReservationsByLotAndSpot} = require('../thirdParty/reservation.firestore');

const billDetailsRouter = new CustomRoutes();
const response = new CustomResponse();

billDetailsRouter.get('/api/billDetails', async (req, res)=>{
  try {
    const queryParameters = req.queryParameters;
    if (!queryParameters.reservationID) {
      return response.setResponse(res, {message: 'Missing important fields', success: false}, 400);
    }
    const reservationID = queryParameters.reservationID;
    const result = await getReservationsByID(reservationID);


    if (result.success) {
      const parkingLotID = result.data[0].parkingLotID;
      const parkingLotData = await getParkingLotID(parkingLotID);
      if (!parkingLotData) {
        return response.setResponse(res, {message: 'Parking lot data not found', error: true}, 404);
      }

      // contains data from both tables - reservation and parking lot
      const combinedData = {
        ...result.data[0],
        ...parkingLotData,
      };


      // Calculate time difference in minutes
      const {clockout_time, endTime, userID, regionID, price, overstays} = combinedData;
      const timeDifference = (clockout_time._seconds - endTime._seconds) / 60;
      // Calculate overstay charges for every 30 minutes of overstay
      const overstay_charge = Math.max(Math.ceil(timeDifference / 30), 0) * overstays;

      // Create the response data
      const responseData = {
        userID,
        regionID,
        price,
        overstay_charge,
      };


      return response.setResponse(res, {message: 'Data retrieved successfully', success: true, data: responseData}, 200);
    }

    return response.setResponse(res, {message: result.message, error: true}, 400);
  } catch (err) {
    console.error('Error occurred while handling the request to get reservation: ', err.message);
    return response.setResponse(res, {message: 'Internal Server Error'}, 500);
  }
});

billDetailsRouter.post('/api/payMembership', async (req, res)=>{
  try {
    const {userID, amount, description, regionID, membershipStatus, membershipPeriod, startDate, endDate, paymentID, paymentType, paymentMethod} = req.body;
    if (!userID || !amount || !paymentID || !paymentType|| !description || !regionID || !membershipStatus || !startDate || !endDate) {
      return response.setResponse(res, {message: 'Missing important fields', success: false}, 400);
    }
    let newPaymentID = '';
    if (paymentType === 'new') {
      newPaymentID = paymentID;
    }
    if (!['PLATINUM', 'GOLD', 'SILVER'].includes(membershipStatus)) {
      return response.setResponse(res, {message: 'Invalid Membership status', success: false}, 400);
    }
    if (!['MONTHLY', 'WEEKLY', 'QUATERLY'].includes(membershipPeriod)) {
      return response.setResponse(res, {message: 'Invalid Membership status', success: false}, 400);
    }

    // check if the regionID is valid
    // check if the userID is valid

    // check if the start date is before the end date
    const startTime = new Date(startDate);
    const endTime = new Date(endDate);
    if (!((endTime>startTime) && (startTime.getTime()>new Date().getTime()))) { // also set time limit upto 7days something
      return {message: 'Invalid Times are sent', success: false};
    }

    const result = await makePayment(userID, amount, description, paymentID, newPaymentID, paymentMethod);
    if (result.success) {
      const paymentResult = await updatePaymentIntent(result.id, 0, false);

      if (paymentResult) {
        // update the membership status in the database
        const membershipID = uuidv4();
        const data = {
          membershipID: membershipID,
          startDate: startTime,
          endDate: endTime,
          regionID: regionID,
          userID: userID,
          membershipType: membershipStatus,
          membershipPeriod: membershipPeriod,
        };
        const membershipResult = await createMembership(membershipID, data);
        if (membershipResult) {
          return response.setResponse(res, {message: 'successfully paid the membership amount', success: true}, 200);
        }
        return response.setResponse(res, {message: 'Failed to save the membership details', error: true}, 400);
      }
      return response.setResponse(res, {message: 'Payment failed', error: true}, 400);
    }
    return response.setResponse(res, {message: result.message, error: true}, 400);
  } catch (err) {
    console.error('Error occurred while handling the request to pay: ', err.message);
    return response.setResponse(res, {message: 'Internal Server Error'}, 500);
  }
});

module.exports = billDetailsRouter;
