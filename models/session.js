const { Schema, model } = require("mongoose");

const sessionSchema = new Schema(
  {
    uid: {
      type: String,
      ref: "User",
    },
  },
  { versionKey: false, timestamps: true }
);

const sessionModel = model("sessionModel", sessionSchema);

module.exports = { sessionModel };
