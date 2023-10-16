// just sample file to tell what type of code goes here like payment, etc..
const {initializeApp, cert} = require('firebase-admin/app');
require('dotenv').config();

const serviceAccount = require('../../ruparking.json');

/**
 * firebase initialise function
 */
function firebaseInit() {
  try {
    initializeApp({
      credential: cert(serviceAccount),
      storageBucket: process.env.storageBucket,
    });
    console.log('firebase is initialised successfully');
  } catch (err) {
    console.error(
        'Error occured at initialising the firebase database',
        err.message,
    );
    process.exit(1);
  }
}

module.exports = firebaseInit;
