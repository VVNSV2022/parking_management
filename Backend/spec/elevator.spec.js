const request = require('request');
const fs = require('fs');
const app = require('../src/index');

const elevatorRouter = require('../src/routes/elevator.routes.js');


describe('Elevator API', () => {
  it('check-in for a valid reservation with Elevator layout', (done) => {
    const requestData = {
      url: 'http://localhost:4000/api/elevator/scan-license-plate',
      method: 'POST',
      json: true,
      body: {
        licensePlate: 'WERTYU',
      },
    };

    request(requestData, (error, response, body) => {
      expect(response.statusCode).toBe(200);
      expect(body.message).toBe('Check-in successfully initiated for the reservation with parking id:');
      expect(body.parkingLotID).toBeDefined(); // Ensure parkingLotID exists in the response
      done();
    });
  });

  it('Missing License Plate Number', (done) => {
    const requestData = {
      url: 'http://localhost:4000/api/elevator/scan-license-plate',
      method: 'POST',
      json: true,
      body: {},
    };

    request(requestData, (error, response, body) => {
      expect(response.statusCode).toBe(400);
      expect(body.message).toBe('Missing license plate number');
      done();
    });
  });

  it('No reservation found for the provided license plate number', (done) => {
    const requestData = {
      url: 'http://localhost:4000/api/elevator/scan-license-plate',
      method: 'POST',
      json: true,
      body: {
        licensePlate: 'ABCD',
      },
    };

    request(requestData, (error, response, body) => {
      expect(response.statusCode).toBe(404);
      expect(body.message).toBe('No reservation found for the provided license plate number.');
      done();
    });
  });
});
