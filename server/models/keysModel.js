const { connect, mongoose } = require('../db/mongo');

const KeySchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, index: true },
  signingPublicKeyBase64: { type: String },
  encryptionPublicKeyBase64: { type: String }
}, { timestamps: true });

const Key = mongoose.models.Key || mongoose.model('Key', KeySchema);

module.exports = {
  async init() { await connect(); },

  // Save or update public keys for an id. Either signing or encryption or both may be provided.
  async saveKey(id, signingPublicKeyBase64, encryptionPublicKeyBase64) {
    await connect();
    const update = {};
    if (typeof signingPublicKeyBase64 === 'string') update.signingPublicKeyBase64 = signingPublicKeyBase64;
    if (typeof encryptionPublicKeyBase64 === 'string') update.encryptionPublicKeyBase64 = encryptionPublicKeyBase64;
    if (Object.keys(update).length === 0) throw new Error('no_key_provided');

    const doc = await Key.findOneAndUpdate(
      { id },
      { $set: update },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    return doc;
  },

  // Return an object with both keys (or nulls) or null if not found
  async getKey(id) {
    await connect();
    const doc = await Key.findOne({ id }).lean();
    if (!doc) return null;
    return {
      signingPublicKeyBase64: doc.signingPublicKeyBase64 || null,
      encryptionPublicKeyBase64: doc.encryptionPublicKeyBase64 || null
    };
  }
};