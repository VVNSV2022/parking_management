require('dotenv').config();

const stripe = require('stripe')(process.env.SecretKey);
const {updateUserDetails} = require('./user.firestore');

/**
 *
 * @param {string} userID
 * @param {string} name
 * @param {string} email
 * @param {string} phone
 * @return {object} result
 */
async function createCustomer(userID, name, email, phone) {
  try {
    const customer = await stripe.customers.create({
      name: name,
      email: email,
      phone: phone,
      metadata: {
        userID: userID,
      },
    });
    // save the customer id in the database
    const customerID = customer.id;
    const result = await updateUserDetails(userID, {StripeCustomerID: customerID});
    if (result) {
      console.log('Customer created successfully in the stripe API');
      return customerID;
    }
    return null;
  } catch (err) {
    console.error('Error occured while creating the customer: ', err.message);
    throw err;
  }
}

/**
 *
 * @param {string} userID - unique user id
 * @param {object} paymentMethodID - details for the type of payment encrypted
 * @param {object} billingDetails -a ddress details
 * @param {string} customerID - unique customer id
 * @return {object} - paymentmethod
 */
async function createPaymentMethod(userID, paymentMethodID, billingDetails, customerID='') {
  try {
    // const paymentInfo = {
    //   type: paymentType,
    //   billing_details: billingDetails,
    //   metadata: {
    //     userID: userID,
    //   },
    // };
    // if (paymentType=='card') {
    //   paymentInfo.card = {token: paymentToken};
    // }// else {
    // //   paymentInfo.ach_debit = {token: paymentToken};
    // // }
    // // Create a Payment Method
    // const paymentMethod = await stripe.paymentMethods.create(paymentInfo);
    // customerID is created
    let stripeCustomerID = customerID;
    if (!customerID) {
      const customer = await createCustomer(userID, billingDetails.name, billingDetails.email, billingDetails.phone);
      stripeCustomerID = customer;
    }
    // Attach the Payment Method to the Customer
    const attachedPaymentMethod = await stripe.paymentMethods.attach(
        paymentMethodID,
        {customer: stripeCustomerID},
    );
    return attachedPaymentMethod;
  } catch (err) {
    if (err.type === 'StripeCardError') {
      console.error('Invalid Request Error: ', err.message);
      return null;
    } else if (err.type === 'StripeInvalidRequestError') {
      // Handle invalid request errors
      console.error('Invalid Request Error:', err.message);
      // Respond to the client with an appropriate error message
      return null;
    }
    console.error('Error occured while creating the payment Intent for the user: ', err.message);
    throw err;
  }
}

/**
 *
 * @param {string} paymentMethodID - unique payment intent for the users payment id
 * @param {string} stripeCustomerID - unique customer id
 * @return {object} - paymentmethod
 */
async function deletePaymentMethod(paymentMethodID, stripeCustomerID) {
  try {
    const paymentMethod = await stripe.paymentMethods.detach(
        paymentMethodID,
        {customer: stripeCustomerID},
    );
    return paymentMethod;
  } catch (err) {
    console.error('Error occured while deleting the payment Intent for the user: ', err.message);
    throw err;
  }
}

/**
 *
*  @param {string} userID - unique id of the user
 * @param {Number} amount - money
 * @param {string} description - description of the payment
 * @param {*} savedpaymentMethodID - saved payment method ID
 * @param {string} customerID - id of the customer
 * @param {*} newPaymentMethodID - new payment method ID
 * @param {*} newPaymentMethodType - new payment method type
 * @return {object} - result
 */
