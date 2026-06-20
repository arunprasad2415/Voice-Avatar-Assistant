const VoiceResponse = require("../models/VoiceResponse");
const FAQ = require("../models/FAQ");
const Log = require("../models/Log");
const { getAIResponse } = require("../services/speechService");

const handleVoiceQuery = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || text.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Voice input text is required",
      });
    }

    const query = text.trim().toLowerCase();

    const voiceMatch = await VoiceResponse.findOne({
      isActive: true,
      trigger: { $regex: query, $options: "i" },
    });

    if (voiceMatch) {
      await Log.create({
        type: "voice",
        userInput: text,
        response: voiceMatch.response,
        matched: true,
      });

      return res.status(200).json({
        success: true,
        matched: true,
        source: "voice",
        data: { reply: voiceMatch.response },
      });
    }

    const faqMatch = await FAQ.findOne({
      isActive: true,
      $or: [
        { question: { $regex: query, $options: "i" } },
        { keywords: { $regex: query, $options: "i" } },
      ],
    });

    if (faqMatch) {
      await Log.create({
        type: "faq",
        userInput: text,
        response: faqMatch.answer,
        matched: true,
      });

      return res.status(200).json({
        success: true,
        matched: true,
        source: "faq",
        data: { reply: faqMatch.answer },
      });
    }

    const aiReply = await getAIResponse(text);

    if (aiReply) {
      await Log.create({
        type: "voice",
        userInput: text,
        response: aiReply,
        matched: true,
      });

      return res.status(200).json({
        success: true,
        matched: true,
        source: "ai",
        data: { reply: aiReply },
      });
    }

    const fallbackReply =
      "Sorry, I didn't understand that. Could you please rephrase?";

    await Log.create({
      type: "voice",
      userInput: text,
      response: fallbackReply,
      matched: false,
    });

    return res.status(200).json({
      success: true,
      matched: false,
      source: "fallback",
      data: { reply: fallbackReply },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const createVoiceResponse = async (req, res) => {
  try {
    const { trigger, response, type } = req.body;

    if (!trigger || !response) {
      return res.status(400).json({
        success: false,
        message: "Trigger and response are required",
      });
    }

    const voiceResponse = await VoiceResponse.create({ trigger, response, type });

    return res.status(201).json({
      success: true,
      message: "Voice response created successfully",
      data: voiceResponse,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getVoiceResponses = async (req, res) => {
  try {
    const voiceResponses = await VoiceResponse.find().sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: voiceResponses.length,
      data: voiceResponses,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const updateVoiceResponse = async (req, res) => {
  try {
    const voiceResponse = await VoiceResponse.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!voiceResponse) {
      return res.status(404).json({
        success: false,
        message: "Voice response not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Voice response updated successfully",
      data: voiceResponse,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const deleteVoiceResponse = async (req, res) => {
  try {
    const voiceResponse = await VoiceResponse.findByIdAndDelete(req.params.id);

    if (!voiceResponse) {
      return res.status(404).json({
        success: false,
        message: "Voice response not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Voice response deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  handleVoiceQuery,
  createVoiceResponse,
  getVoiceResponses,
  updateVoiceResponse,
  deleteVoiceResponse,
};