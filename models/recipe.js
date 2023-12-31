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
      unique: true,
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
      enum: [
        "Beer",
        "Cocktail",
        "Cocoa",
        "Coffee / Tea",
        "Homemade Liqueur",
        "Ordinary Drink",
        "Other/Unknown",
        "Punch / Party Drink",
        "Shake",
        "Shot",
        "Soft Drink",
      ],
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
      enum: [
        "Balloon Glass",
        "Beer Glass",
        "Beer mug",
        "Beer pilsner",
        "Brandy snifter",
        "Champagne Flute",
        "Champagne flute",
        "Cocktail Glass",
        "Cocktail glass",
        "Coffee Mug",
        "Coffee mug",
        "Collins Glass",
        "Collins glass",
        "Copper Mug",
        "Cordial glass",
        "Coupe Glass",
        "Highball Glass",
        "Highball glass",
        "Hurricane glass",
        "Irish coffee cup",
        "Jar",
        "Margarita glass",
        "Margarita/Coupette glass",
        "Martini Glass",
        "Mason jar",
        "Nick and Nora Glass",
        "Old-Fashioned glass",
        "Old-fashioned glass",
        "Pint glass",
        "Pitcher",
        "Pousse cafe glass",
        "Punch Bowl",
        "Punch bowl",
        "Shot Glass",
        "Shot glass",
        "Whiskey Glass",
        "Whiskey sour glass",
        "White wine glass",
        "Wine Glass",
      ],
    },
    description: {
      type: String,
      required: true,
      minlength: 2,
      maxlength: 1000,
    },
    instructions: {
      type: String,
      required: true,
      minlength: 2,
      maxlength: 2000,
    },
    instructionsES: {
      type: String,
      minlength: 2,
      maxlength: 500,
    },
    instructionsDE: {
      type: String,
      minlength: 2,
      maxlength: 500,
    },
    instructionsFR: {
      type: String,
      minlength: 2,
      maxlength: 500,
    },
    instructionsIT: {
      type: String,
      minlength: 2,
      maxlength: 500,
    },
    instructionsRU: {
      type: String,
      minlength: 2,
      maxlength: 500,
    },
    instructionsPL: {
      type: String,
      minlength: 2,
      maxlength: 500,
    },
    instructionsUK: {
      type: String,
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
          minlength: 2,
          maxlength: 100,
        },
        ingredientId: {
          type: Schema.Types.ObjectId,
          ref: "ingredients",
        },
      },
    ],
    owner: {
      type: Schema.Types.ObjectId,
      ref: "user",
    },
    users: [{ type: Schema.Types.ObjectId, ref: "user" }],
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
  category: Joi.string().required().messages({
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
  description: Joi.string().min(2).max(1000).required().messages({
    "any.required": `missing required name field`,
    "string.empty": `"name" cannot be empty, min 2 max 500 letters`,
    "string.base": `"name" must be string`,
  }),
  instructions: Joi.string().min(2).max(2000).required().messages({
    "any.required": `missing required name field`,
    "string.empty": `"name" cannot be empty, min 2 max 500 letters`,
    "string.base": `"name" must be string`,
  }),
  drinkThumb: Joi.string().required().messages({
    "any.required": `missing required name field`,
  }),
  ingredients: Joi.array().items({
    title: Joi.string().min(2).max(100).required(),
    measure: Joi.string().min(2).max(100).required(),
    ingredientId: Joi.string(),    
  }),
});

const Recipe = model("recipe", recipeSchema);

const schemasRecipe = { addRecipesSchema };

module.exports = {
  Recipe,
  schemasRecipe,
};
