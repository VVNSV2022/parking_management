const request = require('request');
const fs = require('fs');
const app = require('../src/index'); // Assuming your Express app is defined in app.js

// Define the path to the JSON file to save the testing data
const paymentsFileData = 'spec/data/payments.json';
// Load the testing data from the JSON file
const paymentData = JSON.parse(fs.readFileSync(paymentsFileData, 'utf8'));

describe('Payment API', () => {
  // Test case for creating a payment method
  let paymentMethodID;
  describe('POST /api/payment', () => {
    it('should create a new payment', (done) => {
      const apiData = {
        userID: paymentData.userID,
        ...paymentData.payments[0],
      };
      request.post({
        url: 'http://localhost:4000/payments/create',
        json: apiData,
      }, (error, response, body) => {
        if (error) return done(error);

        // Save the response data to the JSON file
        const responseData = body;
        paymentMethodID = responseData.data.paymentMethodID;
        expect(response.statusCode).toBe(201);
        done();
      });
    });
  });

  // Test case for getting all payment methods
  describe('GET /api/payments', () => {
    it('should get all payments', (done) => {
      request.get({
        url: 'http://localhost:4000/payments/',
        qs: {
          userID: paymentData.userID,
        },
      }, (error, response, body) => {
        if (error) return done(error);

        // Save the response data to the JSON file
        const responseData = JSON.parse(body);
        expect(response.statusCode).toBe(200);
        done();
      });
    });
  });

  // Test case for deleting a payment method


  describe('DELETE /api/payments', () => {
    it('should delete a payment', (done) => {
      const apiData = {
        userID: paymentData.userID,
        paymentMethodID: paymentMethodID,
      };
      console.log(apiData);
      request.delete({
        url: 'http://localhost:4000/payments/delete',
        json: apiData,
      }, (error, response, body) => {
        if (error) return done(error);

        // Save the response data to the JSON file
        const responseData = body;
        expect(response.statusCode).toBe(400);
        done();
      });
    });
  });
});
