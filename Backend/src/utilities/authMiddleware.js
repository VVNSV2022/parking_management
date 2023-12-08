// authMiddleware.js
const jwt = require('jsonwebtoken');

function authenticateToken(request) {
  const authHeader = request.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return {error: 'Token not provided', status: 401};
  }

  try {
    const user = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    return {user};
  } catch (err) {
    return {error: 'Invalid or expired token', status: 403};
  }
}
module.exports = authenticateToken;
