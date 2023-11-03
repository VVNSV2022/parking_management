require('dotenv').config();

const stripe = require('stripe')(process.env.SecretKey);
<<<<<<< HEAD
const {updateUserDetails} = require('./user.firestore');
=======
>>>>>>> 9e7eb84 (Customer subgroup commit)

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
<<<<<<< HEAD
    // save the customer id in the database
    const customerID = customer.id;
    const result = await updateUserDetails(userID, {StripeCustomerID: customerID});
    if (result) {
      console.log('Customer created successfully in the stripe API');
      return customerID;
    }
    return null;
=======
    return customer;
>>>>>>> 9e7eb84 (Customer subgroup commit)
  } catch (err) {
    console.error('Error occured while creating the customer: ', err.message);
    throw err;
  }
}

/**
 *
<<<<<<< HEAD
 * @param {string} userID - unique user id
=======
 * @param {string} userId - unique user id
>>>>>>> 9e7eb84 (Customer subgroup commit)
 * @param {string} paymentType - type of the payment card or bank account
 * @param {object} paymentToken - details for the type of payment encrypted
 * @param {object} billingDetails -a ddress details
 * @param {string} customerID - unique customer id
 * @return {object} - paymentmethod
 */
<<<<<<< HEAD
async function createPaymentMethod(userID, paymentType, paymentToken, billingDetails, customerID=' ') {
=======
async function createPaymentMethod(userId, paymentType, paymentToken, billingDetails, customerID=' ') {
>>>>>>> 9e7eb84 (Customer subgroup commit)
  try {
    const paymentInfo = {
      type: paymentType,
      billing_details: billingDetails,
      metadata: {
<<<<<<< HEAD
        userID: userID,
=======
        user_id: userId,
>>>>>>> 9e7eb84 (Customer subgroup commit)
      },
    };
    if (paymentType=='card') {
      paymentInfo.card = {token: paymentToken};
    }// else {
    //   paymentInfo.ach_debit = {token: paymentToken};
    // }
    // Create a Payment Method
<<<<<<< HEAD
    const paymentMethod = await stripe.paymentMethods.create(paymentInfo);
    // customerID is created
    let stripeCustomerID = customerID;
    if (!customerID) {
      const customer = await createCustomer(userID, billingDetails.name, billingDetails.email, billingDetails.phone);
      stripeCustomerID = customer;
    }
    // Attach the Payment Method to the Customer
    const attachedPaymentMethod = await stripe.paymentMethods.attach(
        paymentMethod.id,
        {customer: stripeCustomerID},
    );
    return attachedPaymentMethod;
=======
    if (!customerID) {
      const customer = await createCustomer(userId, billingDetails.name, billingDetails.email, billingDetails.phone);
      paymentInfo.customer = customer.id;
    }
    const paymentMethod = await stripe.paymentMethods.create(paymentInfo);
    return paymentMethod;
>>>>>>> 9e7eb84 (Customer subgroup commit)
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
<<<<<<< HEAD
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
=======
 * @param {string} paymentMethodId - unique payment intent for the users payment id
 * @return {object} - paymentmethod
 */
// async function deletePaymentMethod(paymentMethodId) {
//   try {
//     const paymentMethod = await stripe.paymentMethods.detach(
//         paymentMethodId,
//     );
//     return paymentMethod;
//   } catch (err) {
//     console.error('Error occured while deleting the payment Intent for the user: ', err.message);
//     throw err;
//   }
// }

/**
 *
*  @param {string} userId - unique id of the user
 * @param {Number} amount - money
 * @param {string} description - description of the payment
 * @param {*} savedpaymentMethodID - saved payment method ID
>>>>>>> 9e7eb84 (Customer subgroup commit)
 * @param {*} newPaymentMethodID - new payment method ID
 * @param {*} newPaymentMethodType - new payment method type
 * @return {object} - result
 */
<<<<<<< HEAD
async function makeOneTimePayment(userID, amount, description, savedpaymentMethodID='', customerID='', newPaymentMethodID='', newPaymentMethodType='card') {
=======
async function makeOneTimePayment(userId, amount, description, savedpaymentMethodID='', newPaymentMethodID='', newPaymentMethodType='card') {
>>>>>>> 9e7eb84 (Customer subgroup commit)
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
<<<<<<< HEAD
        userID: userID,
=======
        userId: userId,
>>>>>>> 9e7eb84 (Customer subgroup commit)
      },
      use_stripe_sdk: true,
    };
    // we need to add the payment method to a customer to reuse a payment method else gives error
    if (savedpaymentMethodID) {
      paymentIntentInfo.payment_method = savedpaymentMethodID;
<<<<<<< HEAD
      paymentIntentInfo.customer = customerID;
    } else if (newPaymentMethodID) {
      const paymentInfo = {
        type: newPaymentMethodType,
        metadata: {
          userID: userID,
        },
        card: {token: newPaymentMethodID},
      };
      const newPaymentMethodResult = await stripe.paymentMethods.create(paymentInfo);

      paymentIntentInfo.payment_method = newPaymentMethodResult.id;
    }
    // write a code to create a payment Intent using the credit card token
    console.log('Executing the payment intent');
    const paymentIntent = await stripe.paymentIntents.create(paymentIntentInfo);

=======
    } else if (newPaymentMethodID) {
      paymentIntentInfo.payment_method_types = newPaymentMethodType;
      paymentIntentInfo.payment_method_data = newPaymentMethodID;
    }

    const paymentIntent = await stripe.paymentIntents.create(paymentIntentInfo);

    // Confirm the Payment Intent
    // const confirmedPaymentIntent = await stripe.paymentIntents.confirm(paymentIntent.id);

>>>>>>> 9e7eb84 (Customer subgroup commit)
    console.log('One-time Payment:', paymentIntent);
    return paymentIntent;
  } catch (error) {
    console.error('Error making one-time payment:', error.message);
    throw error;
  }
};

