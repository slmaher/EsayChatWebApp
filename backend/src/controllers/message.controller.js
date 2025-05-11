import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import BlockedUser from "../models/blockedUser.model.js";

import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";

export const getUsersForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    
    // Get blocked users
    const blockedUsers = await BlockedUser.find({ userId: loggedInUserId })
      .select("blockedUserId");
    const blockedUserIds = blockedUsers.map(block => block.blockedUserId);

    // Get all users except the logged-in user
    const users = await User.find({
      _id: { $ne: loggedInUserId }
    }).select("-password");

    // For each user, get the latest message between them and the logged-in user
    const usersWithLastMessage = await Promise.all(
      users.map(async (user) => {
        const lastMessage = await Message.findOne({
          $or: [
            { senderId: loggedInUserId, receiverId: user._id },
            { senderId: user._id, receiverId: loggedInUserId },
          ],
        })
          .sort({ createdAt: -1 })
          .lean();

        return {
          ...user.toObject(),
          isBlocked: blockedUserIds.includes(user._id.toString()),
          lastMessage: lastMessage
            ? {
                text: lastMessage.text,
                createdAt: lastMessage.createdAt,
              }
            : null,
        };
      })
    );

    res.status(200).json(usersWithLastMessage);
  } catch (error) {
    console.error("Error in getUsersForSidebar: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const myId = req.user._id;

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
    });

    res.status(200).json(messages);
  } catch (error) {
    console.log("Error in getMessages controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    // Check if either user has blocked the other
    const isBlocked = await BlockedUser.findOne({
      $or: [
        { userId: senderId, blockedUserId: receiverId },
        { userId: receiverId, blockedUserId: senderId }
      ]
    });

    if (isBlocked) {
      return res.status(403).json({ error: "Cannot send message to blocked user" });
    }

    let imageUrl;
    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      image: imageUrl,
    });

    await newMessage.save();

    const receiverSocketId = getReceiverSocketId(receiverId);
    const senderSocketId = getReceiverSocketId(senderId);

    if (receiverSocketId) {
      console.log("Emitting newMessage to receiver socket:", receiverSocketId, JSON.stringify(newMessage));
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    if (senderSocketId) {
      console.log("Emitting newMessage to sender socket:", senderSocketId, JSON.stringify(newMessage));
      io.to(senderSocketId).emit("newMessage", newMessage);
    }

    res.status(201).json(newMessage);
  } catch (error) {
    console.log("Error in sendMessage controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
