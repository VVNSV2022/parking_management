const bcrypt = require('bcrypt');
const saltRounds = 12; // You can adjust the number of salt rounds based on your security requirements

/**
 *
 * @param {String} plainTextPassword - user account password
 */
async function convertPassToHash(plainTextPassword) {
  try {
    const result = await bcrypt.hash(plainTextPassword, saltRounds);
    return result;
  } catch (err) {
    console.error('Error occured while converting passoword to hash', err.message);
    throw err;
  }
}

/**
 *
 * @param {String} providedPassword - user plain password
 * @param {String} storedHash - users stored hash password
 * @throws {err} - throws error when it the strings are not able to compared
 */
async function convertHashToPass(providedPassword, storedHash) {
  try {
    const result = await bcrypt.compare(providedPassword, storedHash);
    return result;
  } catch (err) {
    console.error('Error occured while converting hash to password', err.message);
    throw err;
  }
}

module.exports = {convertPassToHash, convertHashToPass};
