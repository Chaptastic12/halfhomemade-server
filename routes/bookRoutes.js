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
    if(req.body.bookImg === null || req.body.bookTitle === null ){
        res.statusCode = 500;
        deleteFileImage(req);
        res.send({
            name: 'EmptyFieldError',
            message: "All Fields must be filled out"
        });
    }

    if(req.user.isAdmin){
        Book.create(req.body, (err, newBook) =>{
            if(err){
                res.status(500);
                deleteFileImage(req);
                res.send({error: 'Permission creating book'})
            }
            newBook.bookTitle = req.body.bookTitle;
            newBook.id = newBook._id.toString();
            newBook.bookImage = req.file.path;
            newBook.save();
            console.log('Successful Book Save');
            res.send({ success: 'Successfully added book' });
        })
    } else {
        deleteFileImage(req);
        res.send({ success: 'Failed to add book'});
    }
})

router.get('/getAllBooks', (req, res, next) => {
    Book.find({}).populate('recipes').exec((err, allBooks) =>{
        if(err){
            res.status(500);
            res.send({error: 'Error getting all books', err});
        } else {
            res.send(allBooks);
        }
    })
})

router.get('getOneBook/:id', (req, res, next) =>{
    Book.findById(req.params.id).exec((err, book) => {
        if(err){
            res.status(500);
            res.send({ error: 'Error finding book with that ID'});
        } else {
            res.send(book);
        }
    })
})

module.exports = router;