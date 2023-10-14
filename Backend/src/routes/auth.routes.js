const {v4: uuidv4} = require('uuid');

const {getUserByEmail, loginUser, logoutUser, createUser, findUserToken} = require('../controllers/user.controller');
const {CustomRoutes, CustomResponse} = require('../utilities/server');
const {convertPassToHash, convertHashToPass} = require('../utilities/encrypt');
const {isValidAddress} = require('../utilities/util');
const {generateAccessToken, generateRefreshToken, verifyToken} = require('../utilities/token');

const authRouter = new CustomRoutes();
const response = new CustomResponse();

authRouter.post('/register', async (req, res)=>{
  console.log(req.body);
  const {firstname, lastname, email, username, password, phonenumber, dateOfBirth, currentAddress, permanentAddress, isdisabled} = req.body;
  try {
    if (firstname && lastname && email && username && password && /^\d{10}$/.test(phonenumber) && isValidAddress(currentAddress) && isValidAddress(permanentAddress)) {
      const existingUser = await getUserByEmail(email);
      if (existingUser) {
        return response.setResponse(res, {message: 'There is an account with this email address'}, 403);
      } else {
        const userId = uuidv4();
        const hashedPassword = await convertPassToHash(password);
        const lowercasePassword = password.toLowerCase();
        const lowercaseFirstname = firstname.toLowerCase();
        const lowercaseLastname = lastname.toLowerCase();
        const lowercaseUsername = username.toLowerCase();
        const lowercaseEmail = email.toLowerCase();

        // Check if the password contains the firstname, lastname, username, or email
        if (
          lowercasePassword.includes(lowercaseFirstname) ||
        lowercasePassword.includes(lowercaseLastname) ||
        lowercasePassword.includes(lowercaseUsername) ||
        lowercasePassword.includes(lowercaseEmail)
        ) {
          return response.setResponse(res, {message: 'Password should not contain anything related to email, firstname, lastname and username', success: false}, 403);
        }

        const newUserDetails = {
          userId: userId,
          firstname: firstname,
          lastname: lastname,
          email: lowercaseEmail,
          phonenumber: phonenumber,
          username: username,
          password: hashedPassword,
          dateOfBirth: new Date(dateOfBirth),
          currentAddress: currentAddress,
          permanentAddress: permanentAddress,
          isdisabled: isdisabled,
        };
        await createUser(newUserDetails);
        return response.setResponse(res, {message: 'User Registered Successfully', success: true}, 202);
      }
    } else {
      return response.setResponse(res, {message: 'Required fields are not sent accordingly to create the account', success: false}, 405);
    }
  } catch (err) {
    console.error('Error occured while registering the user into the App', err.message);
    return response.setResponse(res, {message: 'Internal server Error', success: false}, 501);
  }
});

authRouter.post('/login', async (req, res)=>{
  const {email, password} = req.body;

  try {
    if (!email || !password) {
      return response.setResponse(res, {message: 'send all the details to verify the account', success: false}, 402);
    }
    // check if there is accessToken, refreshToken in the cookies to verify user is logged in already

    // Check if the user exists
    const user = await getUserByEmail(email);

    if (!user) {
      return response.setResponse(res, {message: 'Invalid Credentials', success: false}, 403);
    }
    // Check the password
    const passwordMatch = await convertHashToPass(password, user.password);

    if (!passwordMatch) {
      return response.setResponse(res, {message: 'Invalid Credentials', success: false}, 403);
    }

    // create access token and refresh token
    const accessToken = await generateAccessToken(user.userId);
    const refreshToken = await generateRefreshToken(user.userId);

    // add token into the database
    const exisitingToken = await findUserToken(user.userId);
    if (exisitingToken) {
      return response.setResponse(res, {message: 'user is already logged in the database', success: false}, 405);
    }

    const isUserLoggedIn = await loginUser(user.userId, accessToken, refreshToken);
    
    if (!isUserLoggedIn) {
      return response.setResponse(res, {message: 'Got an error while logging the user in to the app', success: false}, 405);
    }
    
    response.setCookie(res, 'accessToken', accessToken, {expires: new Date(Date.now() + 15 * 60)});
    response.setCookie(res, 'refreshToken', refreshToken, {expires: new Date(Date.now() + 7 * 24 * 60 * 60)});
    return response.setResponse(res, {message: 'user is logged in to the account', success: true}, 200);
  } catch (error) {
    console.error('Error Occurred while loggin in the user', error.message);
    return response.setResponse(res, {message: 'Internal Server Error', success: false}, 503);
  }
});

authRouter.post('/logout', async (req, res)=>{
  const {userId} = req.body;
  try {
    const accessToken = req.cookies.accessToken;
    const refreshToken = req.cookies.refreshToken;
    if (!userId && !accessToken && !refreshToken) {
      return response.setResponse(res, {message: 'send all the details to logout the account', success: false}, 402);
    }
    const decodedAccessToken = verifyToken(accessToken, 'ACCESS');
    const decodedRefreshToken = verifyToken(refreshToken, 'REFRESH');
    if ( !(decodedAccessToken == userId) && !(decodedRefreshToken == userId)) {
      return response.setResponse(res, {message: 'the token does not matched with the userId', success: false}, 407);
    }
    await logoutUser(userId);
    response.removeCookie(res, 'accessToken');
    response.removeCookie(res, 'refreshToken');
    return response.setResponse(res, {message: 'User logged out from the website successfully', success: false}, 200);
  } catch (err) {
    console.error('Error Occurred while logging out', err.message);
    return response.setResponse(res, {message: 'Internal Server Error', success: false}, 503);
  }
});

module.exports = authRouter;
