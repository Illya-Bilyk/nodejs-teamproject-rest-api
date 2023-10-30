const { Schema, model } = require("mongoose");
const Joi = require("joi");
const { handleMongooseError } = require("../utils");

const emailRegexp = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/;

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "name is required"],
    },
    birthday: {
      type: String,
      required: [true, "Birthday is required"],
      unique: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
    },
    password: {
      type: String,
      required: [true, "Set password for user"],
    },
    favorites: {
      type: [],
      default: undefined,
    },
    token: {
      type: String,
      default: null,
    },
  },
  { versionKey: false, timestamps: true }
);

userSchema.post("save", handleMongooseError);

const User = model("user", userSchema);

module.exports = {
  User,
};
