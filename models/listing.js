// This file defines the Listing model for a property listing application.
const mongoose = require("mongoose");
const review = require("./review");
const Schema = mongoose.Schema;

// Define the schema for the Listing model
const listingSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  image: {
    url: String,
    filename: String,
  },
  price: {
    type: Number,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  country: {
    type: String,
    required: true,
  },
  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: "Review",
    },
  ],
  owner: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  Geometry: {
    type: {
      type: String,
      enum: ["Point"],
      required: false,
    },
    coordinates: {
      type: [Number],
      required: false,
    },
  },
});

listingSchema.post("findOneAndDelete", async function (listing) {
  // Middleware to delete reviews when a listing is deleted
  if (listing) {
    await review.deleteMany({ _id: { $in: listing.reviews } }); ///delete all reviews that are in the listing reviews array
  }
});

const Listing = mongoose.model("Listing", listingSchema); // Listing is the name of the model
module.exports = Listing;
