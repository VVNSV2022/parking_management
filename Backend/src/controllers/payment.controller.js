const {createPaymentMethod, deletePaymentMethod, makeOneTimePayment, refundPayment, updatePaymentIntent} = require('../thirdParty/StripeAPI');
const {getPaymentID, getPaymentMethodsID, updatePaymentMethod, getMemberships, getPaymentMethodsByUser, addPaymentMethod, updatePayment, addPayment} = require('../thirdParty/payment.firestore');
const {verifyBillingDetails, compareRanks, timestampToDate} = require('../utilities/util');


/**
 *
 * @param {string} paymentID - payment id
 * @return {object} result
 */
async function verifyPaymentID(paymentID) {
  try {
    const result = await getPaymentID(paymentID);
    if (result) {
      return {message: 'payment is verified successfully', success: true};
    }
    return {message: 'payment is failed to verify', success: false};
  } catch (err) {
    console.error('Error occred while fetching verifying the paymentID: ', err.message);
    throw err;
  }
}

/**
 *
 * @param {string} userID  - unique id of user
 * @param {string} regionID - region id
 * @param {string} parkingLotRank  - parking lot rank
 * @return {object} result
 */
async function checkMembershipStatus(userID, regionID, parkingLotRank) {
  try {
    const result = await getMemberships(userID, regionID);

    if (result) {
      let finalEndDate=new Date();
      let membershipStatus='SILVER';
      result.forEach((element) => {
        if (finalEndDate<timestampToDate(element.endDate)) {
          finalEndDate = timestampToDate(element.endDate);
          membershipStatus = element.membershipType;
        }
      });
      if (finalEndDate<=new Date()) {
        return {message: 'membership status is invalid', success: false};
      }
      if (!compareRanks(membershipStatus, parkingLotRank)) {
        return {message: 'membership status is valid but cannot be used for higher parkingLots than membership status', success: false};
      }
      return {message: 'membership status is available for this parking lot', success: true};
    }
    return {message: 'there is no membership for the user', success: false};
  } catch (err) {
    console.error('Error occred while checking the membership status of user: ', err.message);
    throw err;
  }
}

/**
 *
 * @param {string} userID  - unique id of the user
 * @return {object} result
 */
async function getUserPaymentMethods(userID) {
  try {
    const result = await getPaymentMethodsByUser(userID);
    if (result) {
      return {message: 'got the user paymentmethods', data: result, success: true};
    }
    return {message: 'no saved paymentmethods', data: [], success: true};
  } catch (err) {
    console.error('Error occred while fetching the payment methods of user: ', err.message);
    throw err;
  }
}


/**
 *
 * @param {string} userID
 * @param {string} paymentType
 * @param {object} paymentToken
 * @param {object} BillingDetails
 * @return {object} result
 */
async function savePaymentMethod(userID, paymentType, paymentToken, BillingDetails) {
  try {
    if (!['card', 'us_bank_account'].includes(paymentType)) {
      return {message: 'payment method is not valid', success: false};
    }
    if (!verifyBillingDetails(BillingDetails)) {
      return {message: 'Billing details is not valid', success: false};
    }

    const result = await createPaymentMethod(userID, paymentType, paymentToken, BillingDetails);
    if (result) {
      delete result['livemode'];
      delete result['object'];
      result['userID'] = userID;
      result['active'] = true;
      // save this data in the firebase
      const dataSaveResult = await addPaymentMethod(result);

      if (dataSaveResult) {
      // card.brand, card.checks, card.exp_onth, card.exp_year, card.funding, card.last4
      // save the details of payment id in the database
        return {message: 'payment method is saved', success: true};
      }
      return {message: 'payment method is saved in stripe but not in database', success: false};
    }
    return {message: 'payment method is not saved', success: false};
  } catch (err) {
    console.error('Error occured at controller while saving a payment method: ', err.message);
    throw err;
  }
}

/**
 *
 * @param {string} userID - unique id
 * @param {string} paymentMethodID - payment method ID
 * @return {object} response
 */
async function deletePaymentMethod(userID, paymentMethodID) {
  try {
    // check if this paymentMethodId is belongs to the user
    // if yes just mark it as deleted in the database
    // no then return unauthorised access
    // const result = await deletePaymentMethod(paymentMethodID);
    // if (result) {
    //   console.log(result);
    //   return {message: 'success', success: true};
    // }
    const result = await getPaymentMethodsID(paymentMethodID);
    if (result) {
      if (!(result[0].userID === userID)) {
        return {message: 'paymentID is not related to you. improper access', success: false};
      }
      const deletedResult = await updatePaymentMethod(paymentMethodID, {active: false});
      if (deletedResult) {
        return {message: 'successfully deleted the payment method ID', success: true};
      }
      return {message: 'failed to delete the payment method from the user', success: false};
    }

    return {message: 'cannot find the paymentID in the DB', success: false};
  } catch (err) {
    throw err;
  }
}

/**
 *
 * @param {string} userId - unique id of the user
 * @param {string} amount - unique id of the user
 * @param {string} description - description of the payment
 * @param {string} savedpaymentMethodID - saved payment method ID
 * @param {string} newPaymentMethodID - new payment method ID
 * @param {string} newPaymentMethodType - new payment method type, card, bank account
 */
async function makePayment(userID, amount, description, savedpaymentMethodID='', newPaymentMethodID='', newPaymentMethodType='card') {
  try {
    // if(savedpaymentMethodID){
    //
    // check if the paymentMethod ID exists in the users
    // }
    if (!savedpaymentMethodID && newPaymentMethodID && !['card'].includes(newPaymentMethodType)) {
      return {message: 'invalid fields', success: false};
    }
    const parsedAmount = parseFloat(amount).toFixed(2);
    if (isNaN(parsedAmount)) {
      return {message: 'invalid amount type', success: false};
    }
    if (!(description.length > 3 && description.length <=200)) {
      return {message: 'description length is not in the range of 3-200', success: false};
    }
    const amountInCents = parseInt(parsedAmount*100);
    const result = await makeOneTimePayment(userID, amountInCents, description, savedpaymentMethodID, newPaymentMethodID, newPaymentMethodType);
    if (result) {
      const paymentData = {
        userID: userID,
        reason: 'charge',
        paymentID: result.id,
        paymentMoneyInCents: result.amount,
        recievedMoneyInCents: result.amount_received,
        paymentMethodID: result.payment_method,
        payment_method_types: result.payment_method_types,
        payment_status: result.status,
        metadata: result.metadata,
        description: result.description,
        canceled_at: result.canceled_at,
        cancellation_reason: result.cancellation_reason,
        created_at: result.created,
        currency: result.currency,
        customer: result.customer,
        last_payment_error: result.last_payment_error,
        latest_charge: result.latest_charge,
      };
      const addedResult = await addPayment(result.id, paymentData);
      if (addedResult) {
        return {message: 'payment successfull', data: result, id: result.id, success: true};
      }
      return {message: 'payment made successfully but cannot add it into database', data: result, success: false};
    }
    return {message: 'payment failed', success: false};
  } catch (err) {
    console.log('Error occured while doing the bussiness logic for makign payment: ', err.message);
    throw err;
  }
}

/**
 *
 * @param {string} amount - amount of the payment
 * @param {string} paymentID - payment id of the paid payment
 */
async function refundPaidPayment(amount, paymentID) {
  try {
    // check if the userId has paymentID
    // pass the paymentID to function to check that payment is valid for the refund
    // make necessary changes after the refund i.e cleanup
    const parsedAmount = parseFloat(amount).toFixed(2);
    if (isNaN(parsedAmount)) {
      return {message: 'invalid amount type', success: false};
    }
    const amountInCents = parseInt(parsedAmount*100);
    const result = await refundPayment(amountInCents*0.8, paymentID);
    if (result) {
      const updatedResult = await updatePayment(paymentID, 'refund', parsedAmount*0.8);
      if (!updatedResult) {
        console.log('Payment is updated but the result is not updated in the database ');
      }
      return {message: 'payment refunded successfully', data: result, success: true};
    }
    return {message: 'payment refund failed', success: false};
  } catch (err) {
    console.log('Error occured while doing the bussiness logic for refunding payment: ', err.message);
    throw err;
  }
}

/**
 *
 * @param {string} userID - unique id of the user
 * @param {string} newAmount - new amount of the payment
 * @param {string} initialAmount - original amount of the payment
 * @param {string} paymentIntentID - payment id of the intent
 * @return {object} - result response
 */
async function updatePaymentAmount(userID, newAmount, initialAmount, paymentIntentID) {
  try {
    // check if the userID has the paymentIntentID
    // check the intialamount with original paymentAmount
    // check updatedAmount is greater than intialAmount
    const parsedInitialAmount = parseFloat(initialAmount).toFixed(2);
    const parsedNewAmount = parseFloat(newAmount).toFixed(2);

    if (isNaN(parsedNewAmount) && isNaN(parsedInitialAmount)) {
      return {message: 'invalid amount type', success: false};
    }
    if (parsedInitialAmount > parsedNewAmount) {
      return {message: 'cannot update the new amount to less price than inital amount of the payment', success: false};
    }
    // const initialAmountInCents = parseInt(parsedInitialAmount*100);
    const newAmountInCents = parseInt(parsedNewAmount*100);
    const result = await updatePaymentIntent(paymentIntentID, newAmountInCents);
    if (result) {
      return {message: 'successfully updated the payment amount of the paymentIntent', success: true, data: result};
    }
    return {message: 'failed to update the payment intent', success: false};
  } catch (err) {
    console.log('Error occured while doing the bussiness logic for updating the payment amount: ', err.message);
    throw err;
  }
}

module.exports = {getUserPaymentMethods, checkMembershipStatus, verifyPaymentID, savePaymentMethod, deletePaymentMethod, makePayment, refundPaidPayment, updatePaymentAmount};
