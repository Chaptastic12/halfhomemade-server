const express            = require('express');
const router             = express.Router();
const Recipe             = require('../models/recipe');
const Book               = require('../models/book');
const Review             = require('../models/review');
const fileUpload         = require('../middleware/file-upload');
const fileResize         = require('../middleware/resize-image');
const verifyUserIsAdmin  = require('../middleware/auth');
const filesystem         = require('fs')
const { verifyUser }     = require('../authenticate');

const deleteFileImage = (req) =>{
    if(req.file){
        console.log(req.file.path)
        filesystem.unlink(req.file.path, (err =>{
            if(err) console.log(err);
            else console.log('deleted file');
        }));
    } else {
        filesystem.unlink(req.recipeImage, (err =>{
            if(err) console.log(err);
            else console.log('deleted file');
        }));
    }
}

//Add a recipe.
router.post('/add', verifyUser, verifyUserIsAdmin, fileUpload.single('recipeImage'), ( req, res, next ) =>{
    if( (req.body.numberOfIngredients === null || req.body.numberofSteps === null || req.body.recipeTitle === null || req.body.recipeDesc === null ) || 
        (req.body.recipeIngredients.length === 0 || req.body.recipeSteps.length === 0 || req.body.recipeTags.length === 0) ){
            res.statusCode = 500;
            deleteFileImage();
            res.send({
                name: 'EmptyFieldError',
                message: "All Fields must be filled out"
            });
            return; 
    }

    //Resize the file we saved with multer
    fileResize(req.file);

    if(req.user.isAdmin){
        //Find the book that this recipe is being added to
        Book.findOne({_id: req.body.bookSelection}, (err, recipeBook) => {
            if(err){
                res.status(500);
                res.send({ error: 'Could not find recipe book' });
                deleteFileImage();
                return;
            } else {
                //Create our recipe and save to database
                Recipe.create(req.body, (err, newRecipe) =>{
                    if(err){
                        res.status(500);
                        return ({ error: 'Error creating recipe'});
                    } else {
                        newRecipe.recipeIngredients = req.body.recipeIngredients;
                        newRecipe.recipeDesc = req.body.recipeDesc;
                        newRecipe.recipeTitle = req.body.recipeTitle;
                        newRecipe.recipeSteps =req.body.recipeSteps;
                        newRecipe.recipeTags = req.body.recipeTags;
                        newRecipe.recipeBook = recipeBook;
                        newRecipe.recipeImage = 'uploads/images/webp' + req.file.filename;
                        newRecipe.recipeRating = 0;
                        newRecipe.save();
                        console.log('Successful Recipe Save');
                        
                        recipeBook.recipes.push(newRecipe._id);
                        recipeBook.save();
                        console.log('Successfully added recipe ID to book');
                        res.send({ success: true, id: newRecipe._id });
                        //Delete the multer file
                        deleteFileImage(req);
                        return;
                    }
                });
            }
        })
    } else {
        res.send({ success: false });
        deleteFileImage();
        return;
    }
});

router.get('/showAllRecipes', (req, res, next) => { 
    Recipe.find({}).exec((err, allRecipes) =>{
        if(err){
            res.status(500);
            return;
        } else {
            res.send(allRecipes);
        }
    })
})

router.get('/getOneRecipe/:id', (req, res, next) => { 
    Recipe.findById(req.params.id).populate('reviews').exec((err, recipe) =>{
        if(err){
            res.status(500);
            return;
        } else {
            res.send(recipe);
        }
    })
})

router.post('/UpdateOneRecipe/:id', verifyUser, verifyUserIsAdmin, fileUpload.single('recipeImage'), (req, res, next) => {
    Book.findById(req.body.bookSelection, (err, recipeBook) =>{
        if(err){
            res.send({error: 'Unable to find book'})
        } else {
            Recipe.findById(req.params.id, (err, updatedRecipe) =>{
                if(err){
                    res.send({error: 'Unable to update recipe'});
                } else {
                    updatedRecipe.recipeIngredients = req.body.recipeIngredients;
                    updatedRecipe.recipeDesc = req.body.recipeDesc;
                    updatedRecipe.recipeTitle = req.body.recipeTitle;
                    updatedRecipe.recipeSteps = req.body.recipeSteps;
                    updatedRecipe.recipeTags = req.body.recipeTags;
                    updatedRecipe.recipeBook = recipeBook;
                    updatedRecipe.recipeRating = req.body.recipeRating;
                    if(req.body.updateImage === 'true'){
                        //Delete the old image, and replace it with the new one
                        deleteFileImage(updatedRecipe);
                        //Resize the file we saved with multer
                        fileResize(req.file);
                        updatedRecipe.recipeImage = 'uploads/images/webp' + req.file.filename;
                    } 
                    updatedRecipe.save();
                    //deleteFileImage(req.body);
                    res.send({success: 'Update successful', id: req.params.id});
                }
            });
        }
    })
});

