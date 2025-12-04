const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./db/config");
const path = require("path");
// const mongoSanitize = require("express-mongo-sanitize");
const mongoSanitize = require("@exortek/express-mongo-sanitize");
dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
// using mongo-sanitize middlware to prevent NoSQL Injection
app.use(mongoSanitize());
// API Routes
app.get("/health", (req, res) => res.status(200).send("OK"));

app.use("/api/submissions", require("./routes/submissionRoutes"));

app.use("/api/admin", require("./routes/adminRoutes"));

// Serve uploaded files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Listening on ${PORT}`));

// const express = require('express');
// const helmet = require('helmet');
// const morgan = require('morgan');
// const rateLimit = require('express-rate-limit');
// const bodyParser = require('body-parser');
// const path = require('path');

// const keysRouter = require('./routes/keys');
// const messagesRouter = require('./routes/messages');
// const authRouter = require('./routes/auth');
// const adminRouter = require('./routes/admin');
// const app = express();

// app.use(helmet());
// app.use(morgan('tiny'));
// app.use(bodyParser.json({ limit: '10mb' })); // ciphertext may be large
// app.use(bodyParser.urlencoded({ extended: false }));

// // Basic rate limiting
// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000,
//   max: 200
// });
// app.use(limiter);

// // Expose uploads (ciphertexts) safely (readonly)
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// app.use('/api/keys', keysRouter);
// app.use('/api/messages', messagesRouter);
// app.use("/api/admin", require("./routes/adminRoutes"));

// app.use('/api/auth', authRouter);
// app.use('/api/admin', adminRouter);
// // Basic health
// app.get('/health', (req, res) => res.json({ status: 'ok' }));

// const PORT = process.env.PORT || 3000;
// if (require.main === module) {
//   app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
// }

// module.exports = app;
