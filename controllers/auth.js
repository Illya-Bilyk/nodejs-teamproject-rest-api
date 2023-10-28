const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const User = require("../models/user");
const { HttpError, ctrlWrapper } = require("../utils");

const { SECRET_JWT } = process.env;

exports.register = ctrlWrapper(async (req, res) => {
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
});

exports.login = ctrlWrapper(async (req, res) => {
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
    id: user.id,
  };

  const { name, birthday } = user;

  const token = jwt.sign(payload, SECRET_JWT, {
    expiresIn: "24h",
  });
  await User.findByIdAndUpdate(user.id, { token });
  res.json({
    token,
    user: {
      email,
      name,
      birthday,
    },
  });
});

exports.logout = async (req, res) => {
  const { id } = req.user;
  await User.findByIdAndUpdate(id, { token: "" });
  res.status(204).send();
};
