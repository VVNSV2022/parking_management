const {CustomRoutes, CustomResponse} = require('../utilities/server');
const {getReservationsByID} = require('../controllers/reservation.controller');
const {getParkingLotID} = require('../thirdParty/parkingLot.firestore');
//const {getReservationsByLotAndSpot} = require('../thirdParty/reservation.firestore');

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
        return response.setResponse(res, { message: 'Parking lot data not found', error: true }, 404);
      }
     
      // contains data from both tables - reservation and parking lot
     const combinedData = {
      ...result.data[0],
      ...parkingLotData,
    };



    // Calculate time difference in minutes
    const { clockout_time, endTime, userID, regionID, price, overstays } = combinedData;
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


      return response.setResponse(res, { message: 'Data retrieved successfully', success: true, data: responseData }, 200);
    }

    return response.setResponse(res, {message: result.message, error: true}, 400);

    } catch (err) {
      console.error('Error occurred while handling the request to get reservation: ', err.message);
      return response.setResponse(res, {message: 'Internal Server Error'}, 500);
    }
  });

  module.exports = billDetailsRouter;