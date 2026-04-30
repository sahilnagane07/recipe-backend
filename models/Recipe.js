const mongoose = require("mongoose");

const recipeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  ingredients: [
    {
      type: String
    }
  ],
  instructions: {
    type: String,
    required: true
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