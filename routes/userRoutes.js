const express = require('express');
const router  = express.Router();
const User    = require('../models/user');
const passport = require('passport');

const { getToken, COOKIE_OPTIONS, getRefreshToken } = require('../authenticate');

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

module.exports = router;