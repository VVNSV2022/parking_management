const {createUserWithEmailPassword, signInUser, signOutUser, removeUser, fetchUser, getCustomerdetails, getmembershiptype,
  storeRefreshToken, getUserByEmail, verifyRefreshToken, invalidateRefreshToken, updateUserDetails} = require('../thirdParty/user.firestore');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const {isValidAddress} = require('../utilities/util');

async function registerUser(email, password, username, dob, licenseNumber, isDisabled, currentAddress, permanentAddress, phoneNumber) {
  try {
    const userId = await createUserWithEmailPassword(email, password, username, dob, licenseNumber, isDisabled, currentAddress, permanentAddress, phoneNumber);

    if (userId) {
      return {
        message: 'User registration successful',
        userID: userId,
        success: true,
      };
    }

    return {
      message: 'User registration failed',
      success: false,
    };
  } catch (err) {
    console.error('Error occurred at controller while registering a user: ', err.message);
    throw err;
  }
}

async function refreshAccessToken(refreshToken) {
  try {
    const userData = await verifyRefreshToken(refreshToken);

    if (!userData) {
      return null;
    }

    const newAccessToken = jwt.sign({userId: userData.uid}, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '15m'});

    return newAccessToken;
  } catch (err) {
    console.error('Error occurred at controller while refreshing access token: ', err.message);
    throw err;
  }
}

async function loginUser(email, password, role) {
  try {
    const userRecord = await getUserByEmail(email, role);
    if (!userRecord) {
      throw new Error('User not found. Please register before signing in.');
    }

    const isValid = await bcrypt.compare(password, userRecord.hashedPassword);
    if (!isValid) {
      throw new Error('Invalid credentials. Please try again.');
    }

    const accessToken = jwt.sign({userId: userRecord.uid}, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '15m'});
    const refreshToken = jwt.sign({userId: userRecord.uid}, process.env.REFRESH_TOKEN_SECRET);

    // Store refreshToken in the database
    await storeRefreshToken(userRecord.uid, refreshToken);

    return {
      message: 'Login successful',
      accessToken: accessToken,
      refreshToken: refreshToken,
      success: true,
    };
  } catch (err) {
    console.error('Error occurred in the controller while trying to login: ', err.message);
    // Pass the error message to the calling function
    throw {type: 'login', message: err.message};
  }
}


async function logoutUser(userId) {
  try {
    await invalidateRefreshToken(userId);
  } catch (err) {
    console.error('Error occurred at controller while logging out a user: ', err.message);
    throw err;
  }
}

async function deleteUser(userId) {
  try {
    await removeUser(userId);
    return {success: true};
  } catch (err) {
    console.error('Error occurred in the controller while trying to delete:', err.message);
    return {success: false, message: 'Deletion failed'};
  }
}

async function getUser(userId, email) {
  try {
    return await fetchUser(userId, email);
  } catch (err) {
    console.error('Error occurred in the controller while trying to retrieve:', err.message);
    throw err;
  }
}

async function getAccountDetailsByCustomerId(customerId) {
  try {
    const userAccountDetails = await getCustomerdetails(customerId);
    if (userAccountDetails) {
      const membershipType = await getmembershiptype(customerId);
      const dateOfBirth = userAccountDetails.dateOfBirth.toDate().toLocaleDateString('en-US');
      return {
        customer_id: customerId,
        role_id: userAccountDetails.role_id,
        username: userAccountDetails.username,
        dateOfBirth: dateOfBirth,
        licenseNumber: userAccountDetails.licenseNumber,
        isDisabled: userAccountDetails.isDisabled,
        address: userAccountDetails.currentAddress,
        membership: membershipType,
        email: userAccountDetails.email,
      };
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error occurred while fetching customer account details:', error);
    throw error;
  }
}

/**
 *
 * @param {string} userID
 * @param {object} data
 * @return {object} {message: string, success: boolean}
 */
async function updateAccountDetailsByCustomerId(userID, data) {
  try {
    if ( (data.phoneNumber && !(/^\d{10}$/.test(data.phoneNumber)))||( data.currentAddress && !(isValidAddress(data.currentAddress)) ) ||(data.permanantAddress && !(isValidAddress(data.permanantAddress)))) {
      return {message: 'Invalid data', success: false};
    }
    const userResult = await getUser(userID, '');
    if (!userResult) {
      return {message: 'user does not exists in our app', success: false};
    }

    if (userResult) {
      const updatedUserAccountDetails = await updateUserDetails(userID, data);
      return {message: 'user account details updated successfully', success: true};
    } else {
      return {message: 'user account details not updated', success: false};
    }
  } catch (error) {
    console.error('Error occurred while updating customer account details:', error);
    throw error;
  }
}

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  getUser,
  getAccountDetailsByCustomerId,
  refreshAccessToken,
  updateAccountDetailsByCustomerId,
};
