const mongoose = require('mongoose');
const Schema   = mongoose.Schema;

const Product = new Schema({
    shopifyId: String,
    reviews: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Review'
        }
    ],
    rating: {
        type: Number,
        required: "Please provide a rating (1-5 stars).",
        min: 0,
        max: 5,
        validate: {
            validator: Number.isInteger,
            message: "{VALUE} is not an integer value."
        }
    }
});

module.exports = mongoose.model('Product', Product);