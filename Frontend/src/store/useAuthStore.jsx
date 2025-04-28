import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

const BASE_URL = import.meta.env.MODE === "development" ? "http://localhost:5001" : "/";

// const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5001/api";


export const useAuthStore = create((set, get) => ({
  authUser: null,
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  isCheckingAuth: true,
  onlineUsers: [],
  socket: null,

  checkAuth: async () => {
    try {
      const res = await axiosInstance.get("/auth/check");

      if (!res || !res.data) {
        throw new Error("Invalid response from server");
      }

      set({ authUser: res.data });
      get().connectSocket();
    } catch (error) {
      console.error("Error in checkAuth: ", error);
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  signup: async (data) => {
    set({ isSigningUp: true });
    try {
      const res = await axiosInstance.post("/auth/signup", data);

      if (!res || !res.data) {
        throw new Error("Invalid response from server");
      }

      set({ authUser: res.data });
      toast.success("Account created successfully");
      get().connectSocket();
    } catch (error) {
      console.error("Signup error:", error);
      const errorMessage = error.response?.data?.message || "Signup failed. Please try again.";
      toast.error(errorMessage);
    } finally {
      set({ isSigningUp: false });
    }
  },

  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/auth/login", data);

      if (!res || !res.data) {
        throw new Error("Invalid response from server");
      }

      set({ authUser: res.data });
      toast.success("Logged in successfully");
      get().connectSocket();
    } catch (error) {
      console.error("Login error:", error);
      const errorMessage = error.response?.data?.message || "Login failed. Please check your credentials.";
      toast.error(errorMessage);
    } finally {
      set({ isLoggingIn: false });
    }
  },

  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout");
      set({ authUser: null });
      toast.success("Logged out successfully");
      get().disconnectSocket();
    } catch (error) {
      console.error("Logout error:", error);
      const errorMessage = error.response?.data?.message || "Logout failed. Please try again.";
      toast.error(errorMessage);
    }
  },

  updateProfile: async (data) => {
    set({ isUpdatingProfile: true });
    try {
      const res = await axiosInstance.put("/auth/update-profile", data);

      if (!res || !res.data) {
        throw new Error("Invalid response from server");
      }

      set({ authUser: res.data });
      toast.success("Profile updated successfully");
    } catch (error) {
      console.error("Update profile error:", error);
      const errorMessage = error.response?.data?.message || "Profile update failed. Please try again.";
      toast.error(errorMessage);
    } finally {
      set({ isUpdatingProfile: false });
    }
  },

  connectSocket: () => {
    const { authUser } = get();
    if (!authUser || get().socket?.connected) return;

    try {
      const socket = io(BASE_URL, {
        query: {
          userId: authUser._id,
        },
      });
      socket.connect();

      set({ socket });

      socket.on("getOnlineUsers", (userIds) => {
        set({ onlineUsers: userIds });
      });
    } catch (error) {
      console.error("Socket connection error:", error);
    }
  },

  disconnectSocket: () => {
    try {
      if (get().socket?.connected) get().socket.disconnect();
    } catch (error) {
      console.error("Socket disconnection error:", error);
    }
  },
}));
