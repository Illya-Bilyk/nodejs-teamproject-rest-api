const { User } = require("../models/user");
const { HttpError, ctrlWrapper, sendEmail } = require("../utils");

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

const updatUser = async (req, res) => {
  const { id } = req.user;
  const { name } = req.body;

  const avatarURL = req.file.path;

  const result = await User.findByIdAndUpdate(id, { ...req.body, avatarURL });

  if (!result) {
    throw HttpError(404);
  }

  res.json({ name, avatarURL });
};

module.exports = {
  getCurrent: ctrlWrapper(getCurrent),
  sendSubscribeEmail: ctrlWrapper(sendSubscribeEmail),
  updatUser: ctrlWrapper(updatUser),
};
