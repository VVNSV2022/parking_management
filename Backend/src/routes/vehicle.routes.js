const {CustomRoutes, CustomResponse} = require('../utilities/server');
const authenticateToken = require('../utilities/authMiddleware');

const {addNewVehicle, getVehicleByID, getVehiclesByUser, deleteVehicle} = require('../controllers/vehicle.controller');

const vehicleRouter = new CustomRoutes();
const response = new CustomResponse();
const authenticateToken = require('../utilities/authMiddleware');

// add vehicle
vehicleRouter.post('/api/vehicle', async (req, res) => {
  try {
    // authentication middleware
    const authResult = authenticateToken(req);

    if (authResult.error) {
      return response.setResponse(res, {message: authResult.error, error: true}, authResult.status);
    }

    const {userID, licensePlateNumber, vehicleMake, vehicleModel, vehicleColor, vehicleYear, VIN, ownersName, isVehicleInsured, isRental} = req.body;
    if (!userID || !licensePlateNumber || !vehicleMake || !vehicleModel || !vehicleColor || !vehicleYear || !VIN || !ownersName || !isVehicleInsured.toString() || !isRental.toString()) {
      return response.setResponse(res, {message: 'Missing required fields', success: false}, 400);
    }
    const vehicle = await addNewVehicle(userID, licensePlateNumber, vehicleMake, vehicleModel, vehicleColor, vehicleYear, VIN, ownersName, isVehicleInsured, isRental);
    if (vehicle.success) {
      return response.setResponse(res, {message: vehicle.message, success: true, data: vehicle.data}, 201);
    }
    return response.setResponse(res, {message: vehicle.message, success: false}, 400);
  } catch (err) {
    console.error('Error occurred while handling the request to add a new vehicle: ', err.message);
    return response.setResponse(res, {message: 'Internal Server Error'}, 500);
  }
});
// delete vehicle
vehicleRouter.delete('/api/vehicle', async (req, res) => {
  try {
    // authentication middleware
    const authResult = authenticateToken(req);

    if (authResult.error) {
      return response.setResponse(res, {message: authResult.error, error: true}, authResult.status);
    }

    const {userID, vehicleID} = req.queryParameters;
    if (!userID || !vehicleID) {
      return response.setResponse(res, {message: 'Missing required fields', success: false}, 400);
    }
    const vehicle = await deleteVehicle(userID, vehicleID);
    if (vehicle.success) {
      return response.setResponse(res, {message: vehicle.message, success: true, data: vehicle.data}, 200);
    }
    return response.setResponse(res, {message: vehicle.message, success: false}, 400);
  } catch (err) {
    console.error('Error occurred while handling the request to delete a vehicle: ', err.message);
    return response.setResponse(res, {message: 'Internal Server Error'}, 500);
  }
});
// update vehicle
// get vehicles
vehicleRouter.get('/api/vehicle', async (req, res) => {
  try {
    // authentication middleware
    const authResult = authenticateToken(req);

    if (authResult.error) {
      return response.setResponse(res, {message: authResult.error, error: true}, authResult.status);
    }

    const {userID, vehicleID} = req.queryParameters;
    if (!userID || !vehicleID) {
      return response.setResponse(res, {message: 'Missing required fields', success: false}, 400);
    }
    const vehicle = await getVehicleByID(userID, vehicleID);
    if (vehicle.success) {
      return response.setResponse(res, {message: vehicle.message, success: true, data: vehicle.data}, 200);
    }
    return response.setResponse(res, {message: vehicle.message, success: false}, 400);
  } catch (err) {
    console.error('Error occurred while handling the request to get vehicles: ', err.message);
    return response.setResponse(res, {message: 'Internal Server Error'}, 500);
  }
});

vehicleRouter.get('/api/vehicles', async (req, res) => {
  try {
    // authentication middleware
    const authResult = authenticateToken(req);

    if (authResult.error) {
      return response.setResponse(res, {message: authResult.error, error: true}, authResult.status);
    }

    const {userID} = req.queryParameters;
    if (!userID) {
      return response.setResponse(res, {message: 'Missing required fields', success: false}, 400);
    }
    const vehicles = await getVehiclesByUser(userID);
    if (vehicles.success) {
      return response.setResponse(res, {message: vehicles.message, success: true, data: vehicles.data}, 200);
    }
    return response.setResponse(res, {message: vehicles.message, success: false}, 400);
  } catch (err) {
    console.error('Error occurred while handling the request to get vehicles: ', err.message);
    return response.setResponse(res, {message: 'Internal Server Error'}, 500);
  }
});

module.exports = vehicleRouter;
