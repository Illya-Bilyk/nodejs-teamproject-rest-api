const dobToAge = require("dob-to-age");
const { Recipe } = require("../models/recipe");
const { ctrlWrapper, HttpError } = require("../utils");

// Mainpage drinks request
const getMainpageDrinks = async (req, res) => {
  // Age validation
  const { birthday } = req.user;
  if (!birthday) {
    throw HttpError(404, "Users not found (invalid query)");
  }
  const birthdayReversed = birthday.split("/").reverse().join("/");
  const age = dobToAge(birthdayReversed);
  const alcohol = age > 18;

  // Function for random array shuffling
  const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  };

  // Request for all drinks (18+ user)
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

  // Request only for non-alcoholic drinks (underage user)
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

// Popular drinks request
const getPopularDrinks = async (req, res) => {
  // Age validation
  const { birthday } = req.user;
  if (!birthday) {
    throw HttpError(404, "Users not found (invalid query)");
  }
  const birthdayReversed = birthday.split("/").reverse().join("/");
  const age = dobToAge(birthdayReversed);
  const alcohol = age > 18 ? ["Alcoholic", "Non alcoholic"] : ["Non alcoholic"];

  // General Request (18+ user and underage user )
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

module.exports = {
  getMainpageDrinks: ctrlWrapper(getMainpageDrinks),
  getPopularDrinks: ctrlWrapper(getPopularDrinks),
};
