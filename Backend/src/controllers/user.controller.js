const {User, Token} = require('../models/user.model.js');

/**
 * Create a new user in the database.
 *
 * @param {Object} userData - User data to be saved.
 * @return {Promise} A promise that resolves to the saved user document.
 * @throws {Error} If an error occurs during user creation.
 */
async function createUser(userData) {
  try {
    const userDoc = new User(userData);
    const savedUser = await userDoc.save();
    return savedUser;
  } catch (err) {
    console.error('Error occurred while creating a user...');
    throw err;
  }
}

/**
 * Retrieve user information by user ID.
 *
 * @param {string} userId - The unique identifier of the user.
 * @return {Promise} A promise that resolves to the user data.
 * @throws {Error} If an error occurs while fetching user data.
 */
async function getUserById(userId) {
  try {
    const userData = await User.findOne({
      userId: userId,
      userActive: true,
    });
    return userData;
  } catch (err) {
    console.error('Got an error while reading the user: ', userId);
    throw err;
  }
}

/**
 * Retrieve user information by emailID.
 *
 * @param {string} emailID - The unique identifier of the user.
 * @return {Promise} A promise that resolves to the user data.
 * @throws {Error} If an error occurs while fetching user data.
 */
async function getUserByEmail(emailID) {
  try {
    const userData = await User.findOne({
      email: emailID,
      userActive: true,
    });
    return userData;
  } catch (err) {
    console.error('Got an error while reading the user: ', emailID);
    throw err;
  }
}

/**
 * Delete a user by marking them as inactive.
 *
 * @param {string} userId - The unique identifier of the user to be deleted.
 * @return {Promise} A promise that resolves to the result of the delete operation.
 * @throws {Error} If an error occurs while deleting the user.
 */
async function deleteUser(userId) {
  try {
    const result = await User.findOneAndUpdate(
        {userId: userId},
        {userActive: false},
    );
    return result;
  } catch (err) {
    console.error('Got an error while deleting the user: ', userId);
    throw err;
  }
}

/**
 *
 * @param {String} userId - user id
 * @param {String} accessToken  - access token created at time of login
 * @param {String} refreshToken - refreshtoken used to verify user
 * @return {result}
 */
async function loginUser(userId, accessToken, refreshToken) {
  try {
    const tokenData = new Token({userId: userId, accessToken: accessToken, refreshToken: refreshToken});
    const result = await tokenData.save();
    return result;
  } catch (err) {
    console.error('Error occurred while writing login details to database', err.message);
    throw err;
  }
}

/**
 *
 * @param {String} userId  - user id
 * @return {result}
 */
async function logoutUser(userId) {
  try {
    const deletedUser = await Token.findOneAndRemove({userId: userId});
    if (!deletedUser) {
      throw new Error('User not found in the token database');
    }
    return deletedUser;
  } catch (err) {
    console.error('Error occurred while deleting the login details to database', err.message);
    throw err;
  }
}

/**
 *
 * @param {string} userId - userid
 * @return {result} usertoken
 */
async function findUserToken(userId) {
  try {
    const userToken = await Token.findOne({userId: userId});
    return userToken;
  } catch (err) {
    console.error('Error occured while searching the token of user', err.message);
    throw err;
  }
}


module.exports = {createUser, getUserById, getUserByEmail, deleteUser, loginUser, logoutUser, findUserToken};
