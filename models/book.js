const mongoose = require('mongoose');
const Schema   = mongoose.Schema;

const Book = new Schema({
    bookTitle: String,
    // recipes: {
    //     type: Array,
    //     default: []
    // },
    recipes: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Recipe'
        }
    ],
    createdAt: {
        type: Date,
        default: Date.now
    },
    id: String,
    bookImage: String
});

module.exports = mongoose.model('Book', Book);