const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
// const queryString = require("query-string");
// const URL = require("url");
// const axios = require("axios");

const { User } = require("../models/user");
const { sessionModel } = require("../models/session");
const { HttpError, ctrlWrapper, sendEmail } = require("../utils");


const { ACCESS_SECRET_JWT, REFRESH_SECRET_JWT } = process.env;

const register = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (user) {
    throw HttpError(409, "Email in use");
  }

  const hashPassword = await bcrypt.hash(password, 10);
  const newUser = await User.create({ ...req.body, password: hashPassword });

  const payload = {
    id: newUser._id,
  };

  const accessToken = jwt.sign(payload, ACCESS_SECRET_JWT, {
    expiresIn: "4h",
  });
  await User.findByIdAndUpdate(newUser._id, {
    accessToken,
  });
  res.status(201).json({
    accessToken,
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

  const newSession = await sessionModel.create({
    uid: user._id,
  });

  const payload = { uid: user._id, sid: newSession._id };

  const accessToken = jwt.sign(payload, ACCESS_SECRET_JWT, {
    expiresIn: "2h",
  });
  const refreshToken = jwt.sign(payload, REFRESH_SECRET_JWT, {
    expiresIn: "24h",
  });

  // const payload = {
  //   id: user._id,
  // };

  const { name, birthday } = user;
  // const token = jwt.sign(payload, ACCESS_SECRET_JWT, {
  //   expiresIn: "24h",
  // });

  await User.findByIdAndUpdate(user._id, {
    // token,
    accessToken: accessToken,
    refreshToken: refreshToken,
    sid: newSession._id,
  });

  res.json({
    // token,
    accessToken: accessToken,
    refreshToken: refreshToken,
    sid: newSession._id,
    user: {
      email,
      name,
      birthday,
    },
  });
};

// refreshTokens
const refreshTokens = async (req, res) => {
  const authorizationHeader = req.get("Authorization");
  if (authorizationHeader) {
    const activeSession = await sessionModel.findById(req.body.sid);
    if (!activeSession) {
      throw HttpError(404, "Invalid session");
      // return res.status(404).send({ message: "Invalid session" });
    }
    const reqRefreshToken = authorizationHeader.replace("Bearer ", "");
    let payload = {};
    try {
      payload = jwt.verify(reqRefreshToken, REFRESH_SECRET_JWT);
    } catch (err) {
      await sessionModel.findByIdAndDelete(req.body.sid);
      throw HttpError(401, "Unauthorized");
      // return res.status(401).send({ message: "Unauthorized" });
    }
    const user = await User.findById(payload.uid);
    const session = await sessionModel.findById(payload.sid);
    if (!user) {
      throw HttpError(404, "Invalid user");
      // return res.status(404).send({ message: "Invalid user" });
    }
    if (!session) {
      throw HttpError(404, "Invalid session");
      // return res.status(404).send({ message: "Invalid session" });
    }
    await sessionModel.findByIdAndDelete(payload.sid);
    const newSession = await sessionModel.create({
      uid: user._id,
    });
    const newAccessToken = jwt.sign(
      { uid: user._id, sid: newSession._id },
      ACCESS_SECRET_JWT,
      {
        expiresIn: "2h",
      }
    );
    const newRefreshToken = jwt.sign(
      { uid: user._id, sid: newSession._id },
      REFRESH_SECRET_JWT,
      { expiresIn: "24h" }
    );
    return res
      .status(200)
      .send({ newAccessToken, newRefreshToken, newSid: newSession._id });
  }
  throw HttpError(400, "No token provided");

  // return res.status(400).send({ message: "No token provided" });
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
//   //     process.env.ACCESS_SECRET_JWT,
//   //     {
//   //       expiresIn: "2h",
//   //     }
//   //   );
//   //   const refreshToken = jwt.sign(
//   //     { uid: existingParent._id, sid: newSession._id },
//   //     REFRESH_SECRET_JWT,
//   //     {
//   //       expiresIn: "24h",
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

const sendSubscribeEmail = async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    throw HttpError(404, "User not found");
  }
  if (user.subsribe) {
    throw HttpError(400, "Subscription has already been send");
  }

  const subscribedEmail = {
    to: email,
    subject: "Subscription",
    html: `<p>You successfully subscribed to our news!</p>`,
  };

  await sendEmail(subscribedEmail);

  await User.findByIdAndUpdate(user._id, { subsribe: true });

  res.json({
    message: "Subscription email sent",
  });
};

module.exports = {
  register: ctrlWrapper(register),
  login: ctrlWrapper(login),
  refreshTokens: ctrlWrapper(refreshTokens),
  // googleAuth: ctrlWrapper(googleAuth),
  // googleRedirect: ctrlWrapper(googleRedirect),
  logout: ctrlWrapper(logout),
  getCurrent: ctrlWrapper(getCurrent),
  sendSubscribeEmail: ctrlWrapper(sendSubscribeEmail),
};
