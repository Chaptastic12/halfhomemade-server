//Require mongoose
const mongoose = require("mongoose");

//Create our schema for the reviews
let reviewSchema = new mongoose.Schema({
    rating: {
        // Setting the field type
        type: Number,
        // Making the star rating required
        required: "Please provide a rating (1-5 stars).",
        // Defining min and max values
        min: 0,
        max: 5,
        // Adding validation to see if the entry is an integer
        validate: {
            // validator accepts a function definition which it uses for validation
            validator: Number.isInteger,
            message: "{VALUE} is not an integer value."
        }
    },
    // review text
    text: {
        type: String
    },
    // author id and username fields
    author: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username: String
    },
    // recipe associated with the review
    recipe: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Recipe"
    },
    // Shopify product associated with the review
    shopifyProduct: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    }
}, {
    // if timestamps are set to true, mongoose assigns createdAt and updatedAt fields to test schema, the type assigned is Date.
    timestamps: true
});

module.exports = mongoose.model("Review", reviewSchema);