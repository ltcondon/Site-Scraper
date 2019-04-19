var mongoose = require("mongoose");

// Save a reference to the Schema constructor
var Schema = mongoose.Schema;

// Using the Schema constructor, create a new UserSchema object
// This is similar to a Sequelize model
var ListingSchema = new Schema({
  // `title` is required and of type String
  image: {
      type: String,
      required: false
  },
  title: {
    type: String,
    required: false
  },
  location: {
    type: String,
    required: false
  },
  price: {
      type: String,
      required: false
  },
  bedrooms: {
      type: String,
      required: false,
      default: "None listed."
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