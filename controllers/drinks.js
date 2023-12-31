const dobToAge = require("dob-to-age");
const { Recipe } = require("../models/recipe");
const { Ingredient } = require("../models/ingredient");
const { User } = require("../models/user");
const { ctrlWrapper, HttpError, deletePhoto } = require("../utils");

const searchDrinks = async (req, res, next) => {
  const {
    page = 1,
    limit = 9,
    keyword = "",
    category = "",
    ingredient = "",
  } = req.query;

  const { birthday } = req.user;

  if (!birthday) {
    next(HttpError(404, "Users not found (invalid query)"));
  }

  const birthdayReversed = birthday.split("/").reverse().join("/");
  const age = dobToAge(birthdayReversed);
  const alcohol = age > 18 ? ["Alcoholic", "Non alcoholic"] : ["Non alcoholic"];

  const skip = (page - 1) * limit;

  const drink = "";
  const alcoholic = "";
  const query = {};
  category && (query.category = category);
  ingredient && (query.ingredients = { $elemMatch: { title: ingredient } });
  drink && (query.drink = { $regex: `${keyword}`, $options: "i" });
  alcoholic && (query.alcoholic = alcohol);

  const responseSizeArray = await Recipe.find(query);

  if (!responseSizeArray) {
    throw HttpError(404, "Not found");
  }

  const size = Object.keys(responseSizeArray).length;

  const response = await Recipe.find(query, "-createdAt -updatedAt", {
    skip,
    limit,
  });

  if (!response) {
    throw HttpError(404, "Not found");
  }

  res.status(200).json({
    page: page,
    per_page: limit,
    max_page: size,
    drinks: response,
  });
};

const addDrinkImg = async (req, res, next) => {
  const avatarURL = req.file.path;

  if (!avatarURL) {
    next(HttpError(400, "Bad Request"));
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

  const responseIngredientArraySorted = () => {
    const sorted = ingredientTitleArray.map((item) => {
      const tempSortArr = responseIngredientArray.find(
        (element) => element.title === item
      );
      return tempSortArr;
    });
    return sorted;
  };

  const arraySorted = responseIngredientArraySorted();

  const ingredientIDArray = arraySorted.map((item) => {
    const ingrIDArray = item._id;
    return ingrIDArray;
  });

  const arrayIngredients = req.body.ingredients.map((item, index) => {
    const arr = Object.assign(item, { ingredientId: ingredientIDArray[index] });
    return arr;
  });

  const response = await Recipe.insertMany({
    ...req.body,
    ingredients: arrayIngredients,
    owner,
  });

  if (!response) {
    next(HttpError(404, "Not found"));
  }

  res.status(200).json({
    message: "drink added",
  });
};

const deleteDrink = async (req, res, next) => {
  const { drinkId } = req.params;
  const { _id } = req.user;

  if (!drinkId || !_id) {
    next(HttpError(404, "Not found"));
  }

  const responseUserDrink = await Recipe.find({ _id: drinkId });

  if (
    !responseUserDrink ||
    responseUserDrink[0].owner === undefined ||
    responseUserDrink[0].owner.toString() !== _id.toString()
  ) {
    next(HttpError(404, "Not found"));
  }

  await deletePhoto("cocktails", _id);

  const response = await Recipe.findByIdAndRemove(drinkId);

  if (!response) {
    next(HttpError(404, "Not found"));
  }

  res.status(200).json({
    message: "drink deleted",
  });
};

const getDrink = async (req, res, next) => {
  const { _id } = req.user;
  const { page = 1, limit = 9 } = req.query;

  const { birthday } = req.user;

  if (!birthday) {
    next(HttpError(404, "Users not found (invalid query)"));
  }

  const birthdayReversed = birthday.split("/").reverse().join("/");
  const age = dobToAge(birthdayReversed);
  const alcohol = age > 18 ? ["Alcoholic", "Non alcoholic"] : ["Non alcoholic"];

  const skip = (page - 1) * limit;

  const responseSizeArray = await Recipe.find({
    owner: _id,
    alcoholic: alcohol,
  });

  if (!responseSizeArray) {
    next(HttpError(404, "Not found"));
  }

  const size = Object.keys(responseSizeArray).length;

  const response = await Recipe.find(
    {
      owner: _id,
      alcoholic: alcohol,
    },
    "-createdAt -updatedAt",
    {
      skip,
      limit,
    }
  );

  if (!response) {
    next(HttpError(404, "Not found"));
  }

  res.status(200).json({
    page: page,
    per_page: limit,
    max_page: size,
    drinks: response,
  });
};

const addFavoriteDrink = async (req, res, next) => {
  const userId = req.user._id;
  const { drinkId } = req.params;

  const responseRecipe = await Recipe.updateOne(
    { _id: drinkId },
    { $addToSet: { users: userId } }
  );

  if (!responseRecipe) {
    next(HttpError(404, "Not found"));
  }

  const responseUser = await User.updateOne(
    { _id: userId },
    { $addToSet: { favoriteDrinks: drinkId } }
  );

  if (!responseUser) {
    next(HttpError(404, "Not found"));
  }

  const userFavoriteDrinks = await User.findById(userId);

  if (!userFavoriteDrinks) {
    next(HttpError(404, "Not found"));
  }

  const favoriteDrinksArrayLength = userFavoriteDrinks.favoriteDrinks.length;

  res.status(200).json({ favoriteDrinks: `${favoriteDrinksArrayLength}` });
};

const deleteFavoriteDrink = async (req, res, next) => {
  const userId = req.user._id;
  const { drinkId } = req.params;

  const responseRecipe = await Recipe.updateOne(
    { _id: drinkId },
    { $pull: { users: userId } }
  );

  if (!responseRecipe) {
    next(HttpError(404, "Not found"));
  }

  const responseUser = await User.updateOne(
    { _id: userId },
    { $pull: { favoriteDrinks: drinkId } }
  );

  if (!responseUser) {
    next(HttpError(404, "Not found"));
  }

  const userFavoriteDrinks = await User.findById(userId);

  if (!userFavoriteDrinks) {
    next(HttpError(404, "Not found"));
  }

  const favoriteDrinksArrayLength = userFavoriteDrinks.favoriteDrinks.length;

  res.status(200).json({ favoriteDrinks: `${favoriteDrinksArrayLength}` });
};

const getFavoriteDrink = async (req, res, next) => {
  const userId = req.user._id;
  const { page = 1, limit = 9 } = req.query;

  const { birthday } = req.user;

  if (!birthday) {
    next(HttpError(404, "Users not found (invalid query)"));
  }

  const birthdayReversed = birthday.split("/").reverse().join("/");
  const age = dobToAge(birthdayReversed);
  const alcohol = age > 18 ? ["Alcoholic", "Non alcoholic"] : ["Non alcoholic"];

  const skip = (page - 1) * limit;

  const userFavoriteDrinks = await User.findById(userId);

  if (!userFavoriteDrinks) {
    next(HttpError(404, "Favorites drink not found"));
  }

  const favoriteDrinksArray = userFavoriteDrinks.favoriteDrinks;

  const responseSizeArray = await Recipe.find({
    _id: favoriteDrinksArray,
    alcoholic: alcohol,
  });

  const size = Object.keys(responseSizeArray).length;

  const response = await Recipe.find(
    {
      _id: favoriteDrinksArray,
      alcoholic: alcohol,
    },
    "-createdAt -updatedAt",
    {
      skip,
      limit,
    }
  );

  if (!response) {
    next(HttpError(404, "Not found"));
  }

  res.status(200).json({
    page: page,
    per_page: limit,
    max_page: size,
    favoriteDrinks: response,
  });
};

const getDrinkById = async (req, res, next) => {
  const { drinkId } = req.params;

  const response = (await Recipe.findById(drinkId)).toObject();

  if (!response) {
    next(HttpError(404, "Drink not found"));
  }

  const ingredientIDArray = response.ingredients.map((item) => {
    const ingredientArray = item.ingredientId;
    return ingredientArray;
  });

  const responseIngredientArray = await Ingredient.find({
    _id: ingredientIDArray,
  });
  if (!responseIngredientArray) {
    next(HttpError(404, "Not found"));
  }

  const responseIngredientArraySorted = () => {
    const sorted = ingredientIDArray.map((item) => {
      const tempSortArr = responseIngredientArray.find(
        (element) => element._id.toString() === item.toString()
      );
      return tempSortArr;
    });
    return sorted;
  };

  const responseArraySorted = responseIngredientArraySorted();

  const ingredientReferenceArray = responseArraySorted.map((item) => {
    const ingredientThumbArray = item.ingredientThumb;
    return ingredientThumbArray;
  });

  const arrayIngredients = response.ingredients.map((item, index) => {
    const arr = Object.assign(item, {
      ingredientThumb: ingredientReferenceArray[index],
    });
    return arr;
  });

  const userId = req.user._id;

  const userFavoriteDrinks = (await User.findById(userId)).toObject();

  if (!userFavoriteDrinks) {
    next(HttpError(404, "Not found"));
  }

  const favoriteArray = userFavoriteDrinks.favoriteDrinks.map((item) => {
    const favor = item._id.toString() === drinkId;
    return favor;
  });

  const isFavorite = favoriteArray.includes(true);

  const result = {
    ...response,
    ingredients: arrayIngredients,
    favorite: isFavorite,
  };

  res.status(200).json(result);
};

module.exports = {
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
