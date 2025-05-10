import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

export const useBlockStore = create((set, get) => ({
  blockedUsers: [],
  isBlocking: false,

  getBlockedUsers: async () => {
    try {
      const res = await axiosInstance.get("/blocks");
      set({ blockedUsers: res.data });
    } catch (error) {
      console.error("Error fetching blocked users:", error);
      toast.error("Failed to fetch blocked users");
    }
  },

  blockUser: async (userId) => {
    set({ isBlocking: true });
    try {
      await axiosInstance.post(`/blocks/${userId}`);
      toast.success("User blocked successfully");
      get().getBlockedUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to block user");
    } finally {
      set({ isBlocking: false });
    }
  },

  unblockUser: async (userId) => {
    set({ isBlocking: true });
    try {
      await axiosInstance.delete(`/blocks/${userId}`);
      toast.success("User unblocked successfully");
      get().getBlockedUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to unblock user");
    } finally {
      set({ isBlocking: false });
    }
  },

  isUserBlocked: (userId) => {
    return get().blockedUsers.some(block => block.blockedUserId._id === userId);
  },
})); 