const {getFirestore} = require('firebase-admin/firestore');
const {getAuth} = require('firebase-admin/auth');
const admin = require('firebase-admin');
const bcrypt = require('bcrypt');
const db = getFirestore();
const jwt = require('jsonwebtoken');
const {
  createAccessToken,
  createRefreshToken,
  verifyAccessToken,
} = require('../utilities/jwtHelper');


async function createUserWithEmailPassword(email, password) {
  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const userRecord = await getAuth().createUser({ email, password });
    const userId = `user-${Date.now()}`;

    await db.collection('users').doc(userRecord.uid).set({
      email: email,
      hashedPassword: hashedPassword,
      user_id: userId,
      role_id: 2,
    });

    return userRecord;
  } catch (err) {
    console.error('Error occurred while creating the user: ', err.message);
    throw { type: 'user-creation', message: err.message };
  }
}

async function getUserByEmail(email) {
  try {
    const usersRef = db.collection('users');
    const snapshot = await usersRef.where('email', '==', email).get();

    if (snapshot.empty) {
      console.log('No matching documents for the given email.');
      return null;
    }

    let userData = null;
    snapshot.forEach(doc => {
      // Assuming there's only one user with the given email
      userData = {
        uid: doc.id, // or user_id if you store the custom userId in the document
        email: doc.data().email,
        hashedPassword: doc.data().hashedPassword,
        // Add other user fields you might need
      };
    });

    return userData;
  } catch (err) {
    console.error('Error occurred while fetching user by email: ', err.message);
    throw err;
  }
}

async function storeRefreshToken(userId, refreshToken) {
  try {
    await db.collection('refreshTokens').doc(userId).set({ refreshToken });
  } catch (err) {
    console.error('Error occurred while storing the refresh token: ', err.message);
    throw err;
  }
}

async function verifyRefreshToken(refreshToken) {
  try {
    const snapshot = await db.collection('refreshTokens').where('refreshToken', '==', refreshToken).get();

    if (snapshot.empty) {
      console.log('No matching refresh token found.');
      return null;
    }

    let userData = null;
    snapshot.forEach(doc => {
      // Retrieve user data linked to the refresh token
      userData = { uid: doc.id }; // Adjust according to your user data structure
    });

    // Verify the token's validity
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

    return userData;
  } catch (err) {
    console.error('Error occurred while verifying refresh token: ', err.message);
    if (err instanceof jwt.JsonWebTokenError) {
      // Handle JWT specific errors (like token expiry) here if needed
      return null;
    }
    throw err;
  }
}






async function signInUser(email, password) {
  try {
    // Retrieve the hashed password from your database
    const userSnapshot = await db.collection('users').where('email', '==', email).limit(1).get();
    if (userSnapshot.empty) {
      throw new Error('User not found. Please register before signing in.');
    }

    const userDoc = userSnapshot.docs[0];
    const user = userDoc.data();
    const isPasswordCorrect = await bcrypt.compare(password, user.hashedPassword);

    if (!isPasswordCorrect) {
      throw new Error('Incorrect password.');
    }

    // If the password is correct, generate an access token and a refresh token for the user
    const accessToken = createAccessToken({uid: userDoc.id, email});
    const refreshToken = createRefreshToken({uid: userDoc.id, email});

    // Store the refresh token in your database
    await storeRefreshToken(userDoc.id, refreshToken);

    // Return both tokens
    return {accessToken, refreshToken, success: true};
  } catch (error) {
    console.error('Error during user sign-in:', error);
    throw error;
  }
}

async function storeRefreshToken(userId, refreshToken) {
  try {
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    await db.collection('refreshTokens').doc(userId).set({
      refreshToken: hashedRefreshToken,
      createdAt: new Date(), // Store the creation date for possible expiration handling
    });
  } catch (error) {
    console.error('Error storing refresh token:', error);
    throw error;
  }
}

async function invalidateRefreshToken(userId) {
  try {
    await db.collection('refreshTokens').doc(userId).delete();
    // Any additional database operations for logout can be added here
  } catch (err) {
    console.error('Error occurred while invalidating the refresh token: ', err.message);
    throw err;
  }
}


async function signOutUser(token) {
  try {
    // Assuming token is the ID of the document for simplicity
    if (!token || typeof token !== 'string' || token.trim() === '') {
      throw new Error('The token provided is invalid.');
    }

    // Verify the token to ensure it's valid before blacklisting
    const decodedToken = verifyAccessToken(token);

    // Check if the token is already blacklisted
    const tokenDoc = await db.collection('blacklistedTokens').doc(token).get();
    if (tokenDoc.exists) {
      throw new Error('This token has already been logged out.');
    }

    // Add the token to the Firestore database's blacklistedTokens collection
    await db.collection('blacklistedTokens').doc(token).set({
      token: token,
      expiryDate: new Date(decodedToken.exp * 1000), // Convert JWT expiration from seconds to milliseconds
      userId: decodedToken.uid, // Use the user's UID from the JWT payload
    });

    // (Optional) Invalidate the refresh token if it's stored in a user's document
    // You would need to have the userID to do this
    const userId = decodedToken.uid;
    if (userId) {
      await db.collection('users').doc(userId).update({
        refreshToken: admin.firestore.FieldValue.delete(),
      });
    }

    // Cleanup expired tokens
    await cleanUpExpiredTokens();

    return {success: true, message: 'Logged out successfully'};
  } catch (error) {
    console.error('Error during user sign-out:', error);
    throw error;
  }
}


