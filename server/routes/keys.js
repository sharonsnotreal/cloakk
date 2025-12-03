const express = require('express');
const router = express.Router();
const keysModel = require('../models/keysModel');

// Register or update public keys for an identity.
// Body: { id: string, signingPublicKeyBase64?: string, encryptionPublicKeyBase64?: string }
router.post('/register', async (req, res) => {
  const { id, signingPublicKeyBase64, encryptionPublicKeyBase64 } = req.body;
  if (!id) return res.status(400).json({ error: 'id required' });
  if (!signingPublicKeyBase64 && !encryptionPublicKeyBase64) return res.status(400).json({ error: 'at least one public key required' });
  try {
    const doc = await keysModel.saveKey(id, signingPublicKeyBase64, encryptionPublicKeyBase64);
    res.json({ ok: true, id: doc.id });
  } catch (err) {
    console.error('Key register error', err);
    res.status(500).json({ error: 'internal_error' });
  }
});

// Get public keys for an id (returns both signing and encryption public keys)
router.get('/:id', async (req, res) => {
  const id = req.params.id;
  try {
    const keys = await keysModel.getKey(id);
    if (!keys) return res.status(404).json({ error: 'not_found' });
    res.json({ id, ...keys });
  } catch (err) {
    console.error('Key fetch error', err);
    res.status(500).json({ error: 'internal_error' });
  }
});

module.exports = router;