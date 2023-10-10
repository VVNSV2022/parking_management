const {CustomServer, CustomResponse} = require('./utilities/server.js');

const server = new CustomServer();
const response = new CustomResponse();

const port = 4000;
server.get('/', (req, res) => {
  response.setResponse(res, {
    message: 'hello from sairam using the get Method',
  });
});

server.post('/', (req, res) => {
  console.log('hi', req.body);
  response.setResponse(res, {message: 'hello'});
});

server.listen(port, () => {
  console.log(`server listening on port ${port}`);
});
