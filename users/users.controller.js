const express = require('express');
const router = express.Router();
const userService = require('./user.service');

// routes
router.post('/authenticate', authenticate);
router.get('/', getAll);

module.exports = router;

async function authenticate(req, res, next) {
    let refresh_token, user

    const { username, password } = req.body
    const received_refresh_token = req.cookies['refresh_token']

    if (username || password) {
        try {
            ({ refresh_token, ...user } = await userService.authenticateByCredentials(username, password))
        }
        catch {
            return res.status(401).json({ error: "Invalid credentials" })
        }
    } 
    else if(received_refresh_token) {
        try {
            ({ refresh_token, ...user } = await userService.authenticateByRefreshToken(received_refresh_token))
        }
        catch {
            return res.status(401).json({ error: "Invalid refresh token" })
        }
    }
    else {
            return res.status(400).json({ error: "Neither credentials nor refresh token were found" })
    }
    return res
        .cookie(
            'refresh_token', 
            refresh_token, 
            {
                httpOnly: true,
                maxAge: 7 * 24 * 60 * 60 * 1000,
                path: '/users/authenticate',
                sameSite: true
            })
        .json(user)
}

function getAll(req, res, next) {
    userService.getAll()
        .then(users => res.json(users))
        .catch(next);
}