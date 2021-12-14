const express   = require('express');
const router    = express.Router();
const Recipe      = require('../models/recipe');

const { verifyUser } = require('../authenticate');

//Add a recipe.
router.post('/add', verifyUser, ( req, res, next ) =>{
    res.send({received: true});
    if( (req.body.numberOfIngredients === null || req.body.numberofSteps === null || req.body.recipeTitle === null || req.body.recipeDesc === null ) || 
        (req.body.recipeIngredients.length === 0 || req.body.recipeSteps.length === 0 || req.body.modifiedTags.length === 0) ){
            res.statusCode = 500;
            return ({
                name: 'EmptyFieldError',
                message: "All Fields must be filled out"
            });
    }

    if(req.user.isAdmin){
        Recipe.create(req.body, (err, newRecipe) =>{
            if(err){
                res.status(500);
                return;
            }
            newRecipe.recipeIngredients = req.body.recipeIngredients;
            newRecipe.recipeDesc = req.body.recipeDesc;
            newRecipe.recipeTitle = req.body.recipeTitle;
            newRecipe.recipeSteps = req.body.recipeSteps;
            newRecipe.tags = req.body.modifiedTags;
            newRecipe.recipeBook = req.body.bookSelection;
            newRecipe.save();
            console.log('Successful Recipe Save');
            return ({ success: true });
        })
    } 
    return ({ success: false });

})

router.get('/showAllRecipes', (req, res, next) => {
    Recipe.find({}).exec((err, allRecipes) =>{
        if(err){
            res.status(500);
            return;
        } else {
            res.send({recipes: allRecipes});
        }
    })
})

module.exports = router;