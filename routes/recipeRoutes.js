const express   = require('express');
const router    = express.Router();
const Recipe      = require('../models/recipe');


router.post('/add', ( req, res, next ) =>{
    console.log(req.body);
    res.send({received: true});
    if( (req.body.numberOfIngredients === null || req.body.numberofSteps === null || req.body.recipeTitle === null || req.body.recipeDesc === null ) || 
        (req.body.recipeIngredients.length === 0 || req.body.recipeSteps.length === 0 || req.body.modifiedTags.length === 0) ){
            res.statusCode = 500;
            res.send({
                name: 'EmptyFieldError',
                message: "All Fields must be filled out"
            });
            return;
    }

    Recipe.create(req.body, (err, newRecipe) =>{
        if(err){
            res.status(500);
            console.log(err);
            return;
        }
        newRecipe.recipeIngredients = [{id: 1, value: 'test'}];
        newRecipe.recipeDesc = req.body.recipeDesc;
        newRecipe.recipeTitle = req.body.recipeTitle;
        newRecipe.recipeSteps = req.body.recipeSteps;
        newRecipe.tags = req.body.modifiedTags;
        newRecipe.save();
        console.log('Successful Recipe Save');
    })
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