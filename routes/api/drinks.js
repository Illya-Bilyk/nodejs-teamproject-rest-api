const express = require("express");
const router = express.Router();
const ctrl = require("../../controllers/drinks");
const ctrl2 = require("../../controllers/mainPopularDrinks");
const {
  validateBody,
  isValidId,
  authenticate,
  upload,
} = require("../../middlewares");

const { schemasRecipe } = require("../../models/recipe");

router.get("/mainpage", authenticate, ctrl2.getMainpageDrinks);

router.get("/popular", authenticate, ctrl2.getPopularDrinks);

router.get("/search", authenticate, ctrl.searchDrinks);

router.post(
  "/own/add/img",
  authenticate,
  upload.single("cocktail"),
  ctrl.addDrinkImg
);

router.post(
  "/own/add",
  authenticate,
  validateBody(schemasRecipe.addRecipesSchema),
  ctrl.addDrink
);

router.delete(
  "/own/remove/:drinkId",
  authenticate,
  isValidId,
  ctrl.deleteDrink
);

router.get("/own", authenticate, ctrl.getDrink);

router.post(
  "/favorite/add/:drinkId",
  authenticate,
  isValidId,
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
