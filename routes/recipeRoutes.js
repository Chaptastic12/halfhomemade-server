const express   = require('express');
const router    = express.Router();
const Route      = require('../models/recipe');


router.post('/add', ( req, res, next ) =>{
    console.log(req.body);
    res.send({received: true});
    if( (req.body.numberOfIngredients === null || req.body.numberofSteps === null || req.body.recipeTitle === null || req.body.recipeDesc === null ) || 
        (req.body.recipeIngredients.length === 0 || req.body.recipeSteps.length === 0 || req.body.tags.length === 0) ){
            res.statusCode = 500;
            res.send({
                name: 'EmptyFieldError',
                message: "All Fields must be filled out"
            });
    }
})

module.exports = router;