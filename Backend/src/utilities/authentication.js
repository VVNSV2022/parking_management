// utilities.authentication.js
const { verifyAccessToken } = require('./jwtHelper'); // Assuming you have a tokenUtility.js for verifying tokens

async function authenticate(token) {
  try {
    if (!token) {
      throw new Error('Missing Authorization Token');
    }

    // Assuming verifyToken returns a boolean indicating token validity.
    const isValid = await verifyAccessToken(token);
    if (!isValid) {
      throw new Error('Invalid Authorization Token');
    }
  } catch (error) {
    return {'valid': false, 'message': error.message}; // Indicates that the request should not proceed to the handler
  }

  return {'valid': true, 'message': 'valid token'} // Indicates that the request is authenticated and can proceed
}

module.exports = {
  authenticate,
};
