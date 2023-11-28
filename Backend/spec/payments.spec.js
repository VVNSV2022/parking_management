const request = require('request');
const fs = require('fs');
const app = require('../src/index'); // Assuming your Express app is defined in app.js

// Define the path to the JSON file to save the testing data
const paymentsFileData = 'spec/data/payments.json';
// Load the testing data from the JSON file
const paymentData = JSON.parse(fs.readFileSync(paymentsFileData, 'utf8'));


describe('Payments Routes', ()=>{
  let accessToken; let refreshToken; let paymentMethodID;
  // Before any tests run, send the request to the login route
  beforeAll((done)=>{
    const apiData = {
      email: paymentData.email,
      password: paymentData.password,
    };
    request.post({
      url: 'http://localhost:4000/user/login',
      json: apiData,
    }, (error, response, body) => {
      if (error) return done(error);

      // Save the response data to the JSON file
      const responseData = body;
      console.log(responseData);
      accessToken = responseData.accessToken;
      refreshToken = responseData.refreshToken;
      expect(response.statusCode).toBe(200);
      done();
    });
  });


  // Test case for creating a payment method
  it('should create a new payment', (done) => {
    const apiData = {
      userID: paymentData.userID,
      ...paymentData.payments[0],
    };
    request.post({
      url: 'http://localhost:4000/payments/create',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      json: apiData,
    }, (error, response, body) => {
      if (error) return done(error);

      // Save the response data to the JSON file
      const responseData = body;
      console.log(responseData);
     // paymentMethodID = responseData.data.paymentMethodID;
      expect(response.statusCode).toBe(201);
      done();
    });
  });

  it('should get all payments', (done) => {
    request.get({
      url: 'http://localhost:4000/payments/',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
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

  // Test case for deleting a payment method
  it('should delete a payment', (done) => {
    const apiData = {
      userID: paymentData.userID,
      paymentMethodID: paymentMethodID,
    };
    request.delete({
      url: 'http://localhost:4000/payments/delete',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
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
