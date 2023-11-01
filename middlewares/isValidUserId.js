const { isValidObjectId } = require("mongoose");
const { HttpError } = require("../utils");

const isValidUserId = (req, res, next) => {
  const { id } = req.user;

  if (!isValidObjectId(id)) {
    next(HttpError(400, `${id} is not valid id`));
  }
  next();
};

module.exports = isValidUserId;
