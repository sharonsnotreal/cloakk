const express = require('express');
const router = express.Router();
const userModel = require('../models/userModel');
const requireAuth = require('../middleware/auth');
const requireAdmin = require('../middleware/requireAdmin');

/*
  Admin creation endpoint:
  - If there are no admins in the DB yet, allow creation without auth (bootstrap).
  - Otherwise require an existing admin token (Authorization: Bearer <token>) and admin role.
  Body: { username, password }
  Returns: created user { username, role }
*/
router.post('/create', async (req, res, next) => {
  try {
    const { username, password } = req.body || {};
    if (!username || !password) return res.status(400).json({ error: 'username_and_password_required' });

    const hasAdmin = await userModel.hasAdmin();
    if (!hasAdmin) {
      // bootstrap admin
      const created = await userModel.createUser(username, password, 'admin');
      return res.json({ ok: true, user: created, bootstrap: true });
    }

    // If admin(s) exist, require auth + admin role
    // run requireAuth and requireAdmin manually here:
    return requireAuth(req, res, async () => {
      if (!req.user) return; // requireAuth will have responded
      return requireAdmin(req, res, async () => {
        try {
          const created = await userModel.createUser(username, password, 'admin');
          res.json({ ok: true, user: created });
        } catch (err) {
          if (err.message === 'user_exists') return res.status(409).json({ error: 'user_exists' });
          console.error('admin create error', err);
          res.status(500).json({ error: 'internal_error' });
        }
      });
    });
  } catch (err) {
    console.error('admin create error', err);
    res.status(500).json({ error: 'internal_error' });
  }
});

module.exports = router;