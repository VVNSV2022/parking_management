require('dotenv').config();

const stripe = require('stripe')(process.env.SecretKey);

/**
 *
 * @param {string} userId - unique user id
 * @param {string} paymentType - type of the payment card or bank account
 * @param {object} paymentDetails - details for the type of payment
 * @param {object} billingDetails -a ddress details
 * @return {object} - paymentmethod
 */
async function createPaymentIntent(userId, paymentType, paymentDetails, billingDetails={}) {
  try {
    const paymentInfo = {
      payment_type: paymentType,
      billing_details: billingDetails,
      meta_data: {
        user_id: userId,
      },
    };
    if (paymentType=='card') {
      paymentInfo.card = paymentDetails;
    } else {
      paymentInfo.us_bank_account = paymentDetails;
    }
    // Create a Payment Method
    const paymentMethod = await stripe.paymentMethods.create(paymentInfo);

    // Attach the Payment Method to the user
    await stripe.paymentMethods.attach(paymentMethod.id, {
      customer: userId,
    });

    // Verify the Payment Method (only for bank accounts)
    if (paymentType === 'bank_account') {
      await stripe.paymentMethods.verify(paymentMethod.id, {
        amounts: [0.5, 0.6, 1, 1.1], // Example verification amounts
      });
    }

    return paymentMethod.id;
  } catch (err) {
    console.error('Error occured while creating the payment Intent for the user: ', err.message);
    throw err;
  }
}

/**
 *
 * @param {string} paymentId - unique payment intent for the users payment id
 * @return {object} - paymentmethod
 */
async function deletePaymentIntent(paymentId) {
  try {
    const paymentMethod = await stripe.paymentMethods.detach(
        paymentId,
    );
    return paymentMethod;
  } catch (err) {
    console.error('Error occured while deleting the payment Intent for the user: ', err.message);
    throw err;
  }
}

/**
 *
 * @param {string} userId - unique id of the user
 * @param {Number} amount - money
 * @param {object} paymentMethodDetails - details of the payment method
 * @param {string} description - description of the payment
 * @return {object} - confirmed payment id
 */
async function makeOneTimePayment(userId, amount, paymentMethodDetails, description) {
// only card is accepted here
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount, // Amount in cents (e.g., $20.00)
      currency: 'usd',
      confirm: true,
      payment_method_data: paymentMethodDetails,
      payment_method_types: 'card',
      customer: userId,
      description: description,
      meta_data: {
        userId: userId,
      },
      use_stripe_sdk: true,
    });

    // Confirm the Payment Intent
    const confirmedPaymentIntent = await stripe.paymentIntents.confirm(paymentIntent.id);

    console.log('One-time Payment:', confirmedPaymentIntent);
    return confirmedPaymentIntent;
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
async function useSavedPaymentMethod(userId, productAmount, paymentMethodId) {
  try {
    // Create a Payment Intent using the saved payment method
    const paymentIntent = await stripe.paymentIntents.create({
      amount: productAmount, // Amount in cents (e.g., $20.00)
      currency: 'usd',
      payment_method: paymentMethodId,
      customer: userId,
    });

    // Confirm the Payment Intent
    const confirmedPaymentIntent = await stripe.paymentIntents.confirm(paymentIntent.id);

    if (confirmedPaymentIntent.status === 'succeeded') {
      console.log('Payment successful.');
      return confirmedPaymentIntent;
    } else {
      console.error('Payment failed.');
      return 0;
    }
  } catch (error) {
    console.error('Error charging the user:', error);
    throw error;
  }
};
module.exports = {createPaymentIntent, deletePaymentIntent, makeOneTimePayment, useSavedPaymentMethod};
