require('dotenv').config();
const jwt = require('jsonwebtoken');

module.exports.createSecretToken = (userId) => {    
    return jwt.sign({ userId }, process.env.TOKEN_SECRET, {
        expiresIn: '1h'
    });
}