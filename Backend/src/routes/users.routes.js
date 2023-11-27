const {CustomRoutes, CustomResponse} = require('../utilities/server');
const {registerUser, loginUser, logoutUser, getUser, getAccountDetailsByCustomerId, refreshAccessToken, updateAccountDetailsByCustomerId} = require('../controllers/users.controller');
const url = require('url');
const authenticateToken = require('../utilities/authMiddleware');

const userRouter = new CustomRoutes();
const response = new CustomResponse();


userRouter.post('/user/register', async (req, res) => {
  try {
    const {email, password} = req.body;

    if (!email || !password) {
      return response.setResponse(res, {message: 'Missing email or password', error: true}, 400);
    }

    const result = await registerUser(email, password);

    if (result.userId) {
      return response.setResponse(res, {message: 'Registration successful', userId: result.userId}, 200);
    } else {
      console.log(result);
      return response.setResponse(res, {message: 'Registration failed', error: true}, 400);
    }
  } catch (err) {
    console.error('Error occurred while handling the request to register a user: ', err.message);
    if (err.type === 'user-creation') {
      return response.setResponse(res, {message: err.message, error: true}, 400);
    } else {
      return response.setResponse(res, {message: 'Internal Server Error', error: true}, 500);
    }
  }
});

userRouter.post('/user/login', async (req, res) => {
  try {
    const {email, password} = req.body;

    if (!email || !password) {
      return response.setResponse(res, {message: 'Missing email or password', error: true}, 400);
    }

    const result = await loginUser(email, password, 'customer');

    if (result.success) {
      return response.setResponse(res, {
        message: 'Login successful',
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
      }, 200);
    }
  } catch (err) {
    console.error('Error occurred while handling the login request: ', err.message);
    return response.setResponse(res, {message: err.message, error: true}, 400);
  }
});

userRouter.post('/token', async (req, res) => {
  try {
    const {refreshToken} = req.body;

    if (!refreshToken) {
      return response.setResponse(res, {message: 'Refresh token is required', error: true}, 400);
    }

    const newAccessToken = await refreshAccessToken(refreshToken);

    if (newAccessToken) {
      return response.setResponse(res, {accessToken: newAccessToken}, 200);
    } else {
      return response.setResponse(res, {message: 'Invalid or expired refresh token', error: true}, 403);
    }
  } catch (err) {
    console.error('Error occurred while handling the token refresh request: ', err.message);
    return response.setResponse(res, {message: 'Internal Server Error', error: true}, 500);
  }
});


userRouter.post('/user/logout', async (req, res) => {
  try {
    const authResult = authenticateToken(req);

    if (authResult.error) {
      return response.setResponse(res, {message: authResult.error, error: true}, authResult.status);
    }

    const userId = authResult.user.userId; // Extracted from the token
    await logoutUser(userId);

    return response.setResponse(res, {message: 'Logout successful'}, 200);
  } catch (err) {
    console.error('Error occurred while handling the logout request: ', err.message);
    return response.setResponse(res, {message: 'Internal Server Error', error: true}, 500);
  }
});

userRouter.delete('/user/delete', async (req, res) => {
  try {
    const userId = req.body.userId;
    if (!userId) {
      return response.setResponse(res, {message: 'User ID required', error: true}, 400);
    }

    const result = await deleteUser(userId);
    if (result.success) {
      return response.setResponse(res, {message: 'User deleted successfully'}, 200);
    } else {
      return response.setResponse(res, {message: result.message}, 400);
    }
  } catch (err) {
    console.error('Error occurred while trying to delete user:', err.message);
    return response.setResponse(res, {message: 'Internal Server Error'}, 500);
  }
});

// userRouter.get('/user', async (req, res) => {
//   try {
//     // Parse the URL and the query string
//     const parsedUrl = url.parse(req.url, true);

//     // Get the query params
//     const queryParams = parsedUrl.query;

//     // Destructure the userId and email from query params
//     const {userId, email} = queryParams;

//     if (!userId && !email) {
//       return response.setResponse(res, {message: 'User ID or email required', error: true}, 400);
//     }

//     const user = await getUser(userId, email);
//     if (user) {
//       return response.setResponse(res, {user}, 200);
//     } else {
//       return response.setResponse(res, {message: 'User not found'}, 404);
//     }
//   } catch (err) {
//     console.error('Error occurred while trying to retrieve user:', err.message);
//     return response.setResponse(res, {message: 'Internal Server Error'}, 500);
//   }
// });

userRouter.get('/api/customer', async (req, res) => {
  try {
    const userID = req.queryParameters.userID;
    if (!userID) {
      return response.setResponse(res, {message: 'User ID is required in the query parameters', error: true}, 400);
    }
    const userAccountDetails = await getAccountDetailsByCustomerId(userID);
    if (userAccountDetails) {
      return response.setResponse(res, userAccountDetails, 200);
    } else {
      console.error('No user found with the given customerId.');
      return response.setResponse(res, {message: 'User account details not found'}, 404);
    }
  } catch (err) {
    console.error('Error occurred while trying to fetch customer account details:', err.message);
    return response.setResponse(res, {message: 'Internal Server Error'}, 500);
  }
});

userRouter.put('/api/customer', async (req, res) => {
  try {
    // authentication middleware
    const authResult = authenticateToken(req);

    if (authResult.error) {
      return response.setResponse(res, {message: authResult.error, error: true}, authResult.status);
    }
    const {userID, phoneNumber, currentAddress, permanantAddress} = req.body;
    if (!userID || !(phoneNumber || currentAddress || permanantAddress)) {
      return response.setResponse(res, {message: 'Missing important fields', error: true}, 400);
    }
    const data = {};
    if (phoneNumber) {
      data.phoneNumber = phoneNumber;
    }
    if (currentAddress) {
      data.currentAddress = currentAddress;
    }
    if (permanantAddress) {
      data.permanantAddress = permanantAddress;
    }
    const userAccountDetails = await updateAccountDetailsByCustomerId(userID, data);
    if (userAccountDetails) {
      return response.setResponse(res, userAccountDetails, 204);
    }
    return response.setResponse(res, {message: userAccountDetails.message}, 404);
  } catch (err) {
    console.error('Error occurred while trying to update customer account details:', err.message);
    return response.setResponse(res, {message: 'Internal Server Error'}, 500);
  }
});

module.exports = userRouter;
