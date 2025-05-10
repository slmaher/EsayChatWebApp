import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { blockUser, unblockUser, getBlockedUsers } from "../controllers/block.controller.js";

const router = express.Router();

router.get("/", protectRoute, getBlockedUsers);
router.post("/:blockedUserId", protectRoute, blockUser);
router.delete("/:blockedUserId", protectRoute, unblockUser);

export default router; 