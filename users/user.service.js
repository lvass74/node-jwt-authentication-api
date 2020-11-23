const config = require('config.json');
const { response } = require('express');
const { jwtVerifyToken, jwtCreateAccessToken, jwtCreateRefreshToken } = require('../_helpers/jwt');

// users hardcoded for simplicity, store in a db for production applications
const users = [
    { id: 1, username: 'test', password: 'test', firstName: 'Test', lastName: 'User' },
    { id: 2, username: 'lvass', password: 'abcd74', firstName: 'László', lastName: 'Vass' },
];

module.exports = {
    authenticate,
    refreshAuthentication,
    getAll
};

async function authenticate({ username, password }) {
    const user = users.find(u => u.username === username && u.password === password);

    if (!user) throw 'Username or password is incorrect';

    // create a jwt token that is valid for 7 days
    const token = jwtCreateAccessToken({ userId: user.id })
    const refresh_token = jwtCreateRefreshToken({ userId: user.id })

    return {
        ...omitPassword(user),
        token,
        refresh_token
    };
}

async function refreshAuthentication(input_refresh_token) {
    const parsed_token = jwtVerifyToken(input_refresh_token)
    if ( ! parsed_token ) {
        throw 'Failed to validate token';
    }
    console.log(`Got a valid refresh token`, parsed_token)
    // @ts-ignore
    const user = users.find(u => u.id === parsed_token.userId )
    console.log(`Refresh token belongs to`, user)


    if (!user) throw 'Username or password is incorrect';

    // create a jwt token that is valid for 7 days
    const token = jwtCreateAccessToken({ userId: user.id })
    const refresh_token = jwtCreateRefreshToken({ userId: user.id })

    return {
        ...omitPassword(user),
        token,
        refresh_token
    };
}
async function getAll() {
    return users.map(u => omitPassword(u));
}

// helper functions

function omitPassword(user) {
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
}