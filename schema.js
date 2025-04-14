const Joi = require('joi');
module.exports.listingSchema = Joi.object({
   listing : Joi.object({
    title : Joi.string().required(),
    description : Joi.string().required(),
    image : Joi.string().allow('' , null),
    price : Joi.number().required().min(0),
    location : Joi.string().required(),
    country : Joi.string().required()
   }).required()
});

// The schema for the review
module.exports.reviewSchema = Joi.object({
   Review: Joi.object({
       rating: Joi.number().required().min(1).max(5), // Ensure rating is a number between 1 and 5
       comment: Joi.string().required()              // Expect comment instead of body
   }).required()
});
