const express = require('express');
const router = express.Router();
const multer = require('multer');
const verifySignature = require('../middleware/verifySignature');
const requireAuth = require('../middleware/auth');
const messagesModel = require('../models/messageModel');

const storage = multer.memoryStorage();
const upload = multer({ storage });
const generateReceiptCode = () => {
  const code = uuidv4().split("-").join("").substring(0, 12).toUpperCase();
  return `CLOAKK-${code.slice(0, 4)}-${code.slice(4, 8)}-${code.slice(8, 12)}`;
};
// POST /api/messages/send
// Requires Authorization: Bearer <token> and signature header x-signature
// The authenticated user becomes the sender (req.user.id)
router.post('/send', requireAuth, upload.array("files", 5), verifySignature, async (req, res) => {
  try {
    const sender = req.user.id;
    if (!sender) return res.status(400).json({ error: 'missing_sender_identity' });

    const signatureBase64 = req.headers['x-signature'] || null;
    const commonMeta = req.body.meta ? JSON.parse(req.body.meta) : {};
    if (signatureBase64) commonMeta.signatureBase64 = signatureBase64;

    // Single receiptCode for whole upload
    const batchReceiptCode = generateReceiptCode();

    // Handle multiple file uploads if present
    if (req.files && req.files.length > 0) {
      const recipient = req.body.recipient || null;
      const results = [];

      for (const file of req.files) {
        const messageRecord = {
          sender,
          recipient,
          receiptCode: batchReceiptCode,        // same code for all files
          timestamp: Date.now(),
          type: 'file',
          storageRef: null,
          meta: { ...commonMeta },
          ciphertextSize: file.size
        };

        const fileId = await messagesModel.storeFile(file.buffer, file.originalname, file.mimetype || 'application/octet-stream');
        messageRecord.storageRef = fileId;

        const saved = await messagesModel.saveMessage(messageRecord);
        results.push({ messageId: saved.uuid, storageRef: fileId });
      }

      return res.json({ ok: true, receiptCode: batchReceiptCode, results });
    }

    // Fallback: inline ciphertext message (single receipt code still used)
    const { recipient, ciphertextBase64 } = req.body;
    if (!recipient || !ciphertextBase64) return res.status(400).json({ error: 'recipient and ciphertextBase64 required' });

    const inlineRef = await messagesModel.storeInlineCiphertext(ciphertextBase64);
    const inlineRecord = {
      sender,
      recipient,
      receiptCode: batchReceiptCode,
      timestamp: Date.now(),
      type: 'inline',
      storageRef: inlineRef,
      meta: { ...commonMeta },
      ciphertextSize: Buffer.byteLength(ciphertextBase64, 'utf8')
    };

    const savedInline = await messagesModel.saveMessage(inlineRecord);
    return res.json({ ok: true, receiptCode: batchReceiptCode, messageId: savedInline.uuid });

  } catch (err) {
    console.error('send error', err);
    res.status(500).json({ error: 'internal_error' });
  }
});

// Fetch messages metadata for recipient
// Requires Authorization; only the recipient may fetch their messages
router.get('/for/:recipient', requireAuth, async (req, res) => {
  const recipient = req.params.recipient;
  try {
    if (req.user.id !== recipient) return res.status(403).json({ error: 'forbidden' });
    const includeDeleted = req.query.includeDeleted === 'true';
    const msgs = await messagesModel.getMessagesForRecipient(recipient, includeDeleted);
    res.json(msgs);
  } catch (err) {
    console.error('fetch messages error', err);
    res.status(500).json({ error: 'internal_error' });
  }
});

// Stream a file stored in GridFS by id
// Requires Authorization; only message sender or recipient may download
router.get('/file/:id', requireAuth, async (req, res) => {
  const id = req.params.id;
  try {
    // Ensure that the requesting user is allowed to access the file
    const message = await messagesModel.findMessageByStorageRef(id);
    if (!message) return res.status(404).json({ error: 'not_found' });
    if (message.recipient !== req.user.id && message.sender !== req.user.id) return res.status(403).json({ error: 'forbidden' });
    if (message.deleted) return res.status(410).json({ error: 'message_deleted' });

    const stream = await messagesModel.openDownloadStream(id);
    stream.on('file', (file) => {
      res.setHeader('Content-Type', file.contentType || 'application/octet-stream');
      res.setHeader('Content-Disposition', `attachment; filename="${file.filename || 'file'}"`);
    });
    stream.on('error', (err) => {
      console.error('GridFS download error', err);
      return res.status(404).json({ error: 'not_found' });
    });
    stream.pipe(res);
  } catch (err) {
    console.error('file stream error', err);
    res.status(500).json({ error: 'internal_error' });
  }
});

// GET inline ciphertext by inline id
// Requires Authorization; only the recipient may fetch their inline ciphertext
router.get('/inline/:id', requireAuth, async (req, res) => {
  const id = req.params.id;
  try {
    const storageRef = `inline:${id}`;
    const message = await messagesModel.findMessageByStorageRef(storageRef);
    if (!message) return res.status(404).json({ error: 'not_found' });
    if (message.recipient !== req.user.id) return res.status(403).json({ error: 'forbidden' });
    if (message.deleted) return res.status(410).json({ error: 'message_deleted' });

    const ciphertextBase64 = await messagesModel.getInlineCiphertextByRef(storageRef);
    if (!ciphertextBase64) return res.status(404).json({ error: 'not_found' });

    res.json({ ciphertextBase64, signatureBase64: message.meta && message.meta.signatureBase64 ? message.meta.signatureBase64 : null });
  } catch (err) {
    console.error('inline fetch error', err);
    res.status(500).json({ error: 'internal_error' });
  }
});

/*
  Recycle bin and viewed/unviewed actions.
  Authorization: derived from JWT (req.user.id)
*/

// Soft-delete (move to recycle bin) by message uuid
router.post('/:id/delete', requireAuth, async (req, res) => {
  const uuid = req.params.id;
  const user = req.user.id;

  try {
    const message = await messagesModel.findMessageByUuid(uuid);
    if (!message) return res.status(404).json({ error: 'not_found' });

    if (user !== message.sender && user !== message.recipient) return res.status(403).json({ error: 'forbidden' });

    const updated = await messagesModel.markDeletedByUuid(uuid, user);
    res.json({ ok: true, message: updated });
  } catch (err) {
    console.error('delete error', err);
    res.status(500).json({ error: 'internal_error' });
  }
});

// Restore from recycle by uuid
router.post('/:id/restore', requireAuth, async (req, res) => {
  const uuid = req.params.id;
  const user = req.user.id;

  try {
    const message = await messagesModel.findMessageByUuid(uuid);
    if (!message) return res.status(404).json({ error: 'not_found' });
    if (user !== message.sender && user !== message.recipient) return res.status(403).json({ error: 'forbidden' });

    const restored = await messagesModel.restoreByUuid(uuid, user);
    res.json({ ok: true, message: restored });
  } catch (err) {
    console.error('restore error', err);
    res.status(500).json({ error: 'internal_error' });
  }
});

// Permanently delete (hard delete) by uuid
router.delete('/:id', requireAuth, async (req, res) => {
  const uuid = req.params.id;
  const user = req.user.id;

  try {
    const message = await messagesModel.findMessageByUuid(uuid);
    if (!message) return res.status(404).json({ error: 'not_found' });
    if (user !== message.sender && user !== message.recipient) return res.status(403).json({ error: 'forbidden' });

    const removed = await messagesModel.hardDeleteByUuid(uuid);
    res.json({ ok: true, removed });
  } catch (err) {
    console.error('hard delete error', err);
    res.status(500).json({ error: 'internal_error' });
  }
});

// Mark message as viewed (recipient only)
router.post('/:id/view', requireAuth, async (req, res) => {
  const uuid = req.params.id;
  const user = req.user.id;

  try {
    const message = await messagesModel.findMessageByUuid(uuid);
    if (!message) return res.status(404).json({ error: 'not_found' });
    if (user !== message.recipient) return res.status(403).json({ error: 'forbidden' });

    const updated = await messagesModel.markViewedByUuid(uuid, user);
    res.json({ ok: true, message: updated });
  } catch (err) {
    console.error('mark view error', err);
    res.status(500).json({ error: 'internal_error' });
  }
});

// Mark as unviewed (recipient only)
router.post('/:id/unview', requireAuth, async (req, res) => {
  const uuid = req.params.id;
  const user = req.user.id;

  try {
    const message = await messagesModel.findMessageByUuid(uuid);
    if (!message) return res.status(404).json({ error: 'not_found' });
    if (user !== message.recipient) return res.status(403).json({ error: 'forbidden' });

    const updated = await messagesModel.markUnviewedByUuid(uuid, user);
    res.json({ ok: true, message: updated });
  } catch (err) {
    console.error('mark unview error', err);
    res.status(500).json({ error: 'internal_error' });
  }
});

// List recycle bin items for recipient (only deleted messages)
router.get('/recycle/:recipient', requireAuth, async (req, res) => {
  const recipient = req.params.recipient;
  const user = req.user.id;
  if (user !== recipient) return res.status(403).json({ error: 'forbidden' });

  try {
    const msgs = await messagesModel.getMessagesForRecipient(recipient, true);
    const deleted = msgs.filter(m => m.deleted);
    res.json(deleted);
  } catch (err) {
    console.error('recycle list error', err);
    res.status(500).json({ error: 'internal_error' });
  }
});

module.exports = router;