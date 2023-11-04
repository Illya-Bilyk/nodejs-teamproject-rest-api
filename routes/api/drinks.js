const express = require("express");
const router = express.Router();
const ctrl = require("../../controllers/drinks");
const {
  validateBody,
  isValidId,
  authenticate,
  upload,
} = require("../../middlewares");

const { schemasDrinks } = require("../../models/drinks");

router.get(
  "/mainpage",
  // authenticate,
  ctrl.getMainpageDrinks
);


router.get(
  "/popular",
  // authenticate,
  ctrl.getPopularDrinks
);


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
  validateBody(schemasDrinks.addDrinkSchema),
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
