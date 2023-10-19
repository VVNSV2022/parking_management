const {getAuth} = require('firebase-admin/auth');

/**
 *
 * @param {object} userData - userdata
 * @return {userRecord} - user data in firestore
 */
async function authCreate(userData) {
  try {
    const userRecord = await getAuth().createUser(userData);
    return userRecord;
  } catch (err) {
    console.log('Error occured while creating account in firestore', err.message);
    throw err;
  }
}

/**
 *
 * @param {string} value - value that points to user account
 * @param {string} type - what is the type of value
 * @return {object} userrecord
 */
async function getUser(value, type='ID') {
  try {
    let data;
    if (type == 'ID') {
      data = await getAuth().getUser(value);
    } else if (type == 'EMAIL') {
      data = await getAuth().getUserByEmail(value);
    }
    return data.toJSON();
  } catch (err) {
    console.log('Error getting the user: ', err.message);
    throw err;
  }
}

/**
 *
 * @param {string} uid - id pointing to user account
 * @param {object} userData - object of user data
 * @return {Object} userRecord
 */
async function updateUser(uid, userData) {
  try {
    const userRecord = await getAuth().updateUser(uid, userData);
    return userRecord;
  } catch (err) {
    console.log('Error updating the user data', err.message);
    throw err;
  }
}

module.exports = {authCreate, getUser, updateUser};
