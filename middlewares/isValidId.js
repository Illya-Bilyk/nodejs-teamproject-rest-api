const { isValidObjectId } = require("mongoose");

const { HttpError } = require("../utils");

const isValidId = (req, res, next) => {
  const { drinkId } = req.params;
  console.log("isValidId req.params: ", req.params);

  if (!isValidObjectId(drinkId)) {
    next(HttpError(400, `${drinkId} is not valid id`));
  }
  next();
};

module.exports = isValidId;
