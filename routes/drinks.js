const express = require("express");
const router = express.Router();
const { drinks: ctrl } = require("../controllers");
const { validateBody, isValidId, authenticate } = require("../middlewares");

const { schemasRecipe } = require("../models/recipe");

// router.get("/mainpage", authenticate, ctrl.getMainpageDrinks);

// router.get("/popular", authenticate, ctrl.getPopularDrinks);

// router.get("/search", authenticate, ctrl.searchDrinks);
router.get("/search", ctrl.searchDrinks);

router.post(
  "/:id/own/add",
  authenticate,
  isValidId,
  validateBody(schemasRecipe.addSchema),
  ctrl.addDrink
);

router.delete("/:id/own/remove", authenticate, isValidId, ctrl.deleteDrink);

router.get(
  "/:id/own",
  authenticate,
  isValidId,
  validateBody(schemasRecipe.addSchema),
  ctrl.getDrink
);

router.post(
  "/:id/favorite/add",
  authenticate,
  validateBody(schemasRecipe.addSchema),
  ctrl.addFavoriteDrink
);

router.delete(
  "/:id/favorite/remove",
  authenticate,
  isValidId,
  ctrl.deleteFavoriteDrink
);

router.get("/:id/favorite", ctrl.getFavoriteDrink);

// router.get("/:drinkId", authenticate, isValidId, ctrl.getDrinkById);
router.get("/:drinkId", isValidId, ctrl.getDrinkById);

module.exports = router;
