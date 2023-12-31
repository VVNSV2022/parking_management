const result = require('dotenv').config();

const {CustomServer, CustomResponse} = require('./utilities/server.js');
const firebaseInit = require('./thirdParty/firebaseInit.js');


const server = new CustomServer();
const response = new CustomResponse();

if (result.error) {
  console.error('Environmental variable file is not configured properly');
  process.exit(1);
}
const port = process.env.PORT;
firebaseInit();


// error occuring when we place this before firebase initialisation because reservation router is using firebase before it
const paymentRouter = require('./routes/payments.routes.js');
const reservationRouter = require('./routes/reservation.routes.js');
const userRouter = require('./routes/users.routes');
const adminRouter = require('./routes/admin.routes');
const parkingLotRouter = require('./routes/parkingLot.routes.js');
const elevatorRouter = require('./routes/elevator.routes.js'); // for elevator terminal
// const commonRouter = require('./routes/common.routes.js');
const billDetailsRouter = require('./routes/billDetails.routes.js');
const membershipRouter = require('./routes/memberships.routes.js');
const vehicleRouter = require('./routes/vehicle.routes.js');

server.setRoutes(userRouter);
server.setRoutes(adminRouter);
server.setRoutes(paymentRouter);
server.setRoutes(reservationRouter);
server.setRoutes(elevatorRouter);
server.setRoutes(parkingLotRouter);
server.setRoutes(billDetailsRouter);
server.setRoutes(membershipRouter);
server.setRoutes(vehicleRouter);
server.setRoutes(elevatorRouter);


// server.setRoutes(commonRouter);
server.get('/', (req, res) => {
  response.setResponse(res, {
    message: 'hello from sairam using the get Method',
    cookies: req.cookies,
  });
});

server.post('/', (req, res) => {
  console.log('hi', req.body);
  response.setResponse(res, {message: 'hello'});
});


server.listen(port, () => {
  console.log(`server listening on port ${port}`);
});

module.exports = server;
