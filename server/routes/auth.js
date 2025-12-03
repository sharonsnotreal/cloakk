const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');

const JWT_SECRET = process.env.JWT_SECRET || 'change-me-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// Register normal user (role=user)
// Body: { username, password }
router.post('/register', async (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) return res.status(400).json({ error: 'username_and_password_required' });
  try {
    const user = await userModel.createUser(username, password, 'user');
    res.json({ ok: true, user });
  } catch (err) {
    if (err.message === 'user_exists') return res.status(409).json({ error: 'user_exists' });
    console.error('user register error', err);
    res.status(500).json({ error: 'internal_error' });
  }
});

// Login (for users and admins)
// Body: { username, password }
// Returns { token, user: { username, role } }
router.post('/login', async (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) return res.status(400).json({ error: 'username_and_password_required' });

  try {
    const user = await userModel.verifyCredentials(username, password);
    if (!user) return res.status(401).json({ error: 'invalid_credentials' });

    const payload = { id: user.username, role: user.role };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    res.json({ ok: true, token, user: { username: user.username, role: user.role } });
  } catch (err) {
    console.error('login error', err);
    res.status(500).json({ error: 'internal_error' });
  }
});

module.exports = router;