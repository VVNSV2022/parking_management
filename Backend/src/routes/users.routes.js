const {CustomRoutes, CustomResponse} = require('../utilities/server');
const {registerUser, loginUser, logoutUser, getUser} = require('../controllers/users.controller');
const url = require('url');

const userRouter = new CustomRoutes();
const response = new CustomResponse();

userRouter.post('/user/register', async (req, res) => {
  try {
    const {email, password} = req.body;

    // Check if both email and password are present in the request body
    if (!email || !password) {
      return response.setResponse(res, {message: 'Missing email or password', error: true}, 400);
    }

    // Pass the details to the controller for further processing
    const result = await registerUser(email, password);

    // Handle the response from the controller
    if (result.userId) {
      // Registration was successful
      return response.setResponse(res, {message: 'Registration successful', userId: result.userId}, 200);
    } else {
      // Registration failed, provide an error message
      console.log(result);
      return response.setResponse(res, {message: 'Registration failed'}, 400);
    }
  } catch (err) {
    console.error('Error occurred while handling the request to register a user: ', err.message);
    return response.setResponse(res, {message: 'Internal Server Error'}, 500);
  }
});

userRouter.post('/user/login', async (req, res) => {
  try {
    const {email, password} = req.body;

    // Check if required values are present in the request body
    if (!email || !password) {
      return response.setResponse(res, {message: 'Missing required fields', error: true}, 400);
    }

    const result = await loginUser(email, password);

    if (result.success) {
      return response.setResponse(res, {message: 'Login successful', user: result.user}, 200);
    } else {
      return response.setResponse(res, {message: result.message}, 400);
    }
  } catch (err) {
    console.error('Error occurred while trying to login user:', err.message);
    return response.setResponse(res, {message: 'Internal Server Error'}, 500);
  }
});

userRouter.post('/user/logout', async (req, res) => {
  try {
    const token = req.headers.authorization.split(' ')[1]; // Assuming you send token as Bearer <token>

    // Check if the token is present in the request header
    if (!token) {
      return response.setResponse(res, {message: 'Missing authentication token', error: true}, 400);
    }

    const result = await logoutUser(token);

    if (result.success) {
      return response.setResponse(res, {message: 'Logout successful'}, 200);
    } else {
      return response.setResponse(res, {message: result.message}, 400);
    }
  } catch (err) {
    console.error('Error occurred while trying to logout user:', err.message);
    return response.setResponse(res, {message: 'Internal Server Error'}, 500);
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

userRouter.get('/user', async (req, res) => {
  try {
    // Parse the URL and the query string
    const parsedUrl = url.parse(req.url, true);

    // Get the query params
    const queryParams = parsedUrl.query;

    // Destructure the userId and email from query params
    const {userId, email} = queryParams;

    if (!userId && !email) {
      return response.setResponse(res, {message: 'User ID or email required', error: true}, 400);
    }

    const user = await getUser(userId, email);
    if (user) {
      return response.setResponse(res, {user}, 200);
    } else {
      return response.setResponse(res, {message: 'User not found'}, 404);
    }
  } catch (err) {
    console.error('Error occurred while trying to retrieve user:', err.message);
    return response.setResponse(res, {message: 'Internal Server Error'}, 500);
  }
});

module.exports = userRouter;
