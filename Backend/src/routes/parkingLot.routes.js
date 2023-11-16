// const { CustomRoutes, CustomResponse } = require('../utilities/server');
// const { getRegionsAndParkingLots } = require('../controllers/parkingLot.controller');

// const parkingLotRouter = new CustomRoutes();
// const response = new CustomResponse();

// // API-C1: Fetch Available Regions and Parking Lots in that region
// parkingLotRouter.get('/api/regions', async (req, res) => {
//   try {
//     const regionId = req.queryParameters.regionId;
//     if (regionId) {
//       const result = await getRegionsAndParkingLots(regionId);

//       if (result) {
//         return response.setResponse(res, result, 200); // Respond with the data for the specified region
//       } else {
//         return response.setResponse(res, { message: 'No data found for the specified region' }, 404);
//       }
//     } else {
//       return response.setResponse(res, { message: 'Missing "regionId" query parameter' }, 400);
//     }
//   } catch (error) {
//     console.error('Error occurred while fetching regions and parking lots: ', error.message);
//     return response.setResponse(res, { error: 'An error occurred while processing your request' }, 500);
//   }
// });

// module.exports = parkingLotRouter;

const {CustomRoutes, CustomResponse} = require('../utilities/server');
const {getRegionsAndParkingLots} = require('../controllers/parkingLot.controller');

const parkingLotRouter = new CustomRoutes();
const response = new CustomResponse();

// API-C1: Fetch Available Regions and Parking Lots in that region
parkingLotRouter.get('/api/regions', async (req, res) => {
  try {
    const regionId = req.queryParameters.regionId;
    if (regionId) {
      const result = await getRegionsAndParkingLots(regionId);


      if (result && result.parkingLots.length > 0) {
        return response.setResponse(res, result, 200);
      } else {
        return response.setResponse(res, {message: 'No data found for the specified region'}, 404);
      }
    } else {
      return response.setResponse(res, {message: 'Missing regionId query parameter'}, 400);
    }
  } catch (error) {
    console.error('Error occurred while fetching regions and parking lots: ', error.message);
    return response.setResponse(res, {error: 'An error occurred while processing your request'}, 500);
  }
});

module.exports = parkingLotRouter;

