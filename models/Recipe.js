const mongoose = require("mongoose");

const recipeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },

  // ✅ Ingredients
  ingredients: [
    {
      type: String
    }
  ],

  // ✅ Instructions
  instructions: [
    {
      type: String
    }
  ],

  // ✅ Price
  price: {
    type: Number,
    required: false,
    default: 0
  },

  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category"
  },

  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  imageUrl: {
    type: String
  }

}, { timestamps: true });

module.exports = mongoose.model("Recipe", recipeSchema);