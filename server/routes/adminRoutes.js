const express = require("express");
const router = express.Router();
const {
  registerAdmin,
  loginAdmin,
  getAuditLogs,
} = require("../controller/adminController");
const { protect } = require("../middleware/authMiddleware");


router.post("/register", registerAdmin); 
router.post("/login", loginAdmin);
router.get("/audit-logs", protect, getAuditLogs);

module.exports = router;
