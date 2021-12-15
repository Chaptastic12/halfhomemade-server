const express   = require('express');
const router    = express.Router();
const Recipe    = require('../models/recipe');
const Book      = require('../models/book');

const { verifyUser } = require('../authenticate');

//Add a recipe.
router.post('/add', verifyUser, ( req, res, next ) =>{
    console.log(req.body)
    if( (req.body.numberOfIngredients === null || req.body.numberofSteps === null || req.body.recipeTitle === null || req.body.recipeDesc === null ) || 
        (req.body.recipeIngredients.length === 0 || req.body.recipeSteps.length === 0 || req.body.recipeTags.length === 0) ){
            res.statusCode = 500;
            return ({
                name: 'EmptyFieldError',
                message: "All Fields must be filled out"
            });
    }

    if(req.user.isAdmin){
        //Find the book that this recipe is being added to
        Book.findOne({_id: req.body.bookSelection}, (err, recipeBook) => {
            if(err){
                res.status(500);
                res.send({ error: 'Could not find recipe book' });
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
                        newRecipe.recipeSteps = req.body.recipeSteps;
                        newRecipe.recipeTags = req.body.recipeTags;
                        newRecipe.recipeBook = recipeBook;
                        newRecipe.recipeRating = req.body.recipeRating;
                        newRecipe.save();
                        console.log('Successful Recipe Save');
                        
                        recipeBook.recipes.push(newRecipe._id);
                        recipeBook.save();
                        console.log('Successfully added recipe ID to book');
                        res.send({ success: true });
                        return;
                    }
                });
            }
        })
    } else {
        res.send({ success: false });
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

module.exports = router;