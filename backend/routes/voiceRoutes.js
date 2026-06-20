const express = require("express");
const router = express.Router();
const {
  handleVoiceQuery,
  createVoiceResponse,
  getVoiceResponses,
  updateVoiceResponse,
  deleteVoiceResponse,
} = require("../controllers/voiceController");
const { protect } = require("../middleware/authMiddleware");

router.post("/query", handleVoiceQuery);

router.get("/", protect, getVoiceResponses);
router.post("/", protect, createVoiceResponse);
router.put("/:id", protect, updateVoiceResponse);
router.delete("/:id", protect, deleteVoiceResponse);

module.exports = router;