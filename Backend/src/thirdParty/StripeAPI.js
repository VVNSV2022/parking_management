require('dotenv').config();

const stripe = require('stripe')(process.env.SecretKey);


/**
 *
 * @param {string} userId - unique user id
 * @param {string} paymentType - type of the payment card or bank account
 * @param {object} paymentToken - details for the type of payment encrypted
 * @param {object} billingDetails -a ddress details
 * @return {object} - paymentmethod
 */
async function createPaymentIntent(userId, paymentType, paymentToken, billingDetails={}) {
  try {
    const paymentInfo = {
      type: paymentType,
      billing_details: billingDetails,
      metadata: {
        user_id: userId,
      },
    };
    if (paymentType=='card') {
      paymentInfo.card = {token: paymentToken};
    }// else {
    //   paymentInfo.ach_debit = {token: paymentToken};
    // }
    // Create a Payment Method
    const paymentMethod = await stripe.paymentMethods.create(paymentInfo);
    return paymentMethod;
  } catch (err) {
    console.error('Error occured while creating the payment Intent for the user: ', err.message);
    throw err;
  }
}

/**
 *
 * @param {string} paymentMethodId - unique payment intent for the users payment id
 * @return {object} - paymentmethod
 */
async function deletePaymentIntent(paymentMethodId) {
  try {
    const paymentMethod = await stripe.paymentMethods.detach(
        paymentMethodId,
    );
    return paymentMethod;
  } catch (err) {
    console.error('Error occured while deleting the payment Intent for the user: ', err.message);
    throw err;
  }
}

/**
 *
*  @param {string} userId - unique id of the user
 * @param {Number} amount - money
 * @param {string} description - description of the payment
 * @param {*} savedpaymentMethodID - saved payment method ID
 * @param {*} newPaymentMethodID - new payment method ID
 * @param {*} newPaymentMethodType - new payment method type
 * @return {object} - result
 */
async function makeOneTimePayment(userId, amount, description, savedpaymentMethodID='', newPaymentMethodID='', newPaymentMethodType='card') {
// only card is accepted here
  try {
    const paymentIntentInfo = {
      amount: amount, // Amount in cents (e.g., $20.00)
      currency: 'usd',

      automatic_payment_methods: {
        enabled: true,
        allow_redirects: 'never',
      },
      description: description,
      metadata: {
        userId: userId,
      },
      use_stripe_sdk: true,
    };

    if (savedpaymentMethodID) {
      paymentIntentInfo.payment_method = savedpaymentMethodID;
    } else if (newPaymentMethodID) {
      paymentIntentInfo.payment_method_types = newPaymentMethodType;
      paymentIntentInfo.payment_method_data = newPaymentMethodID;
    }

    const paymentIntent = await stripe.paymentIntents.create(paymentIntentInfo);

    // Confirm the Payment Intent
    // const confirmedPaymentIntent = await stripe.paymentIntents.confirm(paymentIntent.id);

    console.log('One-time Payment:', paymentIntent);
    return paymentIntent;
  } catch (error) {
    console.error('Error making one-time payment:', error.message);
    throw error;
  }
};

/**
 *
 * @param {string} userId - unique id of the user
 * @param {number} productAmount - amount
 * @param {string} paymentMethodId - saved payment id
 * @return {object} - payment Intent
 */
// async function useSavedPaymentMethod(userId, productAmount, paymentMethodId) {
//   try {
//     // Create a Payment Intent using the saved payment method
//     const paymentIntent = await stripe.paymentIntents.create({
//       amount: productAmount, // Amount in cents (e.g., $20.00)
//       currency: 'usd',
//       payment_method: paymentMethodId,
//     });

//     // Confirm the Payment Intent
//     const confirmedPaymentIntent = await stripe.paymentIntents.confirm(paymentIntent.id);

//     if (confirmedPaymentIntent.status === 'succeeded') {
//       console.log('Payment successful.');
//       return confirmedPaymentIntent;
//     } else {
//       console.error('Payment failed.');
//       return 0;
//     }
//   } catch (error) {
//     console.error('Error charging the user:', error);
//     throw error;
//   }
// };

/**
 *
 * @param {number} amount - amount for that payment
 * @param {string} paymentIntentID - id of the payment intent
 * @return {object} refund result
 */
async function refundPayment(amount, paymentIntentID) {
  try {
    const refundresult = await stripe.refunds.create({
      payment_intent: paymentIntentID,
      amount: amount,
    });
    return refundresult;
  } catch (err) {
    console.error('Error refunding the payment:', error);
    throw err;
  }
}

/**
 *
 * @param {string} paymentIntentID - id of the payment
 * @param {number} newAmount - amount to change for the payment
 * @return {object} - latest updated paymentIntent
 */
async function updatePaymentIntent(paymentIntentID, newAmount) {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentID);
    console.log(paymentIntent);
    if (!['succeeded', 'canceled'].includes(paymentIntent.status)) {
      paymentIntent.amount = newAmount;

      const updatedPaymentIntent = await stripe.paymentIntents.update(paymentIntentID, {
        amount: newAmount,
      });
      console.log(updatedPaymentIntent);
      const confirmedPaymentIntent = await stripe.paymentIntents.confirm(paymentIntentID);
      console.log(confirmedPaymentIntent);
      console.log('PaymentIntent confirmed:', confirmedPaymentIntent.id);
      return confirmedPaymentIntent;
    } else {
      console.log('Payment Intent cannot be updated once it is confirmed');
      return null;
    }
  } catch (err) {
    console.log('Error occured while updating the paymentIntent using stripe: ', err.message);
    throw err;
  }
}

module.exports = {createPaymentIntent, deletePaymentIntent, makeOneTimePayment, refundPayment, updatePaymentIntent};
