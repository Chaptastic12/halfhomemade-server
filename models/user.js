const mongoose = require('mongoose');
const passport = require('passport');
const Schema   = mongoose.Schema;

const passportLocalMongoose = require('passport-local-mongoose');

const Session = new Schema({
    refreshToken: {
        type: String,
        default: ''
    }
});

const User = new Schema({
    firstName: {
        type: String,
        default: ''
    },
    lastName: {
        type: String,
        default: ''
    },
    email: {
        type: String,
        unique: true,
        required: true
    },
    authStrategy: {
        type: String,
        default: 'local'
    },
    points: {
        type: Number,
        default: 50
    },
    refreshToken: {
        type: [Session]
    },
    isAdmin: {
        type: Boolean,
        default: false
    }
});

//Remove refreshToken(s) from response so its not exposed when we send the dat
// in the API response
User.set('toJSON', {
    transform: (doc, ret, options) =>{
        delete ret.refreshToken;
        return ret;
    }
});

User.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', User);