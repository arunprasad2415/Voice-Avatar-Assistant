const express = require("express");
const router = express.Router();
const { registerAdmin, loginAdmin, getProfile } = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

router.post("/register", registerAdmin);
router.post("/login", loginAdmin);
router.get("/profile", protect, getProfile);

module.exports = router;