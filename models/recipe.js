const mongoose = require('mongoose');
const Schema   = mongoose.Schema;

const Recipe = new Schema({
    recipeIngredients: {
        type: Array,
        default: []
    },
    recipeSteps: {
        type: Array,
        default: []
    },
    recipeTitle: String,
    recipeDesc: String,
    recipeBook: String,
    recipeRating: { //Holds are ratings that we have received
        type: Number,
        default: 0
    },
    recipeTags:{ //Holds all of our tags, which will be in an array
        type: Array,
        default: []
    },
    recipeImage: String,
    likes: [ //Will hold all the likes that this recipe has
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "User"
		}
	],
    book: {
        type: mongoose.Schema.Types.ObjectId,
			ref: "Book"
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Recipe', Recipe);