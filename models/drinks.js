const { model, Schema } = require("mongoose");
const { handleMongooseError } = require("../utils");
const Joi = require("joi");

const drinksSchema = new Schema(
  {
    drink: {
      type: String,
      required: [true, "Set name for drink"],
      minlength: 2,
      maxlength: 100,
      unique: true,
    },
    category: {
      type: String,
      required: [true, "Choose category for a drink"],
      minlength: 2,
      maxlength: 100,
    },
    alcoholic: {
      type: String,
      required: true,
      enum: ["Alcoholic", "Non alcoholic"],
    },
    glass: {
      type: String,
      required: [true, "Choose glass for a drink"],
      minlength: 2,
      maxlength: 150,
    },
    description: {
      type: String,
      required: true,
      minlength: 2,
      maxlength: 500,
    },
    instructions: {
      type: String,
      required: true,
      minlength: 2,
      maxlength: 500,
    },
    drinkThumb: {
      type: String,
      required: true,
      minlength: 2,
      maxlength: 500,
    },
    ingredients: [
      {
        title: { type: String, required: true, minlength: 2, maxlength: 100 },
        measure: { type: String, required: true, minlength: 2, maxlength: 100 },
        ingredientId: {
          type: Schema.Types.ObjectId,
          ref: "ingredient",
        },
      },
    ],
    owner: { type: Schema.Types.ObjectId, ref: "user" },
  },
  { versionKey: false, timestamps: true }
);

drinksSchema.post("save", handleMongooseError);

const addDrinkSchema = Joi.object({
  drink: Joi.string().min(2).max(100).required().messages({
    "any.required": `missing required name field`,
    "string.empty": `"name" cannot be empty, min 2 max 100 letters`,
    "string.base": `"name" must be string`,
  }),
  category: Joi.string().min(2).max(100).required().messages({
    "any.required": `missing required name field`,
    "string.empty": `"name" cannot be empty, min 2 max 100 letters`,
    "string.base": `"name" must be string`,
  }),
  alcoholic: Joi.string().min(2).max(100).required().messages({
    "any.required": `missing required name field`,
    "string.empty": `"name" cannot be empty, min 2 max 100 letters`,
    "string.base": `"name" must be string`,
  }),
  glass: Joi.string().min(2).max(100).required().messages({
    "any.required": `missing required name field`,
    "string.empty": `"name" cannot be empty, min 2 max 100 letters`,
    "string.base": `"name" must be string`,
  }),
  description: Joi.string().min(2).max(500).required().messages({
    "any.required": `missing required name field`,
    "string.empty": `"name" cannot be empty, min 2 max 500 letters`,
    "string.base": `"name" must be string`,
  }),
  instructions: Joi.string().min(2).max(500).required().messages({
    "any.required": `missing required name field`,
    "string.empty": `"name" cannot be empty, min 2 max 500 letters`,
    "string.base": `"name" must be string`,
  }),
  drinkThumb: Joi.string().min(2).max(500).required().messages({
    "any.required": `missing required name field`,
    "string.empty": `"name" cannot be empty, min 2 max 500 letters`,
    "string.base": `"name" must be string`,
  }),
  ingredients: Joi.array().items({
    title: Joi.string().min(2).max(100).required(),
    measure: Joi.string().min(2).max(100).required(),
  }),
});

const Drinks = model("drink", drinksSchema);

const schemasDrinks = { addDrinkSchema };

module.exports = {
  Drinks,
  schemasDrinks,
};
// { _id: false, versionKey: false, timestamps: true }
