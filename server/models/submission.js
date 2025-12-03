const mongoose = require("mongoose");

// const fileSchema = new mongoose.Schema(
//   {
//     originalName: String,
//     path: String,
//     filename: String,
//     mimetype: String,
//     size: Number,
//     // for remote storages (S3, etc.)
//     url: String,
//     key: String,
//     fieldname: String,
//   },
//   { _id: false }
// );
const fileSchema = new mongoose.Schema(
  {
    originalName: String,
    path: String,
    filename: String,
    mimetype: String,
    size: Number,
    url: String,
    key: String,
    fieldname: String,
    // new fields
    encoding: { type: String, default: "aes-ciphertext" },
    uploadedAt: { type: Date, default: Date.now },
    // if server stores base64 instead of file on disk, you can store that reference
    // dataB64: String, // avoid for large files
  },
  { _id: false }
);
const submissionSchema = new mongoose.Schema(
  {
    textMessage: { type: String, required: true },

    file: {
      originalName: String,
      path: String,
      mimetype: String,
    },

    // New: support multiple files
    files: {
      type: [fileSchema],
      default: undefined, 
    },

    receiptCode: { type: String, required: true, unique: true },
    privateKeyCipher: {
    type: String
      },
      publicKey: {
        type: String
      },
      pbkHash: {
        type: String
      },
    passphrase: { type: String },
    isViewed: { type: Boolean, default: false },
    isFlagged: {
      type: String,
      enum: ["urgent", "important", null],
      default: null,
    },
    isDeleted: { type: Boolean, default: false },
    deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
    deletedAt: { type: Date },
  },
  { timestamps: true }
);


submissionSchema.methods.getFilesArray = function () {
  if (Array.isArray(this.files) && this.files.length) return this.files;
  if (this.file && Object.keys(this.file).length) return [this.file];
  return [];
};

module.exports = mongoose.model("Submission", submissionSchema);