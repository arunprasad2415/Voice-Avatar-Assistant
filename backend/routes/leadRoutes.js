const express = require("express");
const router = express.Router();
const {
  createLead,
  getLeads,
  getLeadById,
  updateLead,
  deleteLead,
  exportLeadsCSV,
  exportLeadsExcel,
} = require("../controllers/leadController");
const { protect } = require("../middleware/authMiddleware");

router.post("/", createLead);

router.get("/export/csv", protect, exportLeadsCSV);
router.get("/export/excel", protect, exportLeadsExcel);

router.get("/", protect, getLeads);
router.get("/:id", protect, getLeadById);
router.put("/:id", protect, updateLead);
router.delete("/:id", protect, deleteLead);

module.exports = router;