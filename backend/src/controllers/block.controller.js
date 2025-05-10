import BlockedUser from "../models/blockedUser.model.js";
import User from "../models/user.model.js";

export const blockUser = async (req, res) => {
  try {
    const { blockedUserId } = req.params;
    const userId = req.user._id;

    // Check if user exists
    const userToBlock = await User.findById(blockedUserId);
    if (!userToBlock) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if already blocked
    const existingBlock = await BlockedUser.findOne({
      userId,
      blockedUserId,
    });

    if (existingBlock) {
      return res.status(400).json({ error: "User is already blocked" });
    }

    // Create block relationship
    const blockedUser = new BlockedUser({
      userId,
      blockedUserId,
    });

    await blockedUser.save();

    res.status(201).json({ message: "User blocked successfully" });
  } catch (error) {
    console.log("Error in blockUser controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const unblockUser = async (req, res) => {
  try {
    const { blockedUserId } = req.params;
    const userId = req.user._id;

    const result = await BlockedUser.deleteOne({
      userId,
      blockedUserId,
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "Block relationship not found" });
    }

    res.status(200).json({ message: "User unblocked successfully" });
  } catch (error) {
    console.log("Error in unblockUser controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getBlockedUsers = async (req, res) => {
  try {
    const userId = req.user._id;

    const blockedUsers = await BlockedUser.find({ userId })
      .populate("blockedUserId", "fullName profilePic")
      .select("blockedUserId");

    res.status(200).json(blockedUsers);
  } catch (error) {
    console.log("Error in getBlockedUsers controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
}; 