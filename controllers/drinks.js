const dobToAge = require("dob-to-age");
const { Recipe } = require("../models/recipe");
const  User = require("../models/user"); 
const { ctrlWrapper, HttpError } = require("../utils");

// const getMainpageDrinks = async (req, res) => {
//   res.status(200).json();
// };

// const getPopularDrinks = async (req, res) => {
//   res.status(200).json();
// };

const searchDrinks = async (req, res) => {
  const {
    page = 1,
    limit = 9,
    keyword = "",
    category = "",
    ingredient = "",
  } = req.query;

  const { authorization = "" } = req.headers;
  const [bearer, token] = authorization.split(" ");

  if (bearer !== "Bearer" || !token) {
    throw HttpError(400, "No token provided");
  }

  const responseUserAge = await User.findOne({ token });

  if (!responseUserAge) {
    throw HttpError(401, "Unauthorized (invalid access token)");
  }

  const { birthday } = responseUserAge;
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
  const { authorization = "" } = req.headers;
  
  const [bearer, token] = authorization.split(" ");  

  if (bearer !== "Bearer" || !token) {
    throw HttpError(400, "No token provided");
  }

  const { drinkId } = req.params;

  const response = await Recipe.findById(drinkId);

  if (!response) {
    throw HttpError(404, "Drink not found");
  }

  res.status(200).json(response);
};

module.exports = {
  // getMainpageDrinks: ctrlWrapper(getMainpageDrinks),
  // getPopularDrinks: ctrlWrapper(getPopularDrinks),
  searchDrinks: ctrlWrapper(searchDrinks),
  addDrink: ctrlWrapper(addDrink),
  deleteDrink: ctrlWrapper(deleteDrink),
  getDrink: ctrlWrapper(getDrink),
  addFavoriteDrink: ctrlWrapper(addFavoriteDrink),
  deleteFavoriteDrink: ctrlWrapper(deleteFavoriteDrink),
  getFavoriteDrink: ctrlWrapper(getFavoriteDrink),
  getDrinkById: ctrlWrapper(getDrinkById),
};
