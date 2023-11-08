const {CustomRoutes, CustomResponse} = require('../utilities/server');
const {createReservation, getReservationsByUser, getReservationsByID, updateReservation, deleteReservation, getReservationsAll} = require('../controllers/reservation.controller');
const path = require('path');
const fs = require('fs');
const reservationRouter = new CustomRoutes();
const response = new CustomResponse();

// create reservation

reservationRouter.post('/api/reservation', async (req, res)=>{
  try {
    const {userID, startTime, endTime, parkingLotID, price, permitType, paymentID, paymentType, paymentMethod, vehicleID} = req.body;
    if (!userID|| !startTime|| !endTime|| !parkingLotID|| !price|| !permitType || !vehicleID || !paymentType || !paymentMethod) {// || !paymentID
      return response.setResponse(res, {message: 'Missing required fields', success: false}, 400);
    }
    const result = await createReservation(userID, startTime, endTime, parkingLotID, price, permitType, vehicleID, paymentID, paymentType, paymentMethod);
    if (result.success) {
      return response.setResponse(res, {message: 'Created Reservation Successfully', data: result.data, error: false}, 200);
    }
    return response.setResponse(res, {message: result.message, error: true}, 400);
  } catch (err) {
    console.error('Error occurred while handling the request to make reservation: ', err.message);
    return response.setResponse(res, {message: 'Internal Server Error'}, 500);
  }
});

// update reservation
// timings
// vehicle id

reservationRouter.put('/api/reservation', async (req, res)=>{
  try {
    const {userID, reservationID, newDetails} = req.body;
    if (!userID || !reservationID || !newDetails) {
      return response.setResponse(res, {message: 'Missing required fields', success: false}, 400);
    }
    const allowedValues = ['startTime', 'endTime', 'vehicleID'];
    const invalidKeys = Object.keys(newDetails).filter((key) => !allowedValues.includes(key));
    if (!(invalidKeys.length === 0)) {
      return response.setResponse(res, {message: 'Invalid data in sent', error: true}, 400);
    }

    const result = await updateReservation(userID, reservationID, newDetails.startTime, newDetails.endTime, newDetails.vehicleID);
    if (result.success) {
      return response.setResponse(res, {message: 'Updated Reservation Successfully', error: false}, 200);
    }
    return response.setResponse(res, {message: result.message, error: true}, 400);
  } catch (err) {
    console.error('Error occurred while handling the request to update reservation: ', err.message);
    return response.setResponse(res, {message: 'Internal Server Error'}, 500);
  }
});

// delete reservation
// start_time more than one hour then he can
reservationRouter.delete('/api/reservation', async (req, res)=>{
  try {
    const {userID, reservationID} = req.body;
    if (!userID || !reservationID) {
      return response.setResponse(res, {message: 'Missing required fields', success: false}, 400);
    }
    const result = await deleteReservation(userID, reservationID);
    if (result.success) {
      return response.setResponse(res, {message: 'Deleted Reservation Successfully', error: false}, 200);
    }
    return response.setResponse(res, {message: result.message, error: true}, 400);
  } catch (err) {
    console.error('Error occurred while handling the request to delete reservation: ', err.message);
    return response.setResponse(res, {message: 'Internal Server Error'}, 500);
  }
});

reservationRouter.get('/api/reservation', async (req, res)=>{
  try {
    const queryParameters = req.queryParameters;
    if (!queryParameters.reservationID) {
      return response.setResponse(res, {message: 'Missing important fields', success: false}, 400);
    }
    const reservationID = queryParameters.reservationID;
    const result = await getReservationsByID(reservationID);
    if (result.success) {
      return response.setResponse(res, {message: result.message, success: true, data: result.data}, 200);
    }
    return response.setResponse(res, {message: result.message, error: true}, 400);
  } catch (err) {
    console.error('Error occurred while handling the request to get reservation: ', err.message);
    return response.setResponse(res, {message: 'Internal Server Error'}, 500);
  }
});

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


reservationRouter.get('/api/allreservations', async (req, res)=>{
  try {
    const result = await getReservationsAll();
    if (result.success) {
      return response.setResponse(res, {message: result.message, success: true, data: result.data}, 200);
    }
    return response.setResponse(res, {message: result.message, error: true}, 400);
  } catch (err) {
    console.error('Error occurred while handling the request to get reservation: ', err.message);
    return response.setResponse(res, {message: 'Internal Server Error'}, 500);
  }
});

reservationRouter.get('/reservation.html', async (req, res) => {
  const reservationpath = path.join(__dirname, '../../../frontend/Customer/', req.url);
  console.log('reservationpath', reservationpath);
  fs.readFile(reservationpath, (err, data) => {
    if (err) {
      res.writeHead(404, {'Content-Type': 'text/plain'});
      res.end('Not Found');
    } else {
      res.writeHead(200);
      res.end(data);
    }
  });
});

reservationRouter.get('/manager/reservation.html', async (req, res) => {
  const reservationpath = path.join(__dirname, '../../../frontend/', req.url);
  console.log('reservationpath', reservationpath);
  fs.readFile(reservationpath, (err, data) => {
    if (err) {
      res.writeHead(404, {'Content-Type': 'text/plain'});
      res.end('Not Found');
    } else {
      res.writeHead(200);
      res.end(data);
    }
  });
});


module.exports = reservationRouter;
