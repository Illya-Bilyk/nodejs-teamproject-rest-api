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
    accessToken: {
      type: String,
      default: null,
    },
    refreshToken: {
      type: String,
      default: null,
    },
    favoriteDrinks: [{ type: Schema.Types.ObjectId, ref: "recipe" }],
    // sid: {
    //   type: String,
    // },
  },
  { versionKey: false, timestamps: true }
);

userSchema.post("save", handleMongooseError);

const registerSchema = Joi.object({
  name: Joi.string().required().messages({
    "string.base": `name should be a type of 'text'`,
    "string.empty": `name cannot be an empty field`,
    "any.required": `missing required name field`,
  }),
  birthday: Joi.string()
    .required()
    .messages({ "any.required": `missing required birthday field` }),
  email: Joi.string().pattern(emailRegexp).required().messages({
    "string.base": `email should be a type of 'text'`,
    "string.empty": `email cannot be an empty field`,
    "string.pattern.base": `email not valid`,
    "any.required": `missing required email field`,
  }),
  password: Joi.string().min(6).required().messages({
    "string.base": `password should be a type of 'text'`,
    "string.empty": `password cannot be an empty field`,
    "string.min": `password must be at least 6 characters long`,
    "any.required": `missing required password field`,
  }),
});

const loginSchema = Joi.object({
  email: Joi.string().pattern(emailRegexp).required().messages({
    "string.base": `email should be a type of 'text'`,
    "string.empty": `email cannot be an empty field`,
    "string.pattern.base": `email not valid`,
    "any.required": `missing required email field`,
  }),
  password: Joi.string().min(6).required().messages({
    "string.base": `password should be a type of 'text'`,
    "string.empty": `password cannot be an empty field`,
    "string.min": `password must be at least 6 characters long`,
    "any.required": `missing required password field`,
  }),
});

const emailSchema = Joi.object({
  email: Joi.string().pattern(emailRegexp).required().messages({
    "string.base": `email should be a type of 'text'`,
    "string.empty": `email cannot be an empty field`,
    "string.pattern.base": `email not valid`,
    "any.required": `missing required email field`,
  }),
});

const updatUserSchema = Joi.object({
  name: Joi.string().required().messages({
    "string.base": `name should be a type of 'text'`,
    "string.empty": `name cannot be an empty field`,
    "any.required": `missing required name field`,
  }),
});

const schemas = {
  registerSchema,
  loginSchema,
  emailSchema,
  updatUserSchema,
};
const User = model("user", userSchema);

module.exports = {
  User,
  schemas,
};
