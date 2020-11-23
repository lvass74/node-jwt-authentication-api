const expressJwt = require('express-jwt');
const jwt = require('jsonwebtoken');
const config = require('config.json');
const algorithm = 'HS256';


function jwtMiddleware() {
    const { secret } = config;
    return expressJwt({ secret, algorithms: [algorithm] }).unless({
        path: [
            // public routes that don't require authentication
            '/users/authenticate',
            '/users/refresh_authentication'
        ]
    });
}

// utility methods to ensure consistent use of jwt options to avoid common pitfalls

function jwtVerifyToken(token) {
    const { secret } = config;
    return jwt.verify(token, secret, { algorithms: [algorithm] })
}

function jwtCreateToken(payload, expiresIn) {
    const { secret } = config;
    return jwt.sign(payload, secret, { expiresIn, algorithm: algorithm });
}

function jwtCreateAccessToken(payload) {
    return jwtCreateToken(payload, '15m')
}

function jwtCreateRefreshToken(payload) {
    return jwtCreateToken(payload, '7d')
}

module.exports = {
    jwtMiddleware,
    jwtVerifyToken,
    jwtCreateAccessToken,
    jwtCreateRefreshToken
};
