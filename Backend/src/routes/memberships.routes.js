const {CustomRoutes, CustomResponse} = require('../utilities/server');

const {getMembershipsByRegion, getMembershipsByUser} = require('../controllers/memberships.controller');

const membershipRouter = new CustomRoutes();
const response = new CustomResponse();

const authenticateToken = require('../utilities/authMiddleware');

membershipRouter.get('/api/memberships', async (req, res)=>{
  try {
    const queryParameters = req.queryParameters;
    const {regionID} = queryParameters;
    if (!regionID) {
      return response.setResponse(res, {message: 'Invalid request'}, 400);
    }
    const result = await getMembershipsByRegion(regionID);
    if (result.success) {
      return response.setResponse(res, {message: result.message, success: true, data: result.data, regions: result.regions}, 200);
    }
    return response.setResponse(res, {message: result.message, success: false}, 400);
  } catch (err) {
    console.error('Error occurred while handling the request to get the saved payment methods: ', err.message);
    return response.setResponse(res, {message: 'Internal Server Error'}, 500);
  }
});

membershipRouter.get('/api/user/memberships', async(req, res)=>{
  try {
    const authResult = authenticateToken(req);

    if (authResult.error) {
      return response.setResponse(res, {message: authResult.error, error: true}, authResult.status);
    }
    const queryParameters = req.queryParameters;
    const {userID} = queryParameters;
    if (!userID) {
      return response.setResponse(res, {message: 'Invalid request'}, 400);
    }
    const result = await getMembershipsByUser(userID);
    if (result.success) {
      return response.setResponse(res, {message: result.message, success: true, data: result.data, regions: result.regions}, 200);
    }
    return response.setResponse(res, {message: result.message, success: false}, 400);
  } catch (err) {
    console.error('Error occurred while handling the request to get the saved payment methods: ', err.message);
    return response.setResponse(res, {message: 'Internal Server Error'}, 500);
  }
})


module.exports = membershipRouter;
