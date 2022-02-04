const express   = require('express');
const router    = express.Router();
const Product      = require('../models/product');
const Review = require('../models/review');
const verifyUserIsAdmin  = require('../middleware/auth');
const { verifyUser }     = require('../authenticate');

//Add a shopfy ID; Used for admins
router.post('/submitANewProduct/', verifyUser, verifyUserIsAdmin, (req, res, next) =>{
    Product.create(req.body, (err, newProduct) =>{
        if(err){
            res.status(500);
            res.send({err})
        } else {
            newProduct.shopifyId = req.body.shopifyId;
            newProduct.save();
            res.send({Success: 'Successfully added id'})
        }
    });
});

const calculateReviewAverage = reviews => {
    if(reviews.length === 0){
        return 0;
    }
    let sum =0;
    reviews.forEach((review) => {
        sum+= review.rating;
    });
    if(sum >= 0){
        return sum / reviews.length;
    }else{
        return 0;
    }
}

//Submit a review for our shopify product, Id we get is the shopify ID
router.post('/submitProductReview/:id', verifyUser, (req, res, next) =>{
    Product.findOne({shopifyId: req.params.id}).populate('reviews').exec((err, foundProduct)=> {
        if(err){
            res.status(500);
            res.send({error: 'Error submitting review', err})
        } else{
            Review.create(req.body, (err, newReview)=>{
                if(err){
                    res.send({error: 'Error creating review', err})
                } else {
                    newReview.author.id = req.user._id
                    newReview.author.username = req.user.username;
                    newReview.shopifyProduct = foundProduct._id;
                    newReview.save();

                    foundProduct.reviews.push(newReview);
                    foundProduct.recipeRating = calculateReviewAverage(foundProduct.reviews);
                    foundProduct.save();
                    res.send({succes: 'Successfully submitted review'});
                }
            })
        }
    })
});

//Get reviews for a product; Id needed is shopify ID
router.get('/getReviewsForProduct/:id', (req, res, next)=>{
    Product.findOne({'shopifyId': req.params.id}).populate('reviews').exec((err, foundProduct) =>{
        if(err){
            res.status(500);
            res.send({error: 'Error getting product and reviews'}, err);
        } else {
            res.send(foundProduct);
        }
    })
});

//Get reviews for all products
router.get('/getAllReviewsForProducts', (req, res, next) =>{
    Product.find({}).populate('reviews').exec((err, foundProducts)=>{
        if(err){
            res.status(500);
            res.send({error: 'Error getting products and reviews'}, err);
        } else {
            res.send(foundProducts);
        }
    })
})

router.delete('/deleteAProductReview/:id/:reviewId', verifyUser, (req, res, next) => {
    Review.findById(req.params.reviewId, (err, foundReview) => {
        if(err){
            res.send({error: 'Error finding review'}, err);
        } else {
            if(foundReview.author.id.toString() === req.user.id || req.user.isAdmin === true){
                Product.findByIdAndUpdate(req.params.id, {$pull: { reviews: req.params.reviewId}}, {safe: true, upsert: true }, (err, foundProduct) =>{
                    if(err){
                        res.send({error: 'Error finding product with review', err});
                    } else {
                        foundProduct.recipeRating = calculateReviewAverage(foundProduct.reviews);
                        foundProduct.save();
                        res.send({success: 'Review deleted successfully'});
                    }
                });
                foundReview.remove();
            } 
        }
    });
});

router.post('/editAProductReview/:id/:reviewId', verifyUser, (req, res, next) => {
    Review.findById(req.params.reviewId, (err, foundReview) => {
        if(err){
            res.send({error: 'Error finding review', err});
        } else {
            if(foundReview.author._id === req.user._id || req.user.isAdmin === true){
                foundReview.rating = req.body.rating;
                foundReview.text = req.body.text;
                foundReview.save();
                Product.findOne({shopifyId: req.params.id }).populate('reviews').exec((err, foundProduct) => {
                    if(err){
                        res.send({error: 'Error finding Product', err});
                    }else{
                        console.log(foundProduct.reviews)
                        foundProduct.rating = calculateReviewAverage(foundProduct.reviews);
                        foundProduct.save();
                        res.send({ success: 'Review has been updated' });
                    }
                })
            }else{
                res.send({error: 'You do not own the rights to this review to delete it'})
            }
        }
    })
})

module.exports = router;