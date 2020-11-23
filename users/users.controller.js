const express = require('express');
const router = express.Router();
const userService = require('./user.service');

// routes
router.post('/authenticate', authenticate);
router.all('/refresh_authentication', refreshToken);
router.get('/', getAll);

module.exports = router;

function authenticate(req, res, next) {
    userService.authenticate(req.body)
        .then(({refresh_token, ...user}) => {
            console.log(refresh_token, user)
            return res
            .cookie(
                'refresh_token', 
                refresh_token, 
                {
                    httpOnly: true,
                    maxAge: 7 * 24 * 60 * 60 * 1000,
                    path: '/users/refresh_authentication',
                    sameSite: true
                })
            .json(user)
        })
        .catch(next);
}

function getAll(req, res, next) {
    userService.getAll()
        .then(users => res.json(users))
        .catch(next);
}

async function refreshToken(req, res, next) {
    const refresh_token = req.cookies['refresh_token']
    if (refresh_token) {
        try {
            const { refresh_token: new_refresh_token, ...user } = await userService.refreshAuthentication(refresh_token)
            res
            .cookie(
                'refresh_token',
                new_refresh_token, 
                {
                    httpOnly: true,
                    maxAge: 7 * 24 * 60 * 60 * 1000,
                    path: '/users/refresh_authentication',
                    sameSite: true
    //                    signed: true
                }
            )
            .json(user)
        }
        catch {
            res.status(401).json({ error: "Invalid refresh token" })
        }
    } 
    else {
        console.log(`Cookies found: ${Object.entries(req.cookies).map(([key, value]) => `${key}: ${value}`)}`)
        res.status(401).send()
    }
    
}