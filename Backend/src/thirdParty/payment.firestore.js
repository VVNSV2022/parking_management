const {getFirestore} = require('firebase-admin/firestore');

const db = getFirestore();

/**
 *
 * @param {string} paymentID - payment ID
 * @return {object} payment Data
 */
async function getPaymentID(paymentID) {
  try {
    const paymentIDRef = db.collection('payments').doc(paymentID);
    const paymentIDSnapshot = await paymentIDRef.get();

    if (paymentIDSnapshot.exists) {
      const paymentIDData = paymentIDSnapshot.data();
      return paymentIDData;
    }
    return null;
  } catch (err) {
    console.error('Error occured while getting the paymentID from firestore: ', err.message);
    throw err;
  }
}

/**
 *
 * @param {string} paymentID
 * @param {object} data
 */
async function updatePayment(paymentID, data) {
  try {
    const paymentIDRef = db.collection('payments').doc(paymentID);
    await paymentIDRef.set(data, {merge: true});
    return paymentIDRef;
  } catch (err) {
    console.error('Error occured while updating the paymentID from firestore: ', err.message);
    throw err;
  }
}

/**
 *
 * @param {string} paymentID  - payment id of the user
 * @param {object} data - payment id data
 * @return {object} result
 */
async function addPayment(paymentID, data) {
  try {
    const paymentIDRef = db.collection('payments').doc(paymentID);
    await paymentIDRef.set(data);
    return paymentIDRef;
  } catch (err) {
    console.error('Error occured while adding the paymentID from firestore: ', err.message);
    throw err;
  }
}

/**
 *
 * @param {string} userID - unique id of user
 * @param {string} regionID - unique id of region
 * @return {object} result
 */
async function getMemberships(userID, regionID) {
  try {
    const membershipRef = db.collection('memberships');
    const membershipSnapshot = await membershipRef.where('userID', '==', userID).where('regionID', '==', regionID).get();
    if (membershipSnapshot.empty) {
      return null;
    }
    const membershipData=[];
    membershipSnapshot.forEach((doc)=>{
      membershipData.push(doc.data());
    });
    return membershipData;
  } catch (err) {
    console.error('Error occured while getting the memberships data from firestore: ', err.message);
    throw err;
  }
}

/**
 *
 * @param {string} userID
 * @return {object} result
 */
async function getPaymentMethodsByUser(userID) {
  try {
    const paymentMethodsRef = db.collection('paymentMethods');
    const paymentMethodSnapshot = await paymentMethodsRef.where('userID', '==', userID).where('active', '==', true).get();

    if (paymentMethodSnapshot.empty) {
      return null;
    }
    const paymentMethodData=[];
    paymentMethodSnapshot.forEach((doc)=>{
      paymentMethodData.push(doc.data());
    });
    return paymentMethodData;
  } catch (err) {
    console.error('Error occured while getting the payment methods data from firestore: ', err.message);
    throw err;
  }
}

/**
 *
 * @param {string} paymentMethodID
 * @return {object} result
 */
async function getPaymentMethodsID(paymentMethodID) {
  try {
    const paymentMethodsRef = db.collection('paymentMethods');
    const paymentMethodSnapshot = await paymentMethodsRef.where('id', '==', paymentMethodID).where('active', '==', true).get();

    if (paymentMethodSnapshot.empty) {
      return null;
    }
    const paymentMethodData=[];
    paymentMethodSnapshot.forEach((doc)=>{
      paymentMethodData.push(doc.data());
    });
    return paymentMethodData;
  } catch (err) {
    console.error('Error occured while getting the payment methods data from firestore: ', err.message);
    throw err;
  }
}

/**
 *
 * @param {object} stripeData - paymentmethod object
 * @return {object} result
 */
async function addPaymentMethod(stripeData) {
  try {
    const paymentMethodRef = db.collection('paymentMethods').doc(stripeData.id);
    await paymentMethodRef.set(stripeData);
    return paymentMethodRef;
  } catch (err) {
    console.error('Error occured while adding the payment methods data to firestore: ', err.message);
    throw err;
  }
}

/**
 *
 * @param {string} paymentmethodID  - paymentmethodid
 * @param {object} newData - updated data
 * @return {object} result
 */
async function updatePaymentMethod(paymentmethodID, newData) {
  try {
    const paymentMethodRef = db.collection('paymentMethods').doc(paymentmethodID);
    await paymentMethodRef.update(newData);
    return paymentMethodRef;
  } catch (err) {
    console.error('Error occured while adding the payment methods data to firestore: ', err.message);
    throw err;
  }
}

module.exports = {getPaymentMethodsID, addPaymentMethod, updatePaymentMethod, getPaymentID, updatePayment, addPayment, getMemberships, getPaymentMethodsByUser};