// async function invalidateRefreshToken(userId) {
//   // Here we are deleting the refresh token, but you might want to just mark it as invalid
//   // depending on your refresh token reuse policy
//   await db.collection('users').doc(userId).update({
//     refreshToken: firebase.firestore.FieldValue.delete(),
//   });
// }

/**
 * Retrieve user hashed password from the 'users' collection in Firestore.
 * @param {string} email - The user's email.
 * @return {Promise<string|null>} - A promise that resolves to the hashed password or null if not found.
 */
async function retrieveUserPassword(email) {
  try {
    const snapshot = await db.collection('users').where('email', '==', email).limit(1).get();
    if (snapshot.empty) {
      return null;
    }
    return snapshot.docs[0].data().hashedPassword;
  } catch (error) {
    console.error('Error retrieving user\'s hashed password:', error);
    throw error; // Re-throw the error to be handled by the caller
  }
}

async function verifyJwtMiddleware(req, res, next) {
  const token = req.headers['authorization']; // Assuming you're sending the JWT in the Authorization header

  if (!token) {
    return res.status(403).json({message: 'No token provided'});
  }

  try {
    const decodedToken = verifyToken(token);

    // Check if the token is blacklisted
    const blacklistedToken = await db.collection('blacklistedTokens').doc(token).get();

    if (blacklistedToken.exists) {
      return res.status(403).json({message: 'Token is blacklisted. Please login again.'});
    }

    // Attach the decoded token to the request for further use, if needed
    req.decodedToken = decodedToken;
    next();
  } catch (error) {
    console.error('Error verifying the token:', error);
    res.status(403).json({message: 'Failed to authenticate token.'});
  }
}


async function cleanUpExpiredTokens() {
  const now = new Date();
  const expiredTokensSnapshot = await db.collection('blacklistedTokens')
      .where('expiryDate', '<', now)
      .get();

  if (!expiredTokensSnapshot.empty) {
    const batch = db.batch();

    expiredTokensSnapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    await batch.commit();
  }
}

async function fetchUser(userId, email) {
  try {
    // If you have the userId, you can fetch directly using the document reference
    if (userId) {
      const docRef = db.collection('users').doc(userId);
      const doc = await docRef.get();

      if (doc.exists) {
        return {id: doc.id, ...doc.data()};
      } else {
        return null;
        // throw new Error('No user found with the given userId.');
      }
    }

    // If userId is not provided but email is provided, you can query by email
    if (email) {
      const querySnapshot = await db.collection('users').where('email', '==', email).get();

      if (!querySnapshot.empty) {
        // Assuming email is unique and there should only be one document
        const userDoc = querySnapshot.docs[0];
        return {id: userDoc.id, ...userDoc.data()};
      } else {
        return null;
        // throw new Error('No user found with the given email.');
      }
    }

    // If neither userId nor email are provided, throw an error
    throw new Error('Either userId or email must be provided to fetch user.');
  } catch (error) {
    console.error('Error fetching user:', error);
    throw error;
  }
}


async function removeUser(userId) {
  try {
    await firebaseAdmin.auth().deleteUser(userId);
  } catch (err) {
    throw err;
  }
}

async function updateUserDetails(userId, data) {
  try {
    const userRef = db.collection('users').doc(userId);
    await userRef.update(data);
    return userRef;
  } catch (err) {
    throw err;
  }
}
async function getCustomerdetails(userId) {
  try {
    if (userId) {
      const docRef = db.collection('users').doc(userId);
      const doc = await docRef.get();

      if (doc.exists) {
        return {...doc.data()};
      } else {
        return null;
      }
    }
  } catch (error) {
    console.error('Error fetching user:', error);
    throw error;
  }
}

async function getmembershiptype(userID) {
  try {
    const membershipRef = db.collection('memberships');
    const querySnapshot = await membershipRef.where('userID', '==', userID).get();
    if (!querySnapshot.empty) {
      const membershipDoc = querySnapshot.docs[0];
      const membershipType = membershipDoc.get('membershipType');
      // console.log(membershipType);
      return membershipType;
    } else {
      throw new Error('No membership found with the given userID.');
    }
  } catch (error) {
    console.error('Error fetching membership:', error);
    throw error;
  }
}

module.exports = {
  createUserWithEmailPassword,
  signInUser,
  signOutUser,
  removeUser,
  fetchUser,
  updateUserDetails,
  getCustomerdetails,
  getmembershiptype,
  getUserByEmail,
  storeRefreshToken,
  verifyRefreshToken,
  invalidateRefreshToken
};
