const mongoose = require("mongoose");

const fileSchema = new mongoose.Schema(
  {
    originalName: String,
    path: String,
    filename: String,
    mimetype: String,
    size: Number,
    // for remote storages (S3, etc.)
    url: String,
    key: String,
    fieldname: String,
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