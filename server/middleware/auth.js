const jwt = require('jsonwebtoken');

// const JWT_SECRET = process.env.JWT_SECRET || 'change-me-in-production';

// // Middleware to require a valid JWT in Authorization: Bearer <token>
// // Sets req.user to the decoded token payload.
// // Token payload must contain an identifier field (e.g. { id: '<user-id>' }).
module.exports = function requireAuth(req, res, next) {
  const auth = req.headers.authorization || '';
  if (!auth.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'missing_authorization' });
  }
  const token = auth.slice(7).trim();
  if (!token) return res.status(401).json({ error: 'missing_token' });

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    // Expect payload to include an id property (user id)
    if (!payload || (!payload.id && !payload.sub)) {
      return res.status(401).json({ error: 'invalid_token_payload' });
    }
    // Normalize user id into req.user.id
    req.user = {
      id: payload.id || payload.sub,
      ...payload
    };
    next();
  } catch (err) {
    console.error('JWT verification failed', err);
    return res.status(401).json({ error: 'invalid_token' });
  }
};

// const jwt = require("jsonwebtoken");
// const config = require("config");

// const auth = (req, res, next) => {
//   const token = req.header("x-auth-token");

//   try {
//     const { auth } = jwt.verify(token, config.get("jwtKey"));

//     req.auth = auth;
//     next();
//   } catch (ex) {
//     console.log("Invalid Token");
//     res.status(400).send("Invalid Token.");
//   }
// };

// module.exports = auth;