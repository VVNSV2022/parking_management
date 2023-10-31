const {CustomRoutes, CustomResponse} = require('../utilities/server');
const {createReservation, getReservationsByUser} = require('../controllers/reservation.controller');

const reservationRouter = new CustomRoutes();
const response = new CustomResponse();


reservationRouter.post('/api/reservation', async (req, res)=>{
  try {
    const {userID, startTime, endTime, parkingLotID, price, permitType, paymentID, vehicleID} = req.body;
    if (!userID|| !startTime|| !endTime|| !parkingLotID|| !price|| !permitType || !vehicleID) {// || !paymentID
      return response.setResponse(res, {message: 'Missing required fields', success: false}, 400);
    }
    const result = await createReservation(userID, startTime, endTime, parkingLotID, price, permitType, paymentID, vehicleID);
    if (result.success) {
      return response.setResponse(res, {message: 'Created Reservation Successfully', error: false}, 200);
    }
    return response.setResponse(res, {message: result.message, error: true}, 400);
  } catch (err) {
    console.error('Error occurred while handling the request to make reservation: ', err.message);
    return response.setResponse(res, {message: 'Internal Server Error'}, 500);
  }
});

// update reservation
// delete reservation

reservationRouter.get('/api/reservations', async (req, res)=>{
  try {
    const queryParameters = req.queryParameters;
    if (!queryParameters.userID) {
      return response.setResponse(res, {message: 'Missing important fields', success: false}, 400);
    }
    const userID = queryParameters.userID;
    const result = await getReservationsByUser(userID);
    if (result.success) {
      return response.setResponse(res, {message: result.message, success: true, data: result.data}, 200);
    }
    return response.setResponse(res, {message: result.message, error: true}, 400);
  } catch (err) {
    console.error('Error occurred while handling the request to get reservation: ', err.message);
    return response.setResponse(res, {message: 'Internal Server Error'}, 500);
  }
});

module.exports = reservationRouter;
