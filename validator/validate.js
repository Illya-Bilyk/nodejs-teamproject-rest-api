const Joi = require("joi");

exports.registerSchema = (data) =>
  Joi.object()
    .options({ abortEarly: false })
    .keys({
      name: Joi.string()
        .required()
        .messages({ "any.required": `missing required name field` }),
      birthday: Joi.string()
        .required()
        .messages({ "any.required": `missing required birthday field` }),
      email: Joi.string()
        .email()
        .required()
        .messages({ "any.required": `missing required email field` }),
      password: Joi.string().min(5).required().messages({
        "string.min": `password must be longer than 5 characters`,
        "any.required": `missing required password field`,
      }),
    })
    .validate(data);

exports.loginSchema = (data) =>
  Joi.object()
    .options({ abortEarly: false })
    .keys({
      email: Joi.string()
        .email()
        .required()
        .messages({ "any.required": `missing required email field` }),
      password: Joi.string().min(5).required().messages({
        "string.min": `password must be longer than 5 characters`,
        "any.required": `missing required password field`,
      }),
    })
    .validate(data);
