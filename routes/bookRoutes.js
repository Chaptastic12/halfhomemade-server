const express   = require('express');
const router    = express.Router();
const Book      = require('../models/book');
const Recipe    = require('../models/recipe');
const fileUpload = require('../middleware/file-upload');
const filesystem = require('fs')
const verifyUserIsAdmin  = require('../middleware/auth');
const { verifyUser } = require('../authenticate');

const deleteFileImage = (req) =>{
    if(req.file){
        filesystem.unlink(req.file.path);
    }
}

//Add a book.
router.post('/add', verifyUser, verifyUserIsAdmin, fileUpload.single('bookImage'), ( req, res, next ) =>{
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
});

router.delete('/deleteOneBook/:id', verifyUser, verifyUserIsAdmin, (req, res, next) => {
    Book.findByIdAndDelete(req.params.id, (err, deleteBook) => {
        if(err){
            res.send(err);
        } else {
            //Get our review book
            Book.findById('620150200bec367cd2bdcb39', (err, reviewBook) =>{
                for(let i=0; i < deleteBook.recipes.length; i++){
                    Recipe.findById(deleteBook.recipes[i]._id, (err, foundRecipe) =>{
                        if(err){
                            res.send({error: 'Error updating recipes books'});
                        } else{
                            foundRecipe.recipeBook = reviewBook;
                            foundRecipe.save();
                        }
                    });
                }
                reviewBook.recipes.push(deleteBook.recipes);
                reviewBook.save();
            })
        }
    })
});

module.exports = router;