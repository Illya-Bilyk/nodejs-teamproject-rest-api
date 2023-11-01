const dobToAge = require("dob-to-age");
const { Recipe } = require("../models/recipe");
const { ctrlWrapper, HttpError } = require("../utils");

const getMainpageDrinks = async (req, res) => {
  // const { birthday } = req.user;

  // if (!birthday) {
  //   throw HttpError(404, "Users not found (invalid query)");
  // }

  // const birthdayReversed = birthday.split("/").reverse().join("/");
  // const age = dobToAge(birthdayReversed);

  const age = 35; // Temporarily set the age to 18+
  const alcohol = age > 18;

  // Request for all drinks
  const resultAll = await Recipe.aggregate([
    {
      $match: {
        category: {
          $in: ["Shake", "Other/Unknown", "Cocktail", "Ordinary Drink"],
        },
      },
    },
    { $group: { _id: "$category", drinks: { $push: "$$ROOT" } } },
    {
      $project: {
        _id: 0,
        category: "$_id",
        drinks: {
          $slice: ["$drinks", 3],
        },
      },
    },
    {
      $project: {
        category: 1,
        drinks: {
          $map: {
            input: "$drinks",
            as: "drink",
            in: {
              _id: "$$drink._id",
              drink: "$$drink.drink",
              category: "$$drink.category",
              alcoholic: "$$drink.alcoholic",
              drinkThumb: "$$drink.drinkThumb",
            },
          },
        },
      },
    },
    { $sort: { category: 1 } },
  ]);

  // Request only for non-alcoholic drinks

  const resultNonAlko = await Recipe.aggregate([
    {
      $match: {
        category: {
          $in: ["Shake", "Other/Unknown", "Cocktail", "Ordinary Drink"],
        },
      },
    },
    { $group: { _id: "$category", drinks: { $push: "$$ROOT" } } },
    {
      $project: {
        _id: 0,
        category: "$_id",
        drinks: {
          $filter: {
            input: "$drinks",
            as: "drink",
            cond: { $eq: ["$$drink.alcoholic", "Non alcoholic"] },
          },
        },
      },
    },
    {
      $project: {
        category: 1,
        drinks: {
          $slice: ["$drinks", 3],
        },
      },
    },
    {
      $project: {
        category: 1,
        drinks: {
          $map: {
            input: "$drinks",
            as: "drink",
            in: {
              _id: "$$drink._id",
              drink: "$$drink.drink",
              category: "$$drink.category",
              alcoholic: "$$drink.alcoholic",
              drinkThumb: "$$drink.drinkThumb",
            },
          },
        },
      },
    },
    { $match: { "drinks.0": { $exists: true } } },
    { $sort: { category: 1 } },
  ]);

  const result = alcohol ? resultAll : resultNonAlko;
  res.status(200).json(result);
};

const getPopularDrinks = async (req, res) => {
  // const { birthday } = req.user;

  // if (!birthday) {
  //   throw HttpError(404, "Users not found (invalid query)");
  // }

  // const birthdayReversed = birthday.split("/").reverse().join("/");
  // const age = dobToAge(birthdayReversed);

  const age = 27; // Temporarily set the age to 18+
  const alcohol = age > 18 ? ["Alcoholic", "Non alcoholic"] : ["Non alcoholic"];

  const result = await Recipe.find(
    { alcoholic: alcohol },
    {
      _id: 1,
      drink: 1,
      category: 1,
      alcoholic: 1,
      glass: 1,
      drinkThumb: 1,
    }
  ).limit(50);

  res.status(200).json(result);
};

const searchDrinks = async (req, res) => {
  const {
    page = 1,
    limit = 9,
    keyword = "",
    category = "",
    ingredient = "",
  } = req.query;

  const { birthday } = req.user;

  if (!birthday) {
    throw HttpError(404, "Users not found (invalid query)");
  }

  const birthdayReversed = birthday.split("/").reverse().join("/");
  const age = dobToAge(birthdayReversed);
  const alcohol = age > 18 ? ["Alcoholic", "Non alcoholic"] : ["Non alcoholic"];

  const skip = (page - 1) * limit;

  let findCategory = [""];
  if (category) {
    findCategory = [category];
  } else {
    const categoryList = await Recipe.distinct("category");
    findCategory = categoryList;
  }

  let findIngredient = "";
  if (ingredient) {
    findIngredient = ingredient;
  } else {
    const ingredientsList = await Recipe.distinct("ingredients.title");
    findIngredient = ingredientsList;
  }

  const responseSizeArray = await Recipe.find({
    category: findCategory,
    "ingredients.title": findIngredient,
    drink: { $regex: `${keyword}`, $options: "i" },
    alcoholic: alcohol,
  });

  if (!responseSizeArray) {
    throw HttpError(404, "Search query not found (invalid query)");
  }

  const size = Object.keys(responseSizeArray).length;

  const response = await Recipe.find(
    {
      category: findCategory,
      "ingredients.title": findIngredient,
      drink: { $regex: `${keyword}`, $options: "i" },
      alcoholic: alcohol,
    },
    "-createdAt -updatedAt",
    {
      skip,
      limit,
    }
  );

  if (!response) {
    throw HttpError(404, "Search query not found (invalid query)");
  }

  res.status(200).json({
    page: page,
    per_page: limit,
    max_page: size,
    drinks: response,
  });
};

const addDrink = async (req, res) => {
  res.status(200).json({});
};

const deleteDrink = async (req, res) => {
  res.status(200).json({});
};

const getDrink = async (req, res) => {
  res.status(200).json({});
};

const addFavoriteDrink = async (req, res) => {
  res.status(200).json({});
};

const deleteFavoriteDrink = async (req, res) => {
  res.status(200).json({});
};

const getFavoriteDrink = async (req, res) => {
  res.status(200).json({});
};

const getDrinkById = async (req, res) => {
  const { drinkId } = req.params;

  const response = await Recipe.findById(drinkId);

  if (!response) {
    throw HttpError(404, "Drink not found");
  }

  res.status(200).json(response);
};

module.exports = {
  getMainpageDrinks: ctrlWrapper(getMainpageDrinks),
  getPopularDrinks: ctrlWrapper(getPopularDrinks),
  searchDrinks: ctrlWrapper(searchDrinks),
  addDrink: ctrlWrapper(addDrink),
  deleteDrink: ctrlWrapper(deleteDrink),
  getDrink: ctrlWrapper(getDrink),
  addFavoriteDrink: ctrlWrapper(addFavoriteDrink),
  deleteFavoriteDrink: ctrlWrapper(deleteFavoriteDrink),
  getFavoriteDrink: ctrlWrapper(getFavoriteDrink),
  getDrinkById: ctrlWrapper(getDrinkById),
};
