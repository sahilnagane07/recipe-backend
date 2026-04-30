const express = require("express");
const router = express.Router();
const Category = require("../models/Category");


// ➕ CREATE CATEGORY
router.post("/category", async (req, res) => {
  try {
    const { name } = req.body;

    const category = new Category({ name });
    await category.save();

    res.status(201).json({
      message: "Category created ✅",
      category
    });

  } catch (error) {
    res.status(500).json({
      message: "Error creating category ❌",
      error: error.message
    });
  }
});


// ✅ GET ALL CATEGORIES
router.get("/category", async (req, res) => {
  try {
    const categories = await Category.find();

    res.status(200).json({
      count: categories.length,
      categories
    });

  } catch (error) {
    res.status(500).json({
      message: "Error fetching categories ❌",
      error: error.message
    });
  }
});


// ✅ GET SINGLE CATEGORY BY ID (optional but useful)
router.get("/category/:id", async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ message: "Category not found ❌" });
    }

    res.status(200).json(category);

  } catch (error) {
    res.status(500).json({
      message: "Error fetching category ❌",
      error: error.message
    });
  }
});

module.exports = router;