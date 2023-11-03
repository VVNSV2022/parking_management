const {createUserWithEmailPassword, signInUser, signOutUser, removeUser, fetchUser} = require('../thirdParty/user.firestore');

async function registerUser(email, password) {
  try {
    const user = await createUserWithEmailPassword(email, password);

    if (user && user.uid) {
      return {
        message: 'User registration successful',
        userId: user.uid,
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

async function loginUser(email, password) {
  try {
    const user = await signInUser(email, password);
    return {success: true, user: user};
  } catch (err) {
    console.error('Error occurred in the controller while trying to login:', err.message);
    return {success: false, message: 'Login failed'};
  }
}

async function logoutUser(token) {
  try {
    const result = await signOutUser(token);
    return {success: true, message: result.message};
  } catch (err) {
    console.error('Error occurred in the controller while trying to logout:', err.message);
    return {success: false, message: 'Logout failed'};
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

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  getUser,
};
