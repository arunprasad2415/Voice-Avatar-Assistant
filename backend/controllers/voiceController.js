const VoiceResponse = require("../models/VoiceResponse");
const FAQ = require("../models/FAQ");
const Log = require("../models/Log");
const { getAIResponse, transcribeAudio } = require("../services/speechService");
const { findBestMatch } = require("../utils/text");

const MAX_QUERY_LENGTH = 500;
const DEFAULT_FALLBACK =
  "Sorry, I didn't understand that. Could you please rephrase?";

const handleVoiceQuery = async (req, res, next) => {
  try {
    const text = typeof req.body.text === "string" ? req.body.text.trim() : "";

    if (!text) {
      return res.status(400).json({
        success: false,
        message: "Voice input text is required",
      });
    }

    if (text.length > MAX_QUERY_LENGTH) {
      return res.status(400).json({
        success: false,
        message: `Please keep your message under ${MAX_QUERY_LENGTH} characters`,
      });
    }

    const respond = async (source, reply, matched = true) => {
      await Log.create({ type: source, userInput: text, response: reply, matched });
      return res.status(200).json({ success: true, matched, source, data: { reply } });
    };

    // ponytail: loads every active entry per query; fine for hundreds, move to a text index at thousands
    const [voiceResponses, faqs] = await Promise.all([
      VoiceResponse.find({ isActive: true }).lean(),
      FAQ.find({ isActive: true }).lean(),
    ]);

    const voiceMatch = findBestMatch(
      text,
      voiceResponses.filter((v) => v.type !== "fallback"),
      (v) => [v.trigger]
    );
    if (voiceMatch) {
      return respond("voice", voiceMatch.response);
    }

    const faqMatch = findBestMatch(text, faqs, (f) => [f.question, ...f.keywords]);
    if (faqMatch) {
      return respond("faq", faqMatch.answer);
    }

    const aiReply = await getAIResponse(text);
    if (aiReply) {
      return respond("ai", aiReply);
    }

    const fallback = voiceResponses.find((v) => v.type === "fallback");
    return respond("fallback", fallback ? fallback.response : DEFAULT_FALLBACK, false);
  } catch (error) {
    next(error);
  }
};

// ~20s of compressed speech is well under this; base64 inflates size by a third.
const MAX_AUDIO_BASE64_LENGTH = 3 * 1024 * 1024;

const transcribeVoice = async (req, res) => {
  const { audio, mimeType } = req.body;
  const baseMimeType = typeof mimeType === "string" ? mimeType.split(";")[0].trim() : "";

  if (typeof audio !== "string" || !audio || !/^audio\/[\w.+-]+$/.test(baseMimeType)) {
    return res.status(400).json({
      success: false,
      message: "Audio and an audio mimeType are required",
    });
  }

  if (audio.length > MAX_AUDIO_BASE64_LENGTH) {
    return res.status(400).json({
      success: false,
      message: "Recording is too long. Please keep it under 20 seconds.",
    });
  }

  try {
    const text = await transcribeAudio(audio, baseMimeType);
    return res.status(200).json({ success: true, data: { text } });
  } catch (error) {
    console.error(`Transcription failed: ${error.message}`);
    return res.status(503).json({
      success: false,
      message: "Voice transcription is unavailable right now. Please type your question.",
    });
  }
};

const createVoiceResponse = async (req, res, next) => {
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
    next(error);
  }
};

const getVoiceResponses = async (req, res, next) => {
  try {
    const voiceResponses = await VoiceResponse.find().sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: voiceResponses.length,
      data: voiceResponses,
    });
  } catch (error) {
    next(error);
  }
};

const updateVoiceResponse = async (req, res, next) => {
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
    next(error);
  }
};

const deleteVoiceResponse = async (req, res, next) => {
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
    next(error);
  }
};

module.exports = {
  handleVoiceQuery,
  transcribeVoice,
  createVoiceResponse,
  getVoiceResponses,
  updateVoiceResponse,
  deleteVoiceResponse,
};