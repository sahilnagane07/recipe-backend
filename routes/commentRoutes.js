const express = require("express");
const router = express.Router();
const Comment = require("../models/Comments");


// ➕ ADD COMMENT
router.post("/comments", async (req, res) => {
  try {
    const { recipe, user, content } = req.body;

    const comment = new Comment({
      recipe,
      user,
      content
    });

    await comment.save();

    res.status(201).json({
      message: "Comment added ✅",
      comment
    });

  } catch (error) {
    res.status(500).json({
      message: "Error adding comment ❌",
      error: error.message
    });
  }
});


// 🔍 GET COMMENTS BY RECIPE
router.get("/comments/:recipeId", async (req, res) => {
  try {
    const { recipeId } = req.params;

    const comments = await Comment.find({ recipe: recipeId })
      .populate("user", "name email");

    res.json({
      count: comments.length,
      comments
    });

  } catch (error) {
    res.status(500).json({
      message: "Error fetching comments ❌",
      error: error.message
    });
  }
});

module.exports = router;