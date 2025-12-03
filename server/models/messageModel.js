const { connect, getBucket, mongoose } = require('../db/mongo');
const { Readable } = require('stream');
const { v4: uuidv4 } = require('uuid');

const MessageSchema = new mongoose.Schema({
  uuid: { type: String, required: true, unique: true, index: true },
  sender: { type: String, required: true, index: true },
  recipient: { type: String, required: true, index: true },
  timestamp: { type: Number, required: true },
  type: { type: String, enum: ['inline', 'file'], required: true },
  storageRef: { type: String, required: true }, // For inline: inline:<id>; for file: GridFS file id string
  meta: { type: mongoose.Schema.Types.Mixed, default: {} },
  ciphertextSize: { type: Number }, // optional size in bytes

  // Soft-delete / recycle bin fields
  deleted: { type: Boolean, default: false, index: true },
  deletedAt: { type: Number, default: null },
  deletedBy: { type: String, default: null },

  // Viewed/unviewed tracking
  viewed: { type: Boolean, default: false, index: true },
  viewedAt: { type: Number, default: null },
  viewedBy: { type: String, default: null }
}, { timestamps: true });

const Message = mongoose.models.Message || mongoose.model('Message', MessageSchema);

module.exports = {
  async init() { await connect(); },

  async storeInlineCiphertext(ciphertextBase64) {
    await connect();
    const id = uuidv4();
    const InlineSchema = new mongoose.Schema({
      id: { type: String, required: true, unique: true },
      ciphertextBase64: { type: String, required: true }
    }, { timestamps: true });
    const Inline = mongoose.models.Inline || mongoose.model('Inline', InlineSchema);
    await Inline.create({ id, ciphertextBase64 });
    return `inline:${id}`;
  },

  async storeFile(buffer, filename, contentType) {
    await connect();
    const bucket = getBucket();
    return await new Promise((resolve, reject) => {
      const uploadStream = bucket.openUploadStream(filename, {
        contentType
      });
      const readable = Readable.from(buffer);
      readable.pipe(uploadStream)
        .on('error', err => reject(err))
        .on('finish', fileDoc => resolve(fileDoc._id.toString()));
    });
  },

  async saveMessage(messageRecord) {
    await connect();
    const uuid = uuidv4();
    const doc = await Message.create({
      uuid,
      sender: messageRecord.sender,
      recipient: messageRecord.recipient,
      timestamp: messageRecord.timestamp || Date.now(),
      receiptCode: messageRecord.receiptCode || null,
      type: messageRecord.type,
      storageRef: messageRecord.storageRef,
      meta: messageRecord.meta || {},
      ciphertextSize: messageRecord.ciphertextSize
    });
    return doc;
  },

  // Get messages for recipient. By default exclude deleted messages; set includeDeleted=true to include them
  async getMessagesForRecipient(recipient, includeDeleted = false) {
    await connect();
    const query = { recipient };
    if (!includeDeleted) query.deleted = { $ne: true };
    const docs = await Message.find(query).sort({ createdAt: -1 }).lean();
    return docs;
  },

  async getInlineCiphertextByRef(inlineRef) {
    await connect();
    if (!inlineRef || !inlineRef.startsWith('inline:')) return null;
    const id = inlineRef.split(':', 2)[1];
    const Inline = mongoose.models.Inline;
    if (!Inline) return null;
    const doc = await Inline.findOne({ id }).lean();
    return doc ? doc.ciphertextBase64 : null;
  },

  async openDownloadStream(fileId) {
    await connect();
    const bucket = getBucket();
    return bucket.openDownloadStream(new mongoose.Types.ObjectId(fileId));
  },

  async findMessageByStorageRef(storageRef) {
    await connect();
    return await Message.findOne({ storageRef }).lean();
  },

  // Find by uuid (message id)
  async findMessageByUuid(uuid) {
    await connect();
    return await Message.findOne({ uuid }).lean();
  },

  // Soft-delete: mark deleted, set deletedAt and deletedBy
  async markDeletedByUuid(uuid, userId) {
    await connect();
    const now = Date.now();
    const doc = await Message.findOneAndUpdate({ uuid }, {
      $set: { deleted: true, deletedAt: now, deletedBy: userId }
    }, { new: true }).lean();
    return doc;
  },

  // Restore a soft-deleted message
  async restoreByUuid(uuid, userId) {
    await connect();
    const doc = await Message.findOneAndUpdate({ uuid }, {
      $set: { deleted: false, deletedAt: null, deletedBy: null }
    }, { new: true }).lean();
    return doc;
  },

  // Hard delete: remove message doc and if file type remove GridFS file and inline doc if inline type
  async hardDeleteByUuid(uuid) {
    await connect();
    const message = await Message.findOne({ uuid }).lean();
    if (!message) return null;

    // Remove associated payload
    if (message.type === 'file') {
      try {
        const bucket = getBucket();
        const objectId = new mongoose.Types.ObjectId(message.storageRef);
        await bucket.delete(objectId);
      } catch (err) {
        // log and continue - might already be deleted or invalid
        console.warn('GridFS delete error', err);
      }
    } else if (message.type === 'inline' && message.storageRef && message.storageRef.startsWith('inline:')) {
      const id = message.storageRef.split(':', 2)[1];
      const Inline = mongoose.models.Inline;
      if (Inline) {
        await Inline.deleteOne({ id }).catch(() => {});
      }
    }

    // Remove the message doc
    await Message.deleteOne({ uuid });
    return message;
  },

  // Mark viewed by recipient
  async markViewedByUuid(uuid, userId) {
    await connect();
    const now = Date.now();
    const doc = await Message.findOneAndUpdate({ uuid }, {
      $set: { viewed: true, viewedAt: now, viewedBy: userId }
    }, { new: true }).lean();
    return doc;
  },

  // Mark unviewed (reset viewed flags)
  async markUnviewedByUuid(uuid, userId) {
    await connect();
    const doc = await Message.findOneAndUpdate({ uuid }, {
      $set: { viewed: false, viewedAt: null, viewedBy: null }
    }, { new: true }).lean();
    return doc;
  }
};