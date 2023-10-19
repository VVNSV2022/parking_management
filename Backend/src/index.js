const result = require('dotenv').config();

const {CustomServer, CustomResponse} = require('./utilities/server.js');
const firebaseInit = require('./thirdParty/firebaseInit.js');
const {createUser} = require('./controllers/user.controller.js');

const server = new CustomServer();
const response = new CustomResponse();

if (result.error) {
  console.error('Environmental variable file is not configured properly');
  process.exit(1);
}
const port = process.env.PORT;
firebaseInit();

// server.setRoutes(authRouter);
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

server.post('/auth', async (req, res)=>{
  try {
    const {email, password, username} = req.body;
    if (!email || !password || !username) {
      return response.setResponse(res, {message: 'send all the details', success: false}, 401);
    }
    const userdata = {
      email: email,
      password: password,
      emailVerified: false,
      displayName: username,
      disabled: false,
    };
    const userRecord = await createUser(userdata);
    console.log(userRecord);
    response.setResponse(res, {message: 'account created successfully', success: true}, 200);
  } catch (err) {
    console.log(err.message);
    response.setResponse(res, {message: 'error creating the account', success: false}, 500);
  }
});

server.listen(port, () => {
  console.log(`server listening on port ${port}`);
});
