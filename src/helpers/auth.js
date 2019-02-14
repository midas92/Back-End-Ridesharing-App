const jwt = require('jsonwebtoken');
const config = require('../../config');

const generateJWTToken = (user) => {
    return jwt.sign(
        {
            email: user.email,
            _id: user._id
        },
        config.jwt_secret,
    );
};

const decodedJWT = (jwtString) => {
    return jwt.verify(jwtString, config.jwt_secret);
};

module.exports = {
    generateJWTToken,
    decodedJWT,
};