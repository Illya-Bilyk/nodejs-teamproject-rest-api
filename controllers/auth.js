const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const querystring = require("node:querystring");
const axios = require("axios");

const { User } = require("../models/user");
const { sessionModel } = require("../models/session");
const { HttpError, ctrlWrapper } = require("../utils");

const {
  ACCESS_SECRET_JWT,
  REFRESH_SECRET_JWT,
  BASE_URL,
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
} = process.env;

const register = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (user) {
    throw HttpError(409, "Email in use");
  }

  const hashPassword = await bcrypt.hash(password, 10);
  const newUser = await User.create({
    ...req.body,
    password: hashPassword,
  });

  const newSession = await sessionModel.create({
    uid: newUser._id,
  });

  const payload = { uid: newUser._id, sid: newSession._id };

  const accessToken = jwt.sign(payload, ACCESS_SECRET_JWT, {
    expiresIn: "12h",
  });
  const refreshToken = jwt.sign(payload, REFRESH_SECRET_JWT, {
    expiresIn: "7d",
  });
  await User.findByIdAndUpdate(newUser._id, {
    accessToken,
    refreshToken,
    sid: newSession._id,
  });
  res.status(201).json({
    accessToken,
    refreshToken,
    sid: newSession._id,
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
    expiresIn: "12h",
  });
  const refreshToken = jwt.sign(payload, REFRESH_SECRET_JWT, {
    expiresIn: "7d",
  });

  const { name, birthday } = user;

  await User.findByIdAndUpdate(user._id, {
    accessToken: accessToken,
    refreshToken: refreshToken,
    sid: newSession._id,
  });

  res.json({
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

const refreshTokens = async (req, res) => {
  const authorizationHeader = req.get("Authorization");
  if (authorizationHeader) {
    const activeSession = await sessionModel.findById(req.body.sid);
    if (!activeSession) {
      throw HttpError(404, "Invalid session");
    }
    const reqRefreshToken = authorizationHeader.replace("Bearer ", "");
    let payload = {};
    try {
      payload = jwt.verify(reqRefreshToken, REFRESH_SECRET_JWT);
    } catch (err) {
      await sessionModel.findByIdAndDelete(req.body.sid);
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
    await sessionModel.findByIdAndDelete(payload.sid);
    const newSession = await sessionModel.create({
      uid: user._id,
    });
    const newAccessToken = jwt.sign(
      { uid: user._id, sid: newSession._id },
      ACCESS_SECRET_JWT,
      {
        expiresIn: "12h",
      }
    );
    const newRefreshToken = jwt.sign(
      { uid: user._id, sid: newSession._id },
      REFRESH_SECRET_JWT,
      { expiresIn: "7d" }
    );
    const { name, _id, birthday, email } = user;

    return res.json({
      sid: newSession._id,
      user: {
        _id,
        name,
        email,
        birthday,
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      },
    });
  }
  throw HttpError(400, "No token provided");
};

const signout = async (req, res) => {
  const currentSession = req.session;
  const { id } = req.user;
  await User.findByIdAndUpdate(id, { accessToken: "", refreshToken: "" });
  await sessionModel.deleteOne({ _id: currentSession._id });
  return res.status(204).end();
};

const googleAuth = async (req, res) => {
  const stringifiedParams = querystring.stringify({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: `${BASE_URL}/auth/google-redirect`,
    scope: [
      "https://www.googleapis.com/auth/userinfo.email",
      "https://www.googleapis.com/auth/userinfo.profile",
    ].join(" "),
    response_type: "code",
    access_type: "offline",
    prompt: "consent",
  });
  return res.redirect(
    `https://accounts.google.com/o/oauth2/v2/auth?${stringifiedParams}`
  );
};

const googleRedirect = async (req, res) => {
  const fullUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
  const urlObj = new URL(fullUrl);
  const urlParams = querystring.parse(urlObj.search);
  const code = Object.values(urlParams)[0];
  const tokenData = await axios({
    url: `https://oauth2.googleapis.com/token`,
    method: "post",
    data: {
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      redirect_uri: `${BASE_URL}/auth/google-redirect`,
      grant_type: "authorization_code",
      code,
    },
  });

  const userData = await axios({
    url: "https://www.googleapis.com/oauth2/v2/userinfo",
    method: "get",
    headers: {
      Authorization: `Bearer ${tokenData.data.access_token}`,
    },
  });

  const existingParent = await User.findOne({ email: userData.data.email });

  if (!existingParent) {
    return res.redirect(`${BASE_URL}/signup`);
  }
  const newSession = await sessionModel.create({
    uid: existingParent._id,
  });
  const accessToken = jwt.sign(
    { uid: existingParent._id, sid: newSession._id },
    ACCESS_SECRET_JWT,
    {
      expiresIn: "12h",
    }
  );
  const refreshToken = jwt.sign(
    { uid: existingParent._id, sid: newSession._id },
    REFRESH_SECRET_JWT,
    {
      expiresIn: "7d",
    }
  );
  return res.redirect(
    `${BASE_URL}/home?accessToken=${accessToken}&refreshToken=${refreshToken}&sid=${newSession._id}`
  );
};

module.exports = {
  register: ctrlWrapper(register),
  login: ctrlWrapper(login),
  refreshTokens: ctrlWrapper(refreshTokens),
  signout: ctrlWrapper(signout),
  googleAuth: ctrlWrapper(googleAuth),
  googleRedirect: ctrlWrapper(googleRedirect),
};
