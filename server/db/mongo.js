const mongoose = require('mongoose');
const { GridFSBucket } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/cloakk';

mongoose.set('strictQuery', false);

async function connect() {
  if (mongoose.connection.readyState === 1) return mongoose;
  await mongoose.connect(MONGODB_URI, {
    // options left default for mongoose v7
  });
  console.log('MongoDB connected');
  return mongoose;
}

function getBucket() {
  const conn = mongoose.connection;
  if (!conn || !conn.db) {
    throw new Error('MongoDB connection not ready - call connect() first');
  }
  return new GridFSBucket(conn.db, { bucketName: 'uploads' });
}

module.exports = {
  connect,
  mongoose,
  getBucket
};