const express = require("express");
const router = express.Router({mergeParams: true});
const wrapAsync = require('../utils/wrapAsync.js');
const ExpressError= require('../utils/ExpressError.js');
const {  reviewsSchema } = require('../schema.js');
const Listing = require('../models/listing.js');
const Review = require('../models/review.js');
const {validateReview , isLoggedIn, isreviewAuthor} = require("../middleware.js")
const reviewController = require('../controllers/reviews.js');



// Reviews: post route

router.post('/',isLoggedIn, validateReview,wrapAsync(reviewController.createReview));

// reviews : delete route

router.delete("/:reviewId", isLoggedIn,isreviewAuthor,
    wrapAsync(reviewController.destroyReview)
);

module.exports = router;