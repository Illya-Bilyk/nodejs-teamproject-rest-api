const { ctrlWrapper } = require("../utils");
const { Recipe } = require("../models/recipe");
const { Ingredient } = require("../models/ingredient");

const getCategories = async (req, res) => {
  const result = await Recipe.distinct("category").sort();
  res.json(result);
};

const getIngredients = async (req, res) => {
  const result = await Ingredient.find(
    {},
    {
      _id: 1,
      title: 1,
      alcohol: 1,
      ingredientThumb: 1,
      "thumb-medium": 1,
      "thumb-small": 1,
    }
  );
  res.json(result);
};

const getGlasses = async (req, res) => {
  const result = await Recipe.distinct("glass").sort();
  res.json(result);
};

module.exports = {
  getCategories: ctrlWrapper(getCategories),
  getIngredients: ctrlWrapper(getIngredients),
  getGlasses: ctrlWrapper(getGlasses),
};
