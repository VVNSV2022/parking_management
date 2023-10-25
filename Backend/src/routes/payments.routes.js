const {CustomRoutes, CustomResponse} = require('../utilities/server');
const {savePaymentMethod} = require('../controllers/payment.controller');

const paymentRouter = new CustomRoutes();
const response = new CustomResponse();


paymentRouter.post('/payments/create', async (req, res)=>{
  try {
    const {paymentType, paymentDetails, BillingDetails} = req.body;

    // Check if all required values are present in the request body
    if (!paymentType || !paymentDetails || !BillingDetails) {
      return res.status(400).json({message: 'Missing required fields', error: true});
    }
    // Pass the details to the controller for further processing
    const response = await savePaymentMethod(paymentType, paymentDetails, BillingDetails);

    // Handle the response from the controller
    if (response.success) {
      // Payment was successful
      response.setResponse(res, {message: 'Payment successful', paymentDetails: response.paymentDetails}, 200);
    } else {
      // Payment failed, provide an error message
      response.setResponse(res, {message: 'Payment failed', message: response.message}, 200);
    }
  } catch (err) {
    console.error('Error occurred while handling the request to save the payment method: ', err.message);
    response.setResponse(res, {message: 'Internal Server Error'}, 500);
  }
});

modules.export = paymentRouter;
