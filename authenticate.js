const passport = require('passport');
const jwt      = require('jsonwebtoken');
const dev      = process.env.NODE_ENV !== 'production';

//Used to create our refresh token, which needs to be httpOnly and secure so that it cannot be read by the client javascript.
//sameSite set to none since client and server are on separate domains
exports.COOKIE_OPTIONS = {
    httpOnly: true,
    secure: !dev,
    signed: true,
    maxAge: eval(process.env.REFRESH_TOKEN_EXPIRY) * 1000,
    sameSite: 'none'
}
//Creates our JWT
exports.getToken = user => {
    return jwt.sign(user, process.env.JWT_SECRET, {
        expiresIn: eval(process.env.SESSION_EXPIRY) 
    });
}

//Used to create our refreshtoken
exports.getRefreshToken = user =>{
    const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET, {
        expiresIn: eval(process.env.REFRESH_TOKEN_EXPIRY)
    });
}

//Middleware that will be called for each authenticated request
exports.verifyUser = passport.authenticate('jwt', { session: false });