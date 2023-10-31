const { Schema, model } = require("mongoose");


const sessionSchema = new Schema({
  uid: {
    type: String,
  },
  sid: {
    type: String,
  },
});

const sessionModel = model("sessionModel", sessionSchema);

module.exports = { sessionModel };
