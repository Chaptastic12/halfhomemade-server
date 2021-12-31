const express   = require('express');
const router    = express.Router();
const Book      = require('../models/book');
const fileUpload = require('../middleware/file-upload');
const filesystem = require('fs')

const { verifyUser } = require('../authenticate');

const deleteFileImage = (req) =>{
    if(req.file){
        filesystem.unlink(req.file.path);
    }
}

//Add a book.
router.post('/add', verifyUser, fileUpload.single('bookImage'), ( req, res, next ) =>{
    res.send({received: true});
    if(req.body.bookImg === null || req.body.bookTitle === null ){
            res.statusCode = 500;
            deleteFileImage();
            return ({
                name: 'EmptyFieldError',
                message: "All Fields must be filled out"
            });
    }

    if(req.user.isAdmin){
        Book.create(req.body, (err, newBook) =>{
            if(err){
                res.status(500);
                deleteFileImage();
                return;
            }
            newBook.bookTitle = req.body.bookTitle;
            newBook.id = newBook._id.toString();
            newBook.bookImage = req.file.path;
            newBook.save();
            console.log('Successful Book Save');
            return ({ success: true });
        })
    } 
    deleteFileImage();
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