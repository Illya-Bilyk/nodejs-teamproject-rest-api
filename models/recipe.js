const { Schema, model } = require("mongoose");
const { handleMongooseError } = require("../utils");
const Joi = require("joi");

const recipeSchema = new Schema(
  {
    drink: {
      type: String,
      required: [true, "Set name for drink"],
      minlength: 2,
      maxlength: 100,
    },
    drinkAlternate: {
      type: String,
      default: "Sorry, not specified",
      minlength: 2,
      maxlength: 100,
    },
    tags: {
      type: String,
      minlength: 2,
      maxlength: 254,
    },
    video: { type: String },
    category: {
      type: String,
      required: [true, "Choose category for a drink"],
      minlength: 2,
      maxlength: 100,
    },
    IBA: { type: String },
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
    instructionsES: {
      type: String,
      required: true,
      minlength: 2,
      maxlength: 500,
    },
    instructionsDE: {
      type: String,
      required: true,
      minlength: 2,
      maxlength: 500,
    },
    instructionsFR: {
      type: String,
      required: true,
      minlength: 2,
      maxlength: 500,
    },
    instructionsIT: {
      type: String,
      required: true,
      minlength: 2,
      maxlength: 500,
    },
    instructionsRU: {
      type: String,
      required: true,
      minlength: 2,
      maxlength: 500,
    },
    instructionsPL: {
      type: String,
      required: true,
      minlength: 2,
      maxlength: 500,
    },
    instructionsUK: {
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
        quantity: {
          type: String,
          required: true,
          minlength: 2,
          maxlength: 100,
        },
        ingredientId: {
          type: Schema.Types.ObjectId,
          ref: "ingredients",
        },
      },
    ],
    shortDescription: {
      type: String,
      required: true,
      minlength: 2,
      maxlength: 500,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "user",
    },
    users: [
      {
        type: Schema.Types.ObjectId,
        ref: "user",
      },
    ],
  },
  { versionKey: false, timestamps: true }
);

recipeSchema.post("save", handleMongooseError);

const addRecipesSchema = Joi.object({
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

const Recipe = model("recipe", recipeSchema);

const schemasRecipe = { addRecipesSchema };

module.exports = {
  Recipe,
  schemasRecipe,
};
