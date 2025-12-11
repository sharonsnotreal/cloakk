const express = require("express");
const router = express.Router();
const {
  registerAdmin,
  loginAdmin,
  getAuditLogs,
} = require("../controller/adminController");
const { protect } = require("../middleware/authMiddleware");


router.post("/register", registerAdmin); // Should be protected or used in a setup script
router.post("/login", loginAdmin);
router.get("/audit-logs", protect, getAuditLogs);

module.exports = router;
