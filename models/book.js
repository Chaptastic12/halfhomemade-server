const mongoose = require('mongoose');
const Schema   = mongoose.Schema;

const Book = new Schema({
    bookTitle: String,
    recipes: {
        type: Array,
        default: []
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Book', Book);