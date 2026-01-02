const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const Admin = require("../models/admin");
const AuditLog = require("../models/auditlog");

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "8h",
  });
};

/**
 * @desc    Register a new admin
 * @route   POST /api/admin/register
 * @access  Private (or script-based for initial setup)
 */
// const registerAdmin = asyncHandler(async (req, res) => {
//   const { username, password } = req.body;

//   if (!username || !password) {
//     res.status(400);
//     throw new Error("Please add all fields");
//   }

//   const adminExists = await Admin.findOne({ username });

//   if (adminExists) {
//     res.status(400);
//     throw new Error("Admin already exists");
//   }

//   const admin = await Admin.create({
//     username,
//     password,
//   });

//   if (admin) {
//     res.status(201).json({
//       _id: admin.id,
//       username: admin.username,
//       token: generateToken(admin._id),
//     });
//   } else {
//     res.status(400);
//     throw new Error("Invalid admin data");
//   }
// });
const registerAdmin = asyncHandler(async (req, res) => {
  const { username, password } = req.body; 

  const exists = await Admin.findOne({ username });
  if (exists) {
    res.status(400);
    throw new Error("Username already exists");
  }

  const admin = new Admin({
    username,
    password,
    isAdmin: false,
  });

  await admin.save();

  
  if (admin) {
    res.status(201).json({
    _id: admin._id,
    username: admin.username,
    isAdmin: admin.isAdmin,
    token: generateToken(admin._id),
  });
  } else {
    res.status(400);
    throw new Error("Invalid admin data");
  }
});

/**
 * @desc    Authenticate an admin
 * @route   POST /api/admin/login
 * @access  Public
 */

const loginAdmin = asyncHandler(async (req, res) => {
  const { username, password } = req.body;

  // include password and isAdmin in the returned document
  const admin = await Admin.findOne({ username }).select("+password +isAdmin");

  if (!admin || !(await admin.matchPassword(password))) {
    res.status(401);
    throw new Error("Invalid username or password");
  }

  if (!admin.isAdmin) {
    res.status(403);
    throw new Error("Forbidden: admin access required");
  }

  res.json({
    _id: admin._id,
    username: admin.username,
    isAdmin: admin.isAdmin,
    token: generateToken(admin._id),
  });
});

/**
 * @desc    Get all audit logs
 * @route   GET /api/admin/audit-logs
 * @access  Private (Admin only)
 */
const getAuditLogs = asyncHandler(async (req, res) => {
  const logs = await AuditLog.find()
    .populate("adminId", "username")
    .populate("submissionId", "receiptCode")
    .sort({ createdAt: -1 });
  res.status(200).json(logs);
});

module.exports = {
  registerAdmin,
  loginAdmin,
  getAuditLogs,
};


