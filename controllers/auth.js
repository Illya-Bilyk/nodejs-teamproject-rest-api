const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const { User } = require("../models/user");
const { HttpError, ctrlWrapper, sendEmail } = require("../utils");

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
  logout: ctrlWrapper(logout),
  getCurrent: ctrlWrapper(getCurrent),
  sendSubscribeEmail: ctrlWrapper(sendSubscribeEmail),
};
