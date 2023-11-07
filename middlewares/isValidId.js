const { isValidObjectId } = require("mongoose");

const { HttpError } = require("../utils");

const isRealId = (id, next) => {
  if (!isValidObjectId(id)) {
    next(HttpError(400, `${id} is not valid id`));
  }
};

const isValidId = (req, res, next) => {
  const { drinkId } = req.params;
  const { id } = req.user;

  drinkId ? isRealId(drinkId, next) : isRealId(id, next);

  next();
};

module.exports = isValidId;
