const {v4: uuidv4} = require('uuid');

const {CustomRoutes, CustomResponse} = require('../utilities/server');

const reservationRouter = new CustomRoutes();
const response = new CustomResponse();


reservationRouter.post('/bookreservation', async (req, res)=>{
  const {start_time, end_time, user_id, parking_lot_id, type, price} = req.body;

  // check price with start_time, end_time, parking_lot_id, price
  // check if the parking lot has space
  // allot a parking lot
  if (start_time && end_time && user_id && parking_lot_id && type && price) {
    return response.setResponse(res, {message: 'set all the details in the request', success: true}, 401);
  }
  try {
    const reservation_id = uuidv4();
  } catch (err) {
    console.error('Error occured while booking the reservation: ', err.message);
  }
});
