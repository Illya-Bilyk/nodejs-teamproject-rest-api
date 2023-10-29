const express = require("express");
const {
  getCategories,
  getIngredients,
  getGlasses,
} = require("../../controllers/filters");

const router = express.Router();

// Роути
router.get("/categories", getCategories);
router.get("/ingredients", getIngredients);
router.get("/glasses", getGlasses);

module.exports = router;
