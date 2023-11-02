const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const { User } = require("../models/user");
const { sessionModel } = require("../models/session");
const { HttpError, ctrlWrapper } = require("../utils");

const { ACCESS_SECRET_JWT, REFRESH_SECRET_JWT } = process.env;

const register = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (user) {
    throw HttpError(409, "Email in use");
  }

  const hashPassword = await bcrypt.hash(password, 10);
  const newUser = await User.create({ ...req.body, password: hashPassword });

  // const payload = {
  //   uid: newUser._id,
  // };

  // const accessToken = jwt.sign(payload, ACCESS_SECRET_JWT, {
  //   expiresIn: "4h",
  // });

  const newSession = await sessionModel.create({
    uid: newUser._id,
  });

  const payload = { uid: newUser._id, sid: newSession._id };

  const accessToken = jwt.sign(payload, ACCESS_SECRET_JWT, {
    expiresIn: "4h",
  });
  await User.findByIdAndUpdate(newUser._id, {
    accessToken,
    sid: newSession._id,
  });
  res.status(201).json({
    accessToken,
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
    expiresIn: "2h",
  });
  const refreshToken = jwt.sign(payload, REFRESH_SECRET_JWT, {
    expiresIn: "24h",
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
};

const singout = async (req, res) => {
  const currentSession = req.session;
  await sessionModel.deleteOne({ _id: currentSession._id });
  return res.status(204).end();
};



module.exports = {
  register: ctrlWrapper(register),
  login: ctrlWrapper(login),
  refreshTokens: ctrlWrapper(refreshTokens),
  logout: ctrlWrapper(singout),
};
