const express = require("express");
const router = express.Router();
const {
  registerAdmin,
  loginAdmin,
  getAuditLogs,
} = require("../controller/adminController");
const { protect } = require("../middleware/authMiddleware");
// const bcrypt = require("bcrypt");
// import pbkdf2 from "pbkdf2";
const auth = require("../middleware/auth");

// const { User, validate, generateToken } = require("../models/admin");

router.post("/register", registerAdmin); // Should be protected or used in a setup script
router.post("/login", loginAdmin);
router.get("/audit-logs", protect, getAuditLogs);

// router.get("/auth", [auth], async (req, res) => {
//   const { auth } = req;

//   const user = await User.findOne({ auth });
//   if (!user) return res.status(404).send("User not found");

//   res.send(user);
// });

// router.post("/register", async (req, res) => {
//   const { error } = validate(req.body);
//   if (error) return res.status(400).send(error);

//   let { username, auth } = req.body;

//   const salt = bcrypt.genSaltSync(10000);
//   auth = pbkdf2.pbkdf2Sync(auth, salt, 50000, 64, "sha512").toString("hex");

//   let user = new User({ username, auth, salt });
//   user = await user.save();

//   res.status(201).send(user);
// });

// Login / Authentication
// router.post("/login", async (req, res) => {
//   let { username, auth } = req.body;

//   const user = await User.findOne({ username });
//   if (!user) return res.status(404).send("Wrong credentials");

//   const { salt, auth: _auth } = user;
//   auth = pbkdf2.pbkdf2Sync(auth, salt, 50000, 64, "sha512").toString("hex");

//   if (auth !== _auth) return res.status(404).send("Wrong credentials");

//   const userToken = generateToken(auth);

//   res.send({ userToken, user });
// });


// router.put("/:_id", async (req, res) => {
//   const { _id } = req.params;

//   if (_id === "undefined") return res.status(400).send("Invalid Parameters");

//   let user = await User.findByIdAndUpdate(
//     _id,
//     { $set: req.body },
//     { useFindAndModify: false, new: true }
//   );
//   if (!user) return res.status(404).send("User was not found.");

//   user = await user.save();
//   res.send(user);
// });
module.exports = router;
