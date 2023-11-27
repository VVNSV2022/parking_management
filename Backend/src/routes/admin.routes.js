const {CustomRoutes, CustomResponse} = require('../utilities/server');
const {loginUser, logoutUser} = require('../controllers/users.controller');
const url = require('url');
const authenticateToken = require('../utilities/authMiddleware');

const adminRouter = new CustomRoutes();
const response = new CustomResponse();

adminRouter.post('/admin/login', async (req, res) => {
    try {
      const { email, password } = req.body;
  
      if (!email || !password) {
        return response.setResponse(res, { message: 'Missing email or password', error: true }, 400);
      }
  
      const result = await loginUser(email, password, 'admin');
  
      if (result.success) {
        return response.setResponse(res, { 
          message: 'Login successful', 
          accessToken: result.accessToken, 
          refreshToken: result.refreshToken 
        }, 200);
      }
    } catch (err) {
      console.error('Error occurred while handling the login request: ', err.message);
      return response.setResponse(res, { message: err.message, error: true }, 400);
    }
  });

  adminRouter.post('/admin/logout', async (req, res) => {
    try {
      const authResult = authenticateToken(req);
  
      if (authResult.error) {
        return response.setResponse(res, { message: authResult.error, error: true }, authResult.status);
      }
  
      const userId = authResult.user.userId; // Extracted from the token
      await logoutUser(userId);
  
      return response.setResponse(res, { message: 'Logout successful' }, 200);
    } catch (err) {
      console.error('Error occurred while handling the logout request: ', err.message);
      return response.setResponse(res, { message: 'Internal Server Error', error: true }, 500);
    }
  });

  adminRouter.get('/admin/reservation', authenticateToken, async (req, res) => {
    try {
      const { startTime, endTime } = req.query; // Time range parameters
  
      const reservations = await getReservations(startTime, endTime);
  
      return response.setResponse(res, { 
        message: 'Reservations fetched successfully', 
        data: reservations 
      }, 200);
    } catch (err) {
      console.error('Error occurred while fetching reservations: ', err.message);
      return response.setResponse(res, { message: err.message, error: true }, 400);
    }
  });
  



module.exports = adminRouter;