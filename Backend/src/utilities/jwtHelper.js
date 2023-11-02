const jwt = require('jsonwebtoken');

const jwtAccessSecret = process.env.JWT_ACCESS_SECRET;
const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET;

function createAccessToken(payload) {
    // The access token will expire in 15 minutes
    return jwt.sign(payload, jwtAccessSecret, { expiresIn: '15m' });
}

function createRefreshToken(payload) {
    // The refresh token will not expire. Expiration should be handled manually
    return jwt.sign(payload, jwtRefreshSecret);
}

function verifyAccessToken(token) {
    return jwt.verify(token, jwtAccessSecret);
}

function verifyRefreshToken(token) {
    return jwt.verify(token, jwtRefreshSecret);
}

module.exports = {
    createAccessToken,
    createRefreshToken,
    verifyAccessToken,
    verifyRefreshToken
};

