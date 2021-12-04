const mongoose = require('mongoose');
const Schema   = mongoose.Schema;

const Recipe = new Schema({
    recipeIngredients: {
        type: [{
            type: String,
            default: ''
        }]
    },
    recipeSteps: {
        type: [{
            type: String,
            default: ''
        }]
    },
    recipeTitle: {
        type: String,
        default: ''
    },
    RecipeDesc: {
        type: String,
        default: ''
    },
    tags: {
        type: [{
            type: String,
            default: ''
        }]
    }
});

module.exports = mongoose.model('Recipe', Recipe);