const nacl = require('tweetnacl');
const util = require('tweetnacl-util');
const keysModel = require('../models/keysModel');

// Expects signature header x-signature (base64 detached signature).
// Sender identity is now taken from req.user.id (JWT) when present,
// falling back to header 'x-sender' if req.user is not set (compat).
module.exports = async function (req, res, next) {
  try {
    const senderFromJwt = req.user && req.user.id;
    const senderHeader = req.headers['x-sender'];
    const sender = senderFromJwt || senderHeader;

    const signatureBase64 = req.headers['x-signature'];

    if (!sender) {
      return res.status(400).json({ error: 'missing_sender' });
    }

    if (!signatureBase64) {
      // Signature is optional for now, but strongly recommended.
      console.warn('No signature provided for sender', sender);
      return next();
    }

    const publicKeyObj = await keysModel.getKey(sender);
    const publicKeyBase64 = publicKeyObj ? (publicKeyObj.signingPublicKeyBase64 || publicKeyObj.publicKeyBase64) : null;
    if (!publicKeyBase64) return res.status(400).json({ error: 'unknown_sender_key' });

    const publicKey = util.decodeBase64(publicKeyBase64);
    const signature = util.decodeBase64(signatureBase64);

    // Determine message bytes that were signed
    let msgBytes;
    if (req.file && req.file.buffer) {
      msgBytes = new Uint8Array(req.file.buffer);
    } else {
      const ciphertextBase64 = req.body.ciphertextBase64 || '';
      msgBytes = util.decodeUTF8(ciphertextBase64);
    }

    const verified = nacl.sign.detached.verify(msgBytes, signature, publicKey);
    if (!verified) {
      return res.status(401).json({ error: 'invalid_signature' });
    }

    // attach verifiedSender for downstream use
    req.verifiedSender = sender;
    next();
  } catch (err) {
    console.error('signature verification failed', err);
    res.status(500).json({ error: 'internal_error' });
  }
};