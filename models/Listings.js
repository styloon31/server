const mongoose = require("mongoose");

const listingSchema = new mongoose.Schema({
  title: String,
  description: String,
  location: String,
  price: {
    type: Number,   // ✅ This must be Number
    required: true,
  },
  images: [String],
  host: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
}, { timestamps: true });

module.exports = mongoose.model("Listing", listingSchema);