router.delete('/deleteOneRecipe/:id', verifyUser, verifyUserIsAdmin, (req, res, next) => {
    Recipe.findByIdAndRemove(req.params.id, (err, deleteRecipe) => {
        if(err){
            res.send(err);
        } else {
            //Remove all of the reviews
            Review.remove({_id: {$in: deleteRecipe.reviews } }, (err) => {
                if(err){
                    res.send({ error: 'Error removing Reviews from recipe', err })
                } else {
                    Recipe.remove();
                    //If we found our recipe, we also need to delete the image associated
                    deleteFileImage(deleteRecipe);
                    res.send({succes: 'Deleted' + req.params.id});
                }
            });
        }
    })
})

router.get('/deleteAllRecipes', verifyUser, verifyUserIsAdmin, (req, res, next) => {
    Recipe.deleteMany({}, (err, success) => {
        if(err){
            res.send(err)
        }else {
            res.send({success: 'All deleted'})
        }
    });
})

const calculateReviewAverage = reviews => {
    if(reviews.length === 0){
        return 0;
    }
    let sum =0;
    reviews.forEach((review) => {
        sum+= review.rating;
    });
    return sum / reviews.length;
}

router.post('/reviewARecipe/:id', verifyUser, fileUpload.single('recipeImage'), ( req, res, next) =>{
    Recipe.findById(req.params.id).populate('reviews').exec((err, foundRecipe) => {
        if(err){
            res.send({error: 'Error finding recipe', err})
        } else {
            Review.create(req.body, (err, newReview) =>{
                if(err){
                    res.send({error: 'Error creating review', err})
                } else {
                    newReview.author.id = req.user._id
                    newReview.author.username = req.user.username;
                    newReview.recipe = foundRecipe._id;
                    newReview.save();

                    foundRecipe.reviews.push(newReview);
                    foundRecipe.recipeRating = calculateReviewAverage(foundRecipe.reviews);
                    foundRecipe.save();
                    res.send({succes: 'Successfully submitted review'});
                }
            })
        }
    });
});

router.delete('/deleteAReview/:id/:reviewId', verifyUser, fileUpload.single('recipeImage'), (req, res, next) => {
    Review.findById(req.params.reviewId, (err, foundReview) => {
        if(err){
            res.send({error: 'Error finding review'}, err);
        } else {
            if(foundReview.author.id.toString() === req.user.id || req.user.isAdmin === true){
                Recipe.findByIdAndUpdate(req.params.id, {$pull: { reviews: req.params.reviewId}}, {safe: true, upsert: true }, (err, foundRecipe) =>{
                    if(err){
                        res.send({error: 'Error finding recipe with review', err});
                    } else {
                        foundRecipe.recipeRating = calculateReviewAverage(foundRecipe.reviews);
                        foundRecipe.save();
                        res.send({success: 'Review deleted successfully'});
                    }
                });
            } else {
            }
        }
    });
});

router.post('/editARecipe/:id/:reviewId', verifyUser, fileUpload.single('recipeImage'), (req, res, next) => {
    Review.findById(req.params.reviewId, (err, foundReview) => {
        if(err){
            res.send({error: 'Error finding review', err});
        } else {
            if(foundReview.author.id.toString() === req.user.id || req.user.isAdmin === true){
                foundReview.rating = req.body.rating;
                foundReview.text = req.body.text;

                foundReview.save();
                Recipe.findById(req.params.id).populate('reviews').exec((err, foundRecipe) => {
                    if(err){
                        res.send({error: 'Error finding Recipe', err});
                    }else{
                        foundRecipe.recipeRating = calculateReviewAverage(foundRecipe.reviews);
                        foundRecipe.save();
                        res.send({ success: 'Review has been updated' });
                    }
                })
            }else{
                res.send({error: 'You do not own the rights to this review to delete it'})
            }
        }
    })
})


module.exports = router;