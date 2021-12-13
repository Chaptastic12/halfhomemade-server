const mongoose = require('mongoose');
const Schema   = mongoose.Schema;

const Recipe = new Schema({
    RecipeIngredients: {
        type: Array,
        default: []
    },
    recipeSteps: {
        type: Array,
        default: []
    },
    recipeTitle: String,
    recipeDesc: String,
    tags:{
        type: Array,
        default: []
    },
});

module.exports = mongoose.model('Recipe', Recipe);