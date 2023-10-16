const result = require('dotenv').config();

const {CustomServer, CustomResponse} = require('./utilities/server.js');
const {dbInit} = require('./models/dbInitialisation.js');
const authRouter = require('./routes/auth.routes.js');
const firebaseInit = require('./thirdParty/firebaseInit.js');

const server = new CustomServer();
const response = new CustomResponse();

if (result.error) {
  console.error('Environmental variable file is not configured properly');
  process.exit(1);
}
const port = process.env.PORT;
dbInit(process.env.MONGO_DB_URL);
firebaseInit();

server.setRoutes(authRouter);
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
