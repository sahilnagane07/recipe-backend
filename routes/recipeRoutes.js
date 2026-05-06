const express = require("express");
const router = express.Router();

const Recipe = require("../models/Recipe");

const multer = require("multer");
const path = require("path");
const fs = require("fs");

// ======================================================
// ✅ Ensure uploads folder exists
// ======================================================
const uploadPath = "uploads/";
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath);
}

// ======================================================
// 📁 Multer config
// ======================================================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// ======================================================
// ✅ GET ALL RECIPES
// ======================================================
router.get("/recipes", async (req, res) => {
  try {
    const recipes = await Recipe.find()
      .populate("category", "name")
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.json({
      count: recipes.length,
      recipes
    });

  } catch (error) {
    res.status(500).json({
      message: "Error fetching recipes ❌",
      error: error.message
    });
  }
});

// ======================================================
// 🔍 GET RECIPES BY USER
// ======================================================
router.get("/recipes/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const recipes = await Recipe.find({ user: userId })
      .populate("category", "name")
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.json({
      count: recipes.length,
      recipes
    });

  } catch (error) {
    res.status(500).json({
      message: "Error fetching user recipes ❌",
      error: error.message
    });
  }
});

// ======================================================
// ➕ CREATE RECIPE
// ======================================================
router.post("/recipes", upload.single("image"), async (req, res) => {
  try {
    const { title, ingredients, instructions, category, user } = req.body;

    // ✅ Basic validation
    if (!title || !ingredients || !instructions || !category || !user) {
      return res.status(400).json({
        message: "All fields are required ❌"
      });
    }

    // ======================================================
    // ✅ INGREDIENTS PARSING (textarea friendly)
    // ======================================================
    let parsedIngredients = [];

    if (Array.isArray(ingredients)) {
      parsedIngredients = ingredients;
    } else if (typeof ingredients === "string") {
      try {
        parsedIngredients = JSON.parse(ingredients);
      } catch {
        parsedIngredients = ingredients
          .replace(/\r/g, "")
          .split(/\n|,/) // newline OR comma
          .map(i => i.trim())
          .filter(i => i.length > 0);
      }
    }

    // ======================================================
    // ✅ INSTRUCTIONS PARSING (textarea friendly)
    // ======================================================
    let steps = [];

    if (Array.isArray(instructions)) {
      steps = instructions;
    } else if (typeof instructions === "string") {
      steps = instructions
        .replace(/\r/g, "")
        .split(/\n|\d+\.\s*/) // supports "1. step"
        .map(step => step.trim())
        .filter(step => step.length > 0);
    }

    // ======================================================
    // ✅ EXTRA VALIDATION
    // ======================================================
    if (parsedIngredients.length === 0 || steps.length === 0) {
      return res.status(400).json({
        message: "Ingredients & Instructions cannot be empty ❌"
      });
    }

    // ======================================================
    // 🔍 DEBUG (optional)
    // ======================================================
    console.log("📦 FINAL DATA:", {
      title,
      parsedIngredients,
      steps,
      category,
      user
    });

    // ======================================================
    // ✅ CREATE RECIPE
    // ======================================================
    const recipe = new Recipe({
      title,
      ingredients: parsedIngredients,
      instructions: steps,
      category,
      user,
      imageUrl: req.file ? `/uploads/${req.file.filename}` : ""
    });

    await recipe.save();

    res.status(201).json({
      message: "Recipe created successfully ✅",
      recipe
    });

  } catch (error) {
    console.error("❌ Create Recipe Error:", error);

    res.status(500).json({
      message: "Error creating recipe ❌",
      error: error.message
    });
  }
});

// ======================================================
module.exports = router;