const express = require("express");
const router = express.Router();
const Recipe = require("../models/Recipe");

const multer = require("multer");
const path = require("path");
const fs = require("fs");

// ✅ Ensure uploads folder exists
const uploadPath = "uploads/";
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath);
}

// 📁 Multer storage config
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
// ✅ GET ALL RECIPES (NEW API)
// ======================================================
router.get("/recipes", async (req, res) => {
  try {
    const recipes = await Recipe.find()
      .populate("category", "name")
      .populate("user", "name email")
      .sort({ createdAt: -1 }); // latest first

    res.json({
      count: recipes.length,
      recipes
    });

  } catch (error) {
    res.status(500).json({
      message: "Error fetching all recipes ❌",
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
// ➕ CREATE RECIPE WITH IMAGE UPLOAD
// ======================================================
router.post("/recipes", upload.single("image"), async (req, res) => {
  try {
    const { title, ingredients, instructions, category, user } = req.body;

    // ✅ Validation
    if (!title || !ingredients || !instructions || !category || !user) {
      return res.status(400).json({
        message: "All fields are required ❌"
      });
    }

    // ✅ Convert ingredients safely
    let parsedIngredients = [];
    try {
      parsedIngredients = JSON.parse(ingredients);
    } catch {
      parsedIngredients = ingredients.split(",").map(i => i.trim());
    }

    // ✅ Convert instructions → ARRAY
    const steps = instructions
      .split(/\r?\n|\d+\)/)
      .map(step => step.trim())
      .filter(step => step !== "");

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
      message: "Recipe created ✅",
      recipe
    });

  } catch (error) {
    res.status(500).json({
      message: "Error creating recipe ❌",
      error: error.message
    });
  }
});

module.exports = router;