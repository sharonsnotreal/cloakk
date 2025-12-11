const express = require("express");
const dotenv = require("dotenv");
const helmet = require("helmet");
const cors = require("cors");
const connectDB = require("./db/config");
const rateLimit = require("express-rate-limit");
const path = require("path");
// const mongoSanitize = require("express-mongo-sanitize");
const mongoSanitize = require("@exortek/express-mongo-sanitize");
dotenv.config();
connectDB();

const app = express();
// // Basic rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
});
// app.use(limiter);
// app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
// using mongo-sanitize middlware to prevent NoSQL Injection
app.use(mongoSanitize());
// API Routes
app.get("/health", (req, res) => res.status(200).send("OK"));
// Serve uploaded files
app.use("/api/submissions", require("./routes/submissionRoutes"));
app.use("/uploads", express.static(path.resolve(__dirname, "uploads")));

app.use("/api/admin", require("./routes/adminRoutes"));

// app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Listening on ${PORT}`));





