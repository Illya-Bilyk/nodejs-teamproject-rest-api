const jwt = require("jsonwebtoken");
const { HttpError } = require("../utils");
const { ACCESS_SECRET_JWT } = process.env;

const { User } = require("../models/user");
const { sessionModel } = require("../models/session");

const authenticate = async (req, res, next) => {
  const authorizationHeader = req.get("Authorization");
  if (authorizationHeader) {
    const accessToken = authorizationHeader.replace("Bearer ", "");
    let payload = {};
    try {
      payload = jwt.verify(accessToken, ACCESS_SECRET_JWT);
    } catch (err) {
      throw HttpError(401, "Unauthorized");
    }
    const user = await User.findById(payload.uid);
    const session = await sessionModel.findById(payload.sid);
    if (!user) {
      throw HttpError(404, "Invalid user");
    }
    if (!session) {
      throw HttpError(404, "Invalid session");
    }
    req.user = user;
    req.session = session;
    next();
  } else throw HttpError(400, "No token provided");
};

module.exports = authenticate;
