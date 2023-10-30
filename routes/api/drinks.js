const express = require("express");
const router = express.Router();
const ctrl = require("../../controllers/drinks");
const { validateBody, isValidId, authenticate } = require("../../middlewares");

const { schemasRecipe } = require("../../models/recipe");

// router.get("/mainpage", authenticate, ctrl.getMainpageDrinks);

// router.get("/popular", authenticate, ctrl.getPopularDrinks);

router.get("/search", authenticate, ctrl.searchDrinks);
// router.get("/search", ctrl.searchDrinks);

router.post(
  "/own/add",
  authenticate,
  isValidId,
  validateBody(schemasRecipe.addSchema),
  ctrl.addDrink
);

router.delete(
  "/own/remove/:drinkId",
  authenticate,
  isValidId,
  ctrl.deleteDrink
);

router.get(
  "/own",
  authenticate,
  isValidId,
  validateBody(schemasRecipe.addSchema),
  ctrl.getDrink
);

router.post(
  "/favorite/add",
  authenticate,
  validateBody(schemasRecipe.addSchema),
  ctrl.addFavoriteDrink
);

router.delete(
  "/favorite/remove/:drinkId",
  authenticate,
  isValidId,
  ctrl.deleteFavoriteDrink
);

router.get("/favorite", authenticate, ctrl.getFavoriteDrink);

router.get("/:drinkId", authenticate, isValidId, ctrl.getDrinkById);

module.exports = router;