<<<<<<< HEAD
=======
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
>>>>>>> 9e7eb84 (Customer subgroup commit)

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
<<<<<<< HEAD
    if (err.type === 'StripePermissionError') {
      console.error('Attempting to cancel PaymentIntent...');
      try {
        const canceledPaymentIntent = await stripe.paymentIntents.cancel(paymentIntentId);
        console.log('PaymentIntent canceled:', canceledPaymentIntent);
        return canceledPaymentIntent;
      } catch (cancellationError) {
        console.error('Error canceling PaymentIntent:', cancellationError.message);
      }
      console.error('Error refunding the payment:', err.message);
      throw err;
    }
=======
    console.error('Error refunding the payment:', error);
    throw err;
>>>>>>> 9e7eb84 (Customer subgroup commit)
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
<<<<<<< HEAD

    if (!['succeeded', 'canceled'].includes(paymentIntent.status)) {
      paymentIntent.amount = newAmount;
      // updated payment intent
      await stripe.paymentIntents.update(paymentIntentID, {
        amount: newAmount,
      });

      const confirmedPaymentIntent = await stripe.paymentIntents.confirm(paymentIntentID);

=======
    console.log(paymentIntent);
    if (!['succeeded', 'canceled'].includes(paymentIntent.status)) {
      paymentIntent.amount = newAmount;

      const updatedPaymentIntent = await stripe.paymentIntents.update(paymentIntentID, {
        amount: newAmount,
      });
      console.log(updatedPaymentIntent);
      const confirmedPaymentIntent = await stripe.paymentIntents.confirm(paymentIntentID);
      console.log(confirmedPaymentIntent);
>>>>>>> 9e7eb84 (Customer subgroup commit)
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

<<<<<<< HEAD

module.exports = {createCustomer, createPaymentMethod, deletePaymentMethod, makeOneTimePayment, refundPayment, updatePaymentIntent};
=======
module.exports = {createCustomer, createPaymentMethod, makeOneTimePayment, refundPayment, updatePaymentIntent};
// module.exports = {createCustomer, createPaymentMethod, deletePaymentMethod, makeOneTimePayment, refundPayment, updatePaymentIntent};
>>>>>>> 9e7eb84 (Customer subgroup commit)
