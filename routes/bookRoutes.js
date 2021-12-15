const express   = require('express');
const router    = express.Router();
const Book      = require('../models/book');

const { verifyUser } = require('../authenticate');

//Add a book.
router.post('/add', verifyUser, ( req, res, next ) =>{
    res.send({received: true});
    if(req.body.bookImg === null || req.body.bookTitle === null ){
            res.statusCode = 500;
            return ({
                name: 'EmptyFieldError',
                message: "All Fields must be filled out"
            });
    }

    if(req.user.isAdmin){
        Book.create(req.body, (err, newBook) =>{
            if(err){
                res.status(500);
                return;
            }
            newBook.bookTitle = req.body.bookTitle;
            newBook.save();
            console.log('Successful Book Save');
            return ({ success: true });
        })
    } 
    return ({ success: false });
})

router.get('/getAllBooks', (req, res, next) => {
    Book.find({}).exec((err, allBooks) =>{
        if(err){
            res.status(500);
            return;
        } else {
            res.send(allBooks);
        }
    })
})

router.get('getOneBook/:id', (req, res, next) =>{
    Book.findById(req.params.id).exec((err, book) => {
        if(err){
            res.status(500);
            return ({ error: 'Error finding book with that ID'});
        } else {
            return book;
        }
    })
})

module.exports = router;