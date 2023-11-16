const {getFirestore} = require('firebase-admin/firestore');


const db = getFirestore();

/**
 *
 * @param {string} membershipID
 * @param {object} data
 * @return {object} - result
 */
async function createMembership(membershipID, data) {
  try {
    const docRef = db.collection('memberships').doc(membershipID);
    await docRef.set(data);
    return docRef;
  } catch (err) {
    console.error('Error occured while writing to the firebase firestore: ', err.message);
    throw err;
  }
}

module.exports = {createMembership};
