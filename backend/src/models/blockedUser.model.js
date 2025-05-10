import mongoose from "mongoose";

const blockedUserSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    blockedUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

// Create a compound index to ensure unique blocking relationships
blockedUserSchema.index({ userId: 1, blockedUserId: 1 }, { unique: true });

const BlockedUser = mongoose.model("BlockedUser", blockedUserSchema);

export default BlockedUser; 