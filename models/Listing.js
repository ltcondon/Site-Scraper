var mongoose = require("mongoose");

// Save a reference to the Schema constructor
var Schema = mongoose.Schema;

// Using the Schema constructor, create a new UserSchema object
// This is similar to a Sequelize model
var ListingSchema = new Schema({
  // `title` is required and of type String
  image: {
      type: String,
      required: true
  },
  title: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  price: {
      type: Number,
      required: true,
  },
  bedrooms: {
      type: Number,
      required: true
  },
  // `link` is required and of type String
  link: {
    type: String,
    required: true
  },
  // `note` is an object that stores a Note id
  // The ref property links the ObjectId to the Note model
  // This allows us to populate the Listing with an associated Note
  note: {
    type: Schema.Types.ObjectId,
    ref: "Note"
  }
});

// This creates our model from the above schema, using mongoose's model method
var Listing = mongoose.model("Listing", ListingSchema);

// Export the Listing model
module.exports = Listing;