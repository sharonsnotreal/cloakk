const mongoose = require("mongoose");

const submissionSchema = new mongoose.Schema(
  {
    textMessage: { type: String, required: true },
    file: {
      originalName: String,
      path: String,
      mimetype: String,
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

module.exports = mongoose.model("Submission", submissionSchema);