async function makeOneTimePayment(userID, amount, description, savedpaymentMethodID='', customerID='', newPaymentMethodID='', newPaymentMethodType='card') {
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
        userID: userID,
      },
      use_stripe_sdk: true,
    };
    // we need to add the payment method to a customer to reuse a payment method else gives error
    if (savedpaymentMethodID) {
      paymentIntentInfo.payment_method = savedpaymentMethodID;
      paymentIntentInfo.customer = customerID;
    } else if (newPaymentMethodID) {
      // const paymentInfo = {
      //   type: newPaymentMethodType,
      //   metadata: {
      //     userID: userID,
      //   },
      //   card: {token: newPaymentMethodID},
      // };
      // // creating the payment method for the card usign the token
      // const newPaymentMethodResult = await stripe.paymentMethods.create(paymentInfo);

      paymentIntentInfo.payment_method = newPaymentMethodID;
    }
    // write a code to create a payment Intent using the credit card token
    console.log('Executing the payment intent');
    const paymentIntent = await stripe.paymentIntents.create(paymentIntentInfo);

    console.log('One-time Payment:', paymentIntent);
    return paymentIntent;
  } catch (error) {
    console.error('Error making one-time payment:', error.message);
    if (error.type === 'StripeInvalidRequestError') {
      // Handle specific error related to invalid request (e.g., missing parameters)
      console.error('Invalid request error:', error.message);
      return null;
    } else if (error.type === 'StripeCardError') {
      // Handle specific error related to the card (e.g., insufficient funds)
      console.error('Card error:', error.message);
      return null;
    }
    throw error;
  }
};


/**
 *
 * @param {number} amount - amount for that payment
 * @param {string} paymentIntentID - id of the payment intent
 * @return {object} refund result
 */
async function refundPayment(amount, paymentIntentID) {
  try {
    let result;
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentID);
    if (paymentIntent.status !== 'succeeded') {
      const canceledPaymentIntent = await stripe.paymentIntents.cancel(paymentIntentID);
      console.log('PaymentIntent canceled:', canceledPaymentIntent);
      result = canceledPaymentIntent;
    } else {
      const refundresult = await stripe.refunds.create({
        payment_intent: paymentIntentID,
        amount: amount,
      });
      console.log('Refund:', refundresult);
      result = refundresult;
    }
    return result;
  } catch (err) {
    console.log('Error while refunding the payment: ', err.message, err.type);
    if (err.type === 'StripePermissionError') {
      console.error('You do not have permission to refund this charge.');
      // Handle this specific error case
      return null;
    } else if (err.type === 'StripeInvalidRequestError' && err.code === 'charge_already_refunded') {
      console.error('Charge is already refunded.');
      // Handle this specific case where the charge is already refunded
      return null;
    }
    console.error('Error refunding the payment:', err.message);
    throw err;
  }
}

/**
 *
 * @param {string} paymentIntentID - id of the payment
 * @param {number} newAmount - amount to change for the payment
 * @param {boolean} changeAmount - if true then only change the amount
 * @return {object} - latest updated paymentIntent
 */
async function updatePaymentIntent(paymentIntentID, newAmount, changeAmount=true) {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentID);

    if (!['succeeded', 'canceled'].includes(paymentIntent.status)) {
      if (changeAmount) {
        paymentIntent.amount = newAmount;
        // updated payment intent
        await stripe.paymentIntents.update(paymentIntentID, {
          amount: newAmount,
        });
      }
      const confirmedPaymentIntent = await stripe.paymentIntents.confirm(paymentIntentID);

      console.log('PaymentIntent confirmed:', confirmedPaymentIntent.id);
      return confirmedPaymentIntent;
    } else {
      console.log('Payment Intent cannot be updated once it is confirmed');
      if (paymentIntent.status === 'succeeded' ) {
        return paymentIntent;
      }
      return null;
    }
  } catch (err) {
    console.log('Error occured while updating the paymentIntent using stripe: ', err.message);
    throw err;
  }
}

async function attachCustomertoPM(customerID, paymentMethodID) {
  try {

  } catch (err) {

  }
}


module.exports = {createCustomer, createPaymentMethod, deletePaymentMethod, makeOneTimePayment, refundPayment, updatePaymentIntent};
