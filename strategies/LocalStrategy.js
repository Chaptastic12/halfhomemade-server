const passport      = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User          = require('../models/user');

//Will be used for login / signup
passport.use(new LocalStrategy(User.authenticate()));

//Used after logging in / signing up to set our user details
passport.serializeUser(User.serializeUser());

passport.deserializeUser(User.deserializeUser());
