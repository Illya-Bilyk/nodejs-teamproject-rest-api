const express = require("express");
const {
  getCategories,
  getIngredients,
  getGlasses,
} = require("../../controllers/filters");

const { authenticate } = require("../../middlewares");

const router = express.Router();

// Routes
router.get("/categories", authenticate, getCategories);
router.get("/ingredients", authenticate, getIngredients);
router.get("/glasses", authenticate, getGlasses);

module.exports = router;
