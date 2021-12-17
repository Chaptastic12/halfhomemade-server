const express            = require('express');
const router             = express.Router();
const Recipe             = require('../models/recipe');
const Book               = require('../models/book');
const fileUpload         = require('../middleware/file-upload');
const verifyUserIsAdmin  = require('../middleware/auth');
const filesystem         = require('fs')
const { verifyUser }     = require('../authenticate');

const deleteFileImage = (req) =>{
    if(req.file){
        filesystem.unlink(req.file.path);
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
                        newRecipe.recipeIngredients = JSON.parse(req.body.recipeIngredients);
                        newRecipe.recipeDesc = req.body.recipeDesc;
                        newRecipe.recipeTitle = req.body.recipeTitle;
                        newRecipe.recipeSteps = JSON.parse(req.body.recipeSteps);
                        newRecipe.recipeTags = req.body.recipeTags;
                        newRecipe.recipeBook = recipeBook;
                        newRecipe.recipeImage = req.file.path;
                        newRecipe.recipeRating = 0;
                        newRecipe.save();
                        console.log('Successful Recipe Save');
                        
                        recipeBook.recipes.push(newRecipe._id);
                        recipeBook.save();
                        console.log('Successfully added recipe ID to book');
                        res.send({ success: true, id: newRecipe._id });
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
    Recipe.findById(req.params.id).exec((err, recipe) =>{
        if(err){
            res.status(500);
            return;
        } else {
            res.send(recipe);
        }
    })
})

router.get('/deleteAllRecipes', verifyUserIsAdmin, (req, res, next) => {
    verifyUserIsAdmin
    Recipe.deleteMany({}, (err, success) => {
        if(err){
            res.send(err)
        }else {
            res.send({success: 'All deleted'})
        }
    });
})

module.exports = router;