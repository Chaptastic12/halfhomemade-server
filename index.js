const express      = require('express');
const cors         = require('cors');
const bodyParser   = require('body-parser');
const cookieParser = require('cookie-parser');

if(process.env.NODE_ENV !== 'production'){
    //Load  our .env variables
    require('dontenv').config();
}

require('.utils/dbconnect');

const app = express();

app.use(bodyParser.json());
app.use(cookieParser(process.env.COOKIE_SECRET));

//Add Clientside URL to whitelist array
const whitelistedDomains = process.env.WHITELISTED_DOMAINS ? process.env.WHITELISTED_DOMAINS.split(',') : [];

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

app.get('/', (req, res) =>{
    res.send({status: 'success'});
});

//Start our servert on port 8081

const server = app.listen(process.env.PORT || 8081, ()=>{
    const port = server.address().port;

    console.log('App has started on port:',  port);
})