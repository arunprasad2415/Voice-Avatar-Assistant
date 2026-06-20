const mongoose = require("mongoose");

const voiceResponseSchema = new mongoose.Schema(
  {
    trigger: {
      type: String,
      required: [true, "Trigger is required"],
      trim: true,
      lowercase: true,
      index: true,
    },
    response: {
      type: String,
      required: [true, "Response is required"],
      trim: true,
    },
    type: {
      type: String,
      enum: ["greeting", "fallback", "custom"],
      default: "custom",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const VoiceResponse = mongoose.model("VoiceResponse", voiceResponseSchema);

module.exports = VoiceResponse;