const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
// const queryString = require("query-string");
// const URL = require("url");
// const axios = require("axios");

const { User } = require("../models/user");
const { HttpError, ctrlWrapper } = require("../utils");

const { SECRET_JWT } = process.env;

const register = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (user) {
    throw HttpError(409, "Email in use");
  }

  const hashPassword = await bcrypt.hash(password, 10);
  const newUser = await User.create({ ...req.body, password: hashPassword });

  res.status(201).json({
    user: {
      name: newUser.name,
      email: newUser.email,
      birthday: newUser.birthday,
    },
  });
};

const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    throw HttpError(401, "Email or password is wrong");
  }

  const passwordCompare = await bcrypt.compare(password, user.password);

  if (passwordCompare === false) {
    throw HttpError(401, "Email or password is wrong");
  }

  const payload = {
    id: user._id,
  };

  const { name, birthday } = user;
  const token = jwt.sign(payload, SECRET_JWT, {
    expiresIn: "24h",
  });

  await User.findByIdAndUpdate(user._id, { token });
  res.json({
    token,
    user: {
      email,
      name,
      birthday,
    },
  });
};

// const googleAuth = async (req, res) => {
//   const stringifiedParams = queryString.stringify({
//     client_id: process.env.GOOGLE_CLIENT_ID,
//     redirect_uri: `${process.env.BASE_URL}/auth/google-redirect`,
//     scope: [
//       "https://www.googleapis.com/auth/userinfo.email",
//       "https://www.googleapis.com/auth/userinfo.profile",
//     ].join(" "),
//     response_type: "code",
//     access_type: "offline",
//     prompt: "consent",
//   });
//   return res.redirect(
//     `https://accounts.google.com/o/oauth2/v2/auth?${stringifiedParams}`
//   );
// };

// const googleRedirect = async (req, res) => {
//   const fullUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
//   const urlObj = new URL(fullUrl);
//   const urlParams = queryString.parse(urlObj.search);
//   const code = urlParams.code;
//   console.log(code);
//   const tokenData = await axios({
//     url: `https://oauth2.googleapis.com/token`,
//     method: "post",
//     data: {
//       client_id: process.env.GOOGLE_CLIENT_ID,
//       client_secret: process.env.GOOGLE_CLIENT_SECRET,
//       redirect_uri: `${process.env.BASE_URL}/auth/google-redirect`,
//       grant_type: "authorization_code",
//       code,
//     },
//   });
//   const userData = await axios({
//     url: "https://www.googleapis.com/oauth2/v2/userinfo",
//     method: "get",
//     headers: {
//       Authorization: `Bearer ${tokenData.data.access_token}`,
//     },
//   });
//   console.log(userData);
//   const existingParent = await User.findOne({ email: userData.data.email });
//   if (!existingParent || !existingParent.originUrl) {
//     return res.status(403).send({
//       message:
//         "You should register from front-end first (not postman). Google/Facebook are only for sign-in",
//     });
//   }
//   //   const newSession = await SessionModel.create({
//   //     uid: existingParent._id,
//   //   });
//   //   const accessToken = jwt.sign(
//   //     { uid: existingParent._id, sid: newSession._id },
//   //     process.env.JWT_ACCESS_SECRET as string,
//   //     {
//   //       expiresIn: process.env.JWT_ACCESS_EXPIRE_TIME,
//   //     }
//   //   );
//   //   const refreshToken = jwt.sign(
//   //     { uid: existingParent._id, sid: newSession._id },
//   //     process.env.JWT_REFRESH_SECRET as string,
//   //     {
//   //       expiresIn: process.env.JWT_REFRESH_EXPIRE_TIME,
//   //     }
//   // );
//   return res
//     .redirect
//     // `${existingParent.originUrl}?accessToken=${accessToken}&refreshToken=${refreshToken}&sid=${newSession._id}`
//     ();
// };

const logout = async (req, res) => {
  const { _id } = req.user;
  await User.findByIdAndUpdate(_id, { token: "" });
  res.status(204).send();
};

const getCurrent = (req, res) => {
  const { email, birthday } = req.user;

  res.json({
    email,
    birthday,
  });
};

module.exports = {
  register: ctrlWrapper(register),
  login: ctrlWrapper(login),
  // googleAuth: ctrlWrapper(googleAuth),
  // googleRedirect: ctrlWrapper(googleRedirect),
  logout: ctrlWrapper(logout),
  getCurrent: ctrlWrapper(getCurrent),
};
