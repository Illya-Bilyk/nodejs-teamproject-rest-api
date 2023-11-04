const dobToAge = require("dob-to-age");
const { Recipe } = require("../models/recipe");
const { Ingredient } = require("../models/ingredient");
const { Drinks } = require("../models/drinks");
const { ctrlWrapper, HttpError } = require("../utils");
// const { ObjectId } = require("mongoose");

const getMainpageDrinks = async (req, res) => {
  // const { birthday } = req.user;

  // if (!birthday) {
  //   throw HttpError(404, "Users not found (invalid query)");
  // }

  // const birthdayReversed = birthday.split("/").reverse().join("/");
  // const age = dobToAge(birthdayReversed);

  const age = 35; // Temporarily set the age to 18+
  const alcohol = age > 18;

  // Function for random array shuffling
  const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  };

  // Request for all drinks
  const resultAll = await Recipe.aggregate([
    {
      $match: {
        category: {
          $in: ["Ordinary Drink", "Cocktail", "Shake", "Other/Unknown"],
        },
      },
    },
    { $group: { _id: "$category", drinks: { $push: "$$ROOT" } } },
    {
      $project: {
        _id: 0,
        category: "$_id",
        drinks: 1,
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
    {
      $addFields: {
        order: {
          $indexOfArray: [
            ["Ordinary Drink", "Cocktail", "Shake", "Other/Unknown"],
            "$category",
          ],
        },
      },
    },
    {
      $sort: { order: 1 },
    },
    {
      $project: {
        order: 0,
      },
    },
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
        drinks: 1,
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
    {
      $addFields: {
        order: {
          $indexOfArray: [
            ["Ordinary Drink", "Cocktail", "Shake", "Other/Unknown"],
            "$category",
          ],
        },
      },
    },
    {
      $sort: { order: 1 },
    },
    {
      $project: {
        order: 0,
      },
    },
  ]);

  const result = alcohol ? resultAll : resultNonAlko;

  // Mixing the elements of the drinks array in each category and trimming it to three elements
  result.forEach((category) => {
    category.drinks = shuffleArray(category.drinks).slice(0, 3);
  });

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
    {
      alcoholic: alcohol,
      category: ["Soft Drink", "Cocoa", "Beer", "Ordinary Drink"],
    },
    {
      _id: 1,
      drink: 1,
      category: 1,
      alcoholic: 1,
      drinkThumb: 1,
      description: 1,
    }
  ).limit(4);

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

const addDrinkImg = async (req, res) => {
  const avatarURL = req.file.path;

  if (!avatarURL) {
    throw HttpError(400, "Bad Request");
  }

  res.status(201).json({
    avatarURL: avatarURL,
  });
};

const addDrink = async (req, res, next) => {
  const { _id: owner } = req.user;

  const ingredientTitleArray = req.body.ingredients.map((item) => {
    const ingredientArray = item.title;
    return ingredientArray;
  });

  const responseIngredientArray = await Ingredient.find({
    title: ingredientTitleArray,
  });

  const ingredientIDArray = responseIngredientArray.map((item) => {
    const ingrIDArray = item._id;
    return ingrIDArray;
  });

  const arrayIngredients = req.body.ingredients.map((item, index) => {
    const arr = Object.assign(item, { ingredientId: ingredientIDArray[index] });
    return arr;
  });

  const response = await Drinks.insertMany(
    {
      ...req.body,
      ingredients: arrayIngredients,
      owner,
    },
    { _id: false }
  );

  if (!response) {
    throw HttpError(404, "Add request not made (invalid request)");
  }

  res.status(200).json({
    message: "drink added",
  });
};

const deleteDrink = async (req, res) => {
  const { drinkId } = req.params;

  const response = await Drinks.findByIdAndRemove(drinkId);

  if (!response) {
    throw HttpError(404, "Not found");
  }

  res.status(200).json({
    message: "drink deleted",
  });
};

const getDrink = async (req, res) => {
  const { _id } = req.user;

  const response = await Drinks.find({ owner: _id });

  if (!response) {
    throw HttpError(404, "Not found");
  }

  res.status(200).json(response);
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
  addDrinkImg: ctrlWrapper(addDrinkImg),
  addDrink: ctrlWrapper(addDrink),
  deleteDrink: ctrlWrapper(deleteDrink),
  getDrink: ctrlWrapper(getDrink),
  addFavoriteDrink: ctrlWrapper(addFavoriteDrink),
  deleteFavoriteDrink: ctrlWrapper(deleteFavoriteDrink),
  getFavoriteDrink: ctrlWrapper(getFavoriteDrink),
  getDrinkById: ctrlWrapper(getDrinkById),
};
