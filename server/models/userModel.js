const { connect, mongoose } = require('../db/mongo');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, index: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user', index: true }
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', UserSchema);

module.exports = {
  async init() { await connect(); },

  async createUser(username, password, role = 'user') {
    await connect();
    const existing = await User.findOne({ username });
    if (existing) throw new Error('user_exists');
    const hash = await bcrypt.hash(password, 10);
    const doc = await User.create({ username, passwordHash: hash, role });
    return { username: doc.username, role: doc.role };
  },

  async verifyCredentials(username, password) {
    await connect();
    const user = await User.findOne({ username }).lean();
    if (!user) return null;
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return null;
    return { username: user.username, role: user.role };
  },

  async findByUsername(username) {
    await connect();
    return await User.findOne({ username }).lean();
  },

  async hasAdmin() {
    await connect();
    const count = await User.countDocuments({ role: 'admin' });
    return count > 0;
  }
};