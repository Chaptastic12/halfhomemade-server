const express   = require('express');
const router    = express.Router();
const User      = require('../models/user');
const passport  = require('passport');
const jwt       = require('jsonwebtoken');

const { getToken, COOKIE_OPTIONS, getRefreshToken, verifyUser } = require('../authenticate');

router.post('/register', (req, res, next) =>{
    //Verify that there is an email address. Could potentially check for other things here
    //Would be a secondary check, as our frontend REACT app will also verify these things
    if (!req.body.email){
        res.statusCode = 500;
        res.send({
            name: 'EmailError',
            message: "The e-mail field is required."
        });
    } else{
        User.register(
            new User({ username: req.body.email, email: req.body.email }), req.body.password, (err, user) => {
                if(err){
                    res.statusCode = 500;
                    res.send(err);
                } else {
                    user.firstName = req.body.firstName;
                    user.lastName = req.body.lastName;

                    const token = getToken({ _id: user._id });
                    const refreshToken = getRefreshToken({ _id: user._id });
                    user.refreshToken.push({ refreshToken });
                    user.save((err, user) => {
                        if(err){
                            res.statusCode = 500;
                            res.send(err);
                        } else {
                            res.cookie('refreshToken', refreshToken, COOKIE_OPTIONS);
                            res.send({ success: true, token });
                        }
                    })
                }
            }
        )
    }
});

//Our route for handling logging in. Must first pass the local auth middleware provided by passport
router.post('/login', passport.authenticate('local'), (req, res, next) =>{
    const token = getToken({_id: req.user._id});
    const refreshToken = getRefreshToken({_id: req.user._id});

    User.findById(req.user.id).then(
        user =>{
            user.refreshToken.push({refreshToken});
            user.save((err, user) =>{
                if(err){
                    res.statusCode = 500;
                    res.send(err);
                } else {
                    res.cookie('refreshToken', refreshToken, COOKIE_OPTIONS);
                    res.send({success: true, token});
                }
            });
        }
    )
});

//Handle our refreshtoken. This will be used to keep the user logged in if necessary
router.post('/refreshtoken', (req, res, next) => {
    const { signedCookies  = {} } = req;
    const { refreshToken } = signedCookies;
    
    if(refreshToken){
        try {
            const payload = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
            const userId = payload._id;

            User.findOne({ _id: userId}).then(
                user => {
                    if(user){
                        //Get our refreshtoken in the db
                        const tokenIndex = user.refreshToken.findIndex( item => item.refreshToken === refreshToken);

                        if(tokenIndex === -1){
                            res.statusCode = 401;
                            res.send('Unathorized');
                        } else {
                            const token = getToken({ _id: userId });
                            //If we already have a refreshtoken, replace it
                            const newRefreshToken = getRefreshToken({ _id: userId});
                            user.refreshToken[tokenIndex] = { refreshToken: newRefreshToken};

                            user.save(( err, user ) => {
                                if(err){
                                    res.statusCode = 500;
                                    res.send(err);
                                } else {
                                    res.cookie('refreshToken', newRefreshToken, COOKIE_OPTIONS);
                                    res.send({success: true, token})
                                }
                            });
                        }
                    } else {
                        res.statusCode = 401;
                        res.send('Unathorized');
                    }
                },
                err => next(err)
            );
        } catch(err){
            res.statusCode = 401
            res.send('Unathorized');
        }
    } else {
        res.statusCode = 401;
        res.send('Unathorized');
    }
});

//Log out our user; remove their refresh tokens. Auth token will be removed on the front end
router.post('/logout', verifyUser, (req, res, next) => {
    const { signedCookies = {} } = req;
    const { refreshToken } = signedCookies;

    User.findById(req.user._id).then(
        user => {
            const tokenIndex = user.refreshToken.findIndex( item => item.refreshToken === refreshToken );
        
            if(tokenIndex !== -1 ){
                user.refreshToken.id(user.refreshToken[tokenIndex]._id).remove();
            } 

            user.save(( err, user ) => {
                if(err){
                    res.statusCode = 500;
                    req.send(err);
                } else {
                    res.clearCookie('refreshToken', COOKIE_OPTIONS);
                    res.send({ success: true });
                }
            })
        },
        err => next(err)
    );
})

router.get('/userPage', verifyUser, (req, res, next) => { 
    res.send(req.user);
})

module.exports = router;