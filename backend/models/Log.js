const mongoose = require("mongoose");

const logSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["voice", "faq", "lead", "error"],
      default: "voice",
    },
    userInput: {
      type: String,
      trim: true,
      default: "",
    },
    response: {
      type: String,
      trim: true,
      default: "",
    },
    matched: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Log = mongoose.model("Log", logSchema);

module.exports = Log;