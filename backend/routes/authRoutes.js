const express = require("express");
const router = express.Router();
const { registerAdmin, loginAdmin, getProfile } = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");
const rateLimit = require("../middleware/rateLimit");
const Admin = require("../models/Admin");

// Anyone may create the first admin; after that only a logged-in admin can add more.
const allowFirstAdmin = async (req, res, next) => {
  try {
    if (await Admin.exists({})) {
      return protect(req, res, next);
    }
    next();
  } catch (error) {
    next(error);
  }
};

const loginLimit = rateLimit({ windowMs: 15 * 60 * 1000, max: 10 });

router.post("/register", allowFirstAdmin, registerAdmin);
router.post("/login", loginLimit, loginAdmin);
router.get("/profile", protect, getProfile);

module.exports = router;
