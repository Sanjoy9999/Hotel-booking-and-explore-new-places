const Listing = require('./models/listing');
const Review = require('./models/review');  // Import Review model
const expressError = require('./utils/expressError');
const { listingSchema, reviewSchema } = require('./schema.js');

// Middleware to check if the user is logged in
module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.redirectUrl = req.originalUrl;  // Save URL to redirect later
        req.flash('error', 'You must be logged in first!');
        return res.redirect('/login');
    }
    next();
}

// Middleware to save redirect URL to res.locals
module.exports.saveRedirectUrl = async (req, res, next) => {
    if (req.session.redirectUrl) {
        res.locals.redirectUrl = req.session.redirectUrl;
    }
    next();
}

// Middleware to check if the current user owns the listing
module.exports.isOwner = async (req, res, next) => {
    const { id } = req.params;  // Get listing ID from URL
    const foundListing = await Listing.findById(id);  // Query the listing by ID

    if (!foundListing) {
        req.flash('error', 'Listing not found!');
        return res.redirect('/listings');
    }

    // Check if the logged-in user is the owner
    if (!foundListing.owner.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to do that!');
        return res.redirect(`/listings/${id}`);
    }

    next();
}

// Middleware to validate the listing schema using Joi
module.exports.validateListing = (req, res, next) => {
    const { error } = listingSchema.validate(req.body);
    if (error) {
        const errorMessages = error.details.map(el => el.message).join(',');
        throw new expressError(errorMessages, 400);
    } else {
        next();
    }
};

// Middleware to validate the review schema using  Joi
// This middleware is used to validate the review data before saving it to the database
module.exports.validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const errorMessages = error.details.map(el => el.message).join(',');
        console.log(error);
        throw new expressError(errorMessages, 400);
    } else {
        next();
    }
};

// Middleware to check if the current user is the author of the review
module.exports.isReviewAuthor = async (req, res, next) => {
    const { reviewId } = req.params;  // Get review ID from URL
    const review = await Review.findById(reviewId);  // Query the review by ID

    if (!review) {
        req.flash('error', 'Review not found!');
        return res.redirect('/listings');
    }

    // Check if the logged-in user is the author of the review 
    if (!review.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to do that!');
        return res.redirect(`/listings/${req.params.id}`);
    }

    next();
}
