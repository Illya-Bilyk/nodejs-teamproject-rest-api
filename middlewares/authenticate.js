const jwt = require("jsonwebtoken");
const { HttpError } = require("../utils");
const { SECRET_JWT } = process.env;
const { User } = require("../models/user");

const authenticate = async (req, res, next) => {
  const { authorization = "" } = req.headers;
  const [bearer, token] = authorization.split(" ");
  if (bearer !== "Bearer") {
    return next(HttpError(401));
  }

  try {
    const { id } = jwt.verify(token, SECRET_JWT);
    const user = await User.findById(id);
    if (!user || !user.token || user.token !== token) {
      return next(HttpError(401));
    }
    req.user = user;
    next();
  } catch {
    return next(HttpError(401));
  }
};

module.exports = authenticate;

// const jwt = require("jsonwebtoken");
// const { HttpError, ctrlWrapper } = require("../utils");
// const { SECRET_JWT } = process.env;
// const User = require("../models/user");

// const authenticate = ctrlWrapper(async (req, res, next) => {
//   const token =
//     req.headers.authorization?.startsWith("Bearer") &&
//     req.headers.authorization.split(" ")[1];

//   const checkToken = (token) => {
//     if (!token) throw HttpError(401, "Not authorized");

//     try {
//       const { id } = jwt.verify(token, SECRET_JWT);
//       return id;
//     } catch (err) {
//       console.log(err.message);

//       throw HttpError(401, "Not authorized");
//     }
//   };

//   const userId = checkToken(token);
//   const currentUser = await User.findById(userId);
//   console.log(currentUser.token);

//   if (!currentUser || !currentUser.token || currentUser.token !== token)
//     throw HttpError(401, "Not authorized");

//   req.user = currentUser;

//   next();
// });

// module.exports = authenticate;
