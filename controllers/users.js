const { User } = require("../models/user");
const { HttpError, ctrlWrapper, sendEmail, deletePhoto } = require("../utils");

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

const updateUser = async (req, res) => {
  const { id } = req.user;
  const { name } = req.body;

  if (name && req.file) {
    const avatar = req.file.path;

    const result = await User.findByIdAndUpdate(id, { ...req.body, avatar });

    if (!result) {
      throw HttpError(404);
    }

    await deletePhoto("avatars", id);

    res.json({ name, avatar });
    return;
  }

  if (name) {
    const result = await User.findByIdAndUpdate(id, { ...req.body });

    if (!result) {
      throw HttpError(404);
    }

    res.json({ name });
  }

  if (req.file) {
    const avatar = req.file.path;

    const result = await User.findByIdAndUpdate(id, { avatar });

    if (!result) {
      throw HttpError(404);
    }

    await deletePhoto("avatars", id);

    res.json({ avatar });
  }
};

module.exports = {
  getCurrent: ctrlWrapper(getCurrent),
  sendSubscribeEmail: ctrlWrapper(sendSubscribeEmail),
  updateUser: ctrlWrapper(updateUser),
};
