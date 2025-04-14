const Review = require("../models/review");
const Listing = require("../models/listing");

// This function is used to render the new review form
module.exports.createReview = async (req, res) => {
  let foundListing = await Listing.findById(req.params.id); // Fixed model reference
  let newReview = new Review(req.body.Review);
  newReview.author = req.user._id;
  foundListing.reviews.push(newReview);
  await newReview.save();
  await foundListing.save();
  req.flash("success", "Successfully added a new review!");
  res.redirect(`/listings/${foundListing._id}`);
};

module.exports.deleteReview = async (req, res) => {
  let { id, reviewId } = req.params;
  await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } }); // pull review from listing
  await Review.findByIdAndDelete(reviewId); // delete review from database
  req.flash("success", "Successfully deleted a review!");
  res.redirect(`/listings/${id}`);
};
