const express = require("express");
const router = express.Router();
const {
  handleVoiceQuery,
  transcribeVoice,
  createVoiceResponse,
  getVoiceResponses,
  updateVoiceResponse,
  deleteVoiceResponse,
} = require("../controllers/voiceController");
const { protect } = require("../middleware/authMiddleware");
const rateLimit = require("../middleware/rateLimit");

router.post("/query", rateLimit({ windowMs: 60 * 1000, max: 20 }), handleVoiceQuery);
router.post("/transcribe", rateLimit({ windowMs: 60 * 1000, max: 20 }), transcribeVoice);

router.get("/", protect, getVoiceResponses);
router.post("/", protect, createVoiceResponse);
router.put("/:id", protect, updateVoiceResponse);
router.delete("/:id", protect, deleteVoiceResponse);

module.exports = router;