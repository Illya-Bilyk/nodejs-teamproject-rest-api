const { Schema, model } = require("mongoose");
const { handleMongooseError } = require("../utils");

const recipeSchema = new Schema(
  {
    drink: {
      type: String,
      required: [true, "Set name for drink"],
    },
    drinkAlternate: {
      type: String,
      default: "Sorry, not specified",
    },
    tags: String,
    video: String,
    category: {
      type: String,
      required: [true, "Choose category for a drink"],
      enum: [
        "Ordinary Drink",
        "Cocktail",
        "Shake",
        "Other/Unknown",
        "Cocoa",
        "Shot",
        "Coffee / Tea",
        "Homemade Liqueur",
        "Punch / Party Drink",
        "Beer",
        "Soft Drink",
      ],
    },
    IBA: String,
    alcoholic: {
      type: String,
      required: true,
      enum: ["Alcoholic", "Non alcoholic"],
    },
    glass: {
      type: String,
      required: [true, "Choose glass for a drink"],
      enum: [
        "Highball glass",
        "Cocktail glass",
        "Old-fashioned glass",
        "Whiskey Glass",
        "Collins glass",
        "Pousse cafe glass",
        "Champagne flute",
        "Whiskey sour glass",
        "Cordial glass",
        "Brandy snifter",
        "White wine glass",
        "Nick and Nora Glass",
        "Hurricane glass",
        "Coffee mug",
        "Shot glass",
        "Jar",
        "Irish coffee cup",
        "Punch bowl",
        "Pitcher",
        "Pint glass",
        "Copper Mug",
        "Wine Glass",
        "Beer mug",
        "Margarita/Coupette glass",
        "Beer pilsner",
        "Beer Glass",
        "Parfait glass",
        "Mason jar",
        "Margarita glass",
        "Martini Glass",
        "Balloon Glass",
        "Coupe Glass",
      ],
    },
    description: String,
    instructions: String,
    instructionsES: String,
    instructionsDE: String,
    instructionsFR: String,
    instructionsIT: String,
    instructionsRU: String,
    instructionsPL: String,
    instructionsUK: String,
    drinkThumb: String,
    ingredients: [
      {
        title: String,
        measure: String,
        quantity: String,
        ingredientId: {
          type: Schema.Types.ObjectId,
          ref: "ingredients",
        },
      },
    ],
    shortDescription: String,
    owner: {
      type: Schema.Types.ObjectId,
      ref: "user",
    },
    users: [String],
  },
  { versionKey: false, timestamps: true }
);

recipeSchema.post("save", handleMongooseError);

const Recipe = model("recipe", recipeSchema);

// exports
module.exports = {
  Recipe,
};
