const express       = require('express');
const cors          = require('cors');
const bodyParser    = require('body-parser');
const cookieParser  = require('cookie-parser');
const passport      = require('passport');
const LocalStrategy = require('passport-local');
const User          = require('./models/user');

//Get our routes
const userRoutes = require('./routes/userRoutes');
const recipeRoutes = require('./routes/recipeRoutes');

/////////////
//
// SETUP
//
/////////////

//Checkif production or not
if(process.env.NODE_ENV !== 'production'){
    //Load  our .env variables
    require('dotenv').config();
}

//Connect to the DB...
require('./utils/dbconnect');

//Load what we need for login/signup
require('./strategies/JwtStrategy');
require('./strategies/LocalStrategy');
require('./authenticate');

const app = express();
app.use(bodyParser.json());
app.use(cookieParser(process.env.COOKIE_SECRET));

//Add Clientside URL to whitelist array
const whitelistedDomains = process.env.WHITELISTED_DOMAINS ? process.env.WHITELISTED_DOMAINS.split(',') : [];

//Set up our cors
const corsOptions = {
    origin: (origin, callback) =>{
        if(!origin || whitelistedDomains.indexOf(origin) !== -1){
            callback(null, true);
        } else{
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
};

app.use(cors(corsOptions));

//Initialize passport
app.use(require('express-session')({
    secret: process.env.PASSPORT_SECRET,
    resave: false,
    saveUninitialized: false
}))
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//add currentUser to all our templates - add the flash messages to all pages as well
app.use((req, res, next) =>{
	res.locals.currentUser = req.user;
	next();
})

/////////////
//
// ROUTES
//
/////////////

//Set up our app to utilize the userRouter routes
app.use('/api/auth', userRoutes);
app.use('/api/recipes', recipeRoutes);

app.get('/', (req, res) =>{
    res.send({status: 'success'});
});

/////////////
//
// Start our servert on port 8081
//
/////////////

const server = app.listen(process.env.PORT || 8081, ()=>{
    const port = server.address().port;

    console.log('App has started on port:',  port);
});