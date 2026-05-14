const express = require("express");
const router = express.Router();

const Recipe = require("../models/Recipe");
const Category = require("../models/Category");

// ✅ Cloudinary + Multer
const multer = require("multer");
const cloudinary = require("../config/cloudinary");
const { CloudinaryStorage } = require("multer-storage-cloudinary");

// ======================================================
// ☁️ Cloudinary Storage Config
// ======================================================
const storage = new CloudinaryStorage({
  cloudinary,

  params: async (req, file) => ({
    folder: "recipes",
    resource_type: "image",

    // auto detect extension
    format: file.mimetype.split("/")[1],

    public_id: Date.now() + "-" + file.originalname.split(".")[0]
  })
});

const upload = multer({
  storage,

  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
});

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
// ✅ GET RECIPES BY CATEGORY NAME
// Example:
// /api/recipes/category/Chinese
// ======================================================
router.get("/recipes/category/:categoryName", async (req, res) => {
  try {
    const { categoryName } = req.params;

    // ✅ Find category first
    const category = await Category.findOne({
      name: { $regex: new RegExp(categoryName, "i") }
    });

    if (!category) {
      return res.status(404).json({
        message: "Category not found ❌"
      });
    }

    // ✅ Get recipes of category
    const recipes = await Recipe.find({
      category: category._id
    })
      .populate("category", "name")
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.json({
      category: category.name,
      count: recipes.length,
      recipes
    });

  } catch (error) {
    res.status(500).json({
      message: "Error fetching category recipes ❌",
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
    const {
      title,
      ingredients,
      instructions,
      category,
      user,
      price
    } = req.body;

    // ✅ Validation
    if (!title || !ingredients || !instructions || !category || !user) {
      return res.status(400).json({
        message: "All fields are required ❌"
      });
    }

    // ======================================================
    // ✅ INGREDIENTS PARSING
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
          .split(/\n|,/)
          .map(i => i.trim())
          .filter(i => i.length > 0);
      }
    }

    // ======================================================
    // ✅ INSTRUCTIONS PARSING
    // ======================================================
    let steps = [];

    if (Array.isArray(instructions)) {
      steps = instructions;
    } else if (typeof instructions === "string") {
      steps = instructions
        .replace(/\r/g, "")
        .split(/\n|\d+\.\s*/)
        .map(step => step.trim())
        .filter(step => step.length > 0);
    }

    // ======================================================
    // ✅ CREATE RECIPE
    // ======================================================
    const recipe = new Recipe({
      title,
      ingredients: parsedIngredients,
      instructions: steps,

      // ✅ PRICE
      price: price || 0,

      category,
      user,

      // ☁️ Cloudinary Image URL
      imageUrl: req.file ? req.file.path : ""
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