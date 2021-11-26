const mongoose = require('mongoose');
const url      = process.env.MONGO_DB_CONNECTION_STRING;
const connect  = mongoose.connect(ulr, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
});

connect
    .then(db =>{
        console.log('Connected to homemade server');
    })
    .catch(err =>{
        console.log('Error attempting to reach server');
    });
