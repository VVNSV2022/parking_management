const jwt = require('jsonwebtoken');

// Define your secret key. This should be a long, random, and secret string.
const accessSecretKey = 'sairambalu';
const refreshSecretKey = 'yagnasree';

/**
 *
 * @param {String} userId - user id pointign an unique user
 * @return {accessToken} - access token
 */
async function generateAccessToken(userId) {
  try {
    const payload = {
      sub: userId,
      iat: Date.now(),
      exp: Math.floor(Date.now() / 1000) + 15 * 60, // Expiration time (15 minutes)
    };

    // Create the access token
    const accessToken = await jwt.sign(payload, accessSecretKey, {algorithm: 'HS256'});

    return accessToken;
  } catch (error) {
    console.error('Error generating access token:', error);
    throw error; // Optionally, re-throw the error to be handled elsewhere
  }
}

/**
 *
 * @param {string} userId - user id pointign an unique user
 * @return {refreshtoken} - refresh token
 */
async function generateRefreshToken(userId) {
  try {
    // Define the payload for the token
    const payload = {
      sub: userId, // Subject (user ID)
      iat: Date.now(), // Issued at timestamp
      exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60, // Expiration time (7 days)
    };

    const refreshToken = await jwt.sign(payload, refreshSecretKey, {algorithm: 'HS256'});

    return refreshToken;
  } catch (error) {
    console.error('Error generating refresh token:', error);
    throw error; // Optionally, re-throw the error to be handled elsewhere
  }
}

/**
 *
 * @param {string} token - token which needs to be verified
 * @param {string} type - type of the token like Access or refresh
 */
async function verifyToken(token, type) {
  let secret;
  if (type == 'ACCESS') {
    secret = accessSecretKey;
  } else if (type == 'REFRESH') {
    secret = refreshSecretKey;
  }

  // Verify the access token
  try {
    const decoded = await jwt.verify(token, secret);
    return decoded;
  } catch (err) {
    console.error('Error occured while verifying the token', err.message);
    throw err;
  }
}

module.exports = {generateAccessToken, generateRefreshToken, verifyToken};
