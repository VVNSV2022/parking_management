const {CustomRoutes, CustomResponse} = require('../utilities/server');
<<<<<<< HEAD
const {getUserPaymentMethods, savePaymentMethod, deletePM, makePayment, refundPaidPayment, updatePaymentAmount} = require('../controllers/payment.controller');
=======
const {getUserPaymentMethods, savePaymentMethod, deletePaymentMethod, makePayment, refundPaidPayment, updatePaymentAmount} = require('../controllers/payment.controller');
>>>>>>> 9e7eb84 (Customer subgroup commit)

const paymentRouter = new CustomRoutes();
const response = new CustomResponse();

paymentRouter.get('/payments/', async (req, res)=>{
  try {
    const queryParameters = req.queryParameters;
    if (!queryParameters.userID) {
      return response.setResponse(res, {message: 'Missing important fields', success: false}, 400);
    }
    const userID = queryParameters.userID;
    const result = await getUserPaymentMethods(userID);
    if (result.success) {
      return response.setResponse(res, {message: result.message, success: true, data: result.data}, 200);
    }
    return response.setResponse(res, {message: result.message, success: false}, 400);
  } catch (err) {
    console.error('Error occurred while handling the request to get the saved payment methods: ', err.message);
    return response.setResponse(res, {message: 'Internal Server Error'}, 500);
  }
});

paymentRouter.post('/payments/create', async (req, res)=>{
  try {
    const {userID, paymentType, paymentToken, BillingDetails} = req.body;
    // Check if all required values are present in the request body
    if (!userID || !paymentType || !paymentToken || !BillingDetails) {
      return response.setResponse(res, {message: 'Missing required fields', error: true}, 400);
    }
    // Pass the details to the controller for further processing
    const result = await savePaymentMethod(userID, paymentType, paymentToken, BillingDetails);

    // Handle the response from the controller
    if (result.success) {
      // Payment was successful
<<<<<<< HEAD
      return response.setResponse(res, {message: 'Payment Method saved successfully', data: result.data}, 200);
=======
      return response.setResponse(res, {message: 'Payment Method saved successfully'}, 200);
>>>>>>> 9e7eb84 (Customer subgroup commit)
    } else {
      // Payment failed, provide an error message
      console.log(result);
      return response.setResponse(res, {message: 'Payment method failed to save'}, 200);
    }
  } catch (err) {
    console.error('Error occurred while handling the request to save the payment method: ', err.message);
    return response.setResponse(res, {message: 'Internal Server Error'}, 500);
  }
});

paymentRouter.delete('/payments/delete', async (req, res)=>{
  try {
    const {userID, paymentMethodID} = req.body;
    // Check if all required values are present in the request body
    if (!userID || !paymentMethodID) {
      return response.setResponse(res, {message: 'Missing required fields', error: true}, 400);
    }

<<<<<<< HEAD
    const result = await deletePM(userID, paymentMethodID);
=======
    const result = await deletePaymentMethod(userID, paymentMethodID);
>>>>>>> 9e7eb84 (Customer subgroup commit)
    if (result.success) {
      return response.setResponse(res, {message: 'Payment Delete successful'}, 200);
    } else {
      return response.setResponse(res, {message: result.message, error: true}, 200);
    }
  } catch (err) {
    console.error('Error occurred while handling the request to delete the payment method: ', err.message);
    return response.setResponse(res, {message: 'Internal Server Error'}, 500);
  }
});

paymentRouter.post('/payments/makePayment', async (req, res)=>{
  try {
    const {userID, amount, description, savePaymentMethodID, newPaymentMethodID, newPaymentMethodType} = req.body;
    if (!userID || !amount || !description || !(savePaymentMethodID || (newPaymentMethodID && newPaymentMethodType) )) {
      return response.setResponse(res, {message: 'Missing required fields', success: false}, 400);
    }

    const result = await makePayment(userID, amount, description, savePaymentMethodID, newPaymentMethodID, newPaymentMethodType);

    if (result.success) {
      return response.setResponse(res, {message: 'payment Made Successfully', paymentId: result.id, success: true}, 200);
    }
    return response.setResponse(res, {message: result.message, success: false}, 400);
  } catch (err) {
    console.error('Error occurred while handling the request to make the payment: ', err.message);
    return response.setResponse(res, {message: 'Internal Server Error'}, 500);
  }
});

paymentRouter.post('/payments/refund', async (req, res)=>{
  try {
<<<<<<< HEAD
    const {userID, paymentID} = req.body;
    if (!userID || !paymentID) {
      return response.setResponse(res, {message: 'Missing required fields', success: false}, 400);
    }
    const result = await refundPaidPayment(userID, paymentID);
=======
    const {userID, paymentId, amount} = req.body;
    if (!userID || !paymentId || !amount) {
      return response.setResponse(res, {message: 'Missing required fields', success: false}, 400);
    }
    const result = await refundPaidPayment(userID, amount, paymentId);
>>>>>>> 9e7eb84 (Customer subgroup commit)

    if (result.success) {
      return response.setResponse(res, {message: 'payment refunded Successfully', paymentId: result.data.id, success: true}, 200);
    }
    return response.setResponse(res, {message: result.message, success: false}, 400);
  } catch (err) {
    console.error('Error occurred while handling the refunding the payment: ', err.message);
    return response.setResponse(res, {message: 'Internal Server Error'}, 500);
  }
});

<<<<<<< HEAD
paymentRouter.put('/payments/updatePaymentAmount', async (req, res)=>{
  try {
    const {userID, paymentIntentID, newAmount} = req.body;
    if (!userID || !paymentIntentID || !newAmount) {
      return response.setResponse(res, {message: 'Missing required fields', success: false}, 400);
    }
    const result = await updatePaymentAmount(userID, newAmount, paymentIntentID);
=======
paymentRouter.post('/payments/updatePaymentAmount', async (req, res)=>{
  try {
    const {userID, paymentIntentID, newAmount, originalAmount} = req.body;
    if (!userID || !paymentIntentID || !newAmount || !originalAmount) {
      return response.setResponse(res, {message: 'Missing required fields', success: false}, 400);
    }
    const result = await updatePaymentAmount(userID, newAmount, originalAmount, paymentIntentID);
>>>>>>> 9e7eb84 (Customer subgroup commit)

    if (result.success) {
      return response.setResponse(res, {message: 'new Amount updated to payment Intent Successfully', paymentId: result.data.id, success: true}, 200);
    }
    return response.setResponse(res, {message: result.message, success: false}, 400);
  } catch (err) {
    console.error('Error occurred while handling the updating payment amount: ', err.message);
    return response.setResponse(res, {message: 'Internal Server Error'}, 500);
  }
});

module.exports = paymentRouter;
