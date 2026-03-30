import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import api from "../../lib/api";
import { Room, Review, Notification, ChatMessage, Report, RoomStatus } from "../data/mockData";
import { useAuth } from "./AuthContext";

interface AppContextType {
  rooms: Room[];
  reviews: Review[];
  notifications: Notification[];
  chatMessages: ChatMessage[];
  conversations: ChatMessage[];
  activeChatUserId: string | null;
  setActiveChatUserId: (id: string | null) => void;
  reports: Report[];
  favorites: string[];
  addRoom: (room: Partial<Room>) => Promise<{success: boolean; message: string}>;
  updateRoom: (id: string, data: Partial<Room>) => Promise<{success: boolean; message: string}>;
  approveRoom: (id: string) => Promise<void>;
  rejectRoom: (id: string, reason: string) => Promise<void>;
  updateRoomStatus: (id: string, status: RoomStatus) => Promise<void>;
  toggleFavorite: (roomId: string) => Promise<void>;
  addReview: (review: Partial<Review>) => Promise<void>;
  approveReview: (id: string) => Promise<void>;
  rejectReview: (id: string) => Promise<void>;
  markNotificationRead: (id: string) => Promise<void>;
  markAllNotificationsRead: (userId: string) => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  sendChatMessage: (msg: Partial<ChatMessage>) => Promise<void>;
  resolveReport: (id: string) => Promise<void>;
  addReport: (report: Partial<Report>) => Promise<void>;
  loadReports: () => Promise<void>;
  getNotificationsForUser: (userId: string) => Notification[];
  getChatForUser: (userId: string, adminId: string) => ChatMessage[];
  loadRooms: () => Promise<void>;
  loadReviews: () => Promise<void>;
  loadChatMessages: (withUserId?: string) => Promise<void>;
  incrementViews: (roomId: string) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const { currentUser, isAuthenticated } = useAuth();
  
  const [rooms, setRooms] = useState<Room[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [conversations, setConversations] = useState<ChatMessage[]>([]);
  const [activeChatUserId, setActiveChatUserId] = useState<string | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);

  const loadRooms = useCallback(async () => {
    try {
      // By default get all API rooms
      const res = await api.get("/rooms?limit=100");
      if (res.data.success) setRooms(res.data.rooms);
    } catch (err) {
      console.error(err);
    }
  }, []);

  const loadReviews = useCallback(async () => {
    try {
      const res = await api.get("/reviews");
      if (res.data.success) setReviews(res.data.reviews);
    } catch (err) {
      console.error(err);
    }
  }, []);

  const loadNotifications = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const res = await api.get("/notifications?limit=50");
      if (res.data.success) setNotifications(res.data.notifications);
    } catch (err) {
      console.error(err);
    }
  }, [isAuthenticated]);

  const loadReports = useCallback(async () => {
    if (!isAuthenticated || currentUser?.role !== "admin") return;
    try {
      const res = await api.get("/reports");
      if (res.data.success) setReports(res.data.reports);
    } catch (err) {
      console.error(err);
    }
  }, [isAuthenticated, currentUser]);

  const loadChatMessages = useCallback(async (withUserId?: string) => {
    if (!isAuthenticated) return;
    try {
      // 1. Fetch conversations (summaries)
      const convRes = await api.get("/chat/conversations");
      if (convRes.data.success) {
        setConversations(convRes.data.conversations);
      }

      // 2. Fetch specific history if withUserId provided OR if there is an activeChatUserId
      const targetId = withUserId || activeChatUserId;
      if (targetId) {
        const chatRes = await api.get(`/chat?withUserId=${targetId}`);
        if (chatRes.data.success) {
          setChatMessages(chatRes.data.messages);
          if (withUserId) setActiveChatUserId(withUserId);
        }
      }
    } catch (err) {
      console.error(err);
    }
  }, [isAuthenticated, activeChatUserId]);

  useEffect(() => {
    loadRooms();
    loadReviews();
  }, [loadRooms, loadReviews, isAuthenticated, currentUser?.role]);

  const loadFavorites = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const res = await api.get("/users/me/favorites");
      if (res.data.success) {
        setFavorites(res.data.favorites || []);
      }
    } catch (err) {
      console.error("Lỗi khi tải danh sách yêu thích:", err);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      loadNotifications();
      loadFavorites();
      // Initial chat load
      loadChatMessages();
      
      const interval = setInterval(() => {
        loadNotifications();
        loadChatMessages();
        if (currentUser?.role === "admin") {
          loadReports();
        }
      }, 5000);
      
      return () => clearInterval(interval);
    } else {
      setNotifications([]);
      setChatMessages([]);
      setFavorites([]);
    }
  }, [isAuthenticated, loadNotifications, loadFavorites, loadChatMessages]);

  // --- API Handlers ---
  const addRoom = async (roomData: Partial<Room>) => {
    try {
      await api.post("/rooms", roomData);
      loadRooms();
      return { success: true, message: "Đăng bài thành công, chờ duyệt." };
    } catch (err: any) {
      return { success: false, message: err.response?.data?.message || "Lỗi." };
    }
  };

  const updateRoom = async (id: string, data: Partial<Room>) => {
    try {
      await api.put(`/rooms/${id}`, data);
      loadRooms();
      return { success: true, message: "Cập nhật thành công." };
    } catch (err: any) {
      return { success: false, message: err.response?.data?.message || "Lỗi." };
    }
  };

  const approveRoom = async (id: string) => {
    await api.put(`/rooms/${id}/approve`);
    loadRooms();
  };

  const rejectRoom = async (id: string, reason: string) => {
    await api.put(`/rooms/${id}/reject`, { reason });
    loadRooms();
  };

  const updateRoomStatus = async (id: string, status: RoomStatus) => {
    await api.put(`/rooms/${id}/status`, { status });
    loadRooms();
  };

  const toggleFavorite = async (roomId: string) => {
    if (!isAuthenticated) return;
    try {
      const isFav = favorites.includes(roomId);
      const action = isFav ? "remove" : "add";
      
      // Cập nhật UI trước (Optimistic Update)
      setFavorites(prev => action === "add" ? [...prev, roomId] : prev.filter(id => id !== roomId));
      
      const res = await api.post(`/rooms/${roomId}/favorite`, { action });
      if (res.data.success) {
        // Cập nhật lại số lượng favorites trong danh sách phòng
        setRooms(prev => prev.map(r => r.id === roomId ? { ...r, favorites: res.data.favorites } : r));
      }
    } catch (err) {
      // Rollback nếu lỗi
      loadFavorites();
    }
  };

  const addReview = async (review: Partial<Review>) => {
    await api.post("/reviews", review);
    loadReviews();
  };

  const approveReview = async (id: string) => {
    await api.put(`/reviews/${id}/approve`);
    loadReviews();
  };

  const rejectReview = async (id: string) => {
    await api.put(`/reviews/${id}/reject`);
    loadReviews();
  };

  const markNotificationRead = async (id: string) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => (n._id === id || n.id === id) ? { ...n, read: true } : n));
    } catch (err) {}
  };

  const markAllNotificationsRead = async () => {
    await api.put("/notifications/read-all");
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };
  
  const deleteNotification = async (id: string) => {
    try {
      // 1. Immediate optimistic UI update
      setNotifications(prev => prev.filter(n => (n._id !== id && n.id !== id)));
      
      // 2. Perform backend delete
      const res = await api.delete(`/notifications/${id}`);
      if (!res.data.success) {
        // Rollback or re-load if delete failed
        loadNotifications();
      }
    } catch (err) {
      console.error("Lỗi khi xóa thông báo:", err);
      loadNotifications(); // Refresh to restore on fail
    }
  };

  const sendChatMessage = async (msgData: Partial<ChatMessage>) => {
    // 1. Optimistic Update
    const optimisticMsg: ChatMessage = {
      _id: `temp-${Date.now()}`,
      fromId: currentUser?._id || currentUser?.id,
      fromName: currentUser?.name || "Bạn",
      toId: typeof msgData.toId === 'object' ? (msgData.toId as any)._id : msgData.toId,
      message: msgData.message || "",
      createdAt: new Date().toISOString(),
      read: false,
    } as any;

    setChatMessages(prev => [...prev, optimisticMsg]);

    try {
      const res = await api.post("/chat", msgData);
      if (res.data.success) {
        // Replace temp message with real one if needed, or just let polling handle it
        setChatMessages(prev => prev.map(m => m._id === optimisticMsg._id ? res.data.message : m));
        
        // Refresh conversations list
        const convRes = await api.get("/chat/conversations");
        if (convRes.data.success) setConversations(convRes.data.conversations);
      }
    } catch (err) {
      // Rollback on error
      setChatMessages(prev => prev.filter(m => m._id !== optimisticMsg._id));
    }
  };

  const resolveReport = async (id: string) => {
    try {
      await api.put(`/reports/${id}/resolve`);
      setReports((prev) => prev.map((r) => (r.id === id ? { ...r, status: "resolved" } : r)));
    } catch (err) {}
  };

  const addReport = async (report: Partial<Report>) => {
    try {
      await api.post("/reports", report);
    } catch (err) {}
  };

  const getNotificationsForUser = (userId: string) => notifications;

  const getChatForUser = (userId: string, otherId: string) => {
    return chatMessages.filter(
      (m) =>
        (m.fromId === userId && m.toId === otherId) ||
        (m.fromId === otherId && m.toId === userId)
    );
  };
  
  const incrementViews = async (roomId: string) => {
    await api.put(`/rooms/${roomId}/views`).catch(() => {});
  };

  return (
    <AppContext.Provider
      value={{
        rooms,
        reviews,
        notifications,
        chatMessages,
        reports,
        favorites,
        addRoom,
        updateRoom,
        approveRoom,
        rejectRoom,
        updateRoomStatus,
        toggleFavorite,
        addReview,
        approveReview,
        rejectReview,
        resolveReport,
        addReport,
        loadReports,
        markNotificationRead,
        markAllNotificationsRead,
        deleteNotification,
        sendChatMessage,
        getNotificationsForUser,
        getChatForUser,
        incrementViews,
        loadRooms,
        loadReviews,
        loadChatMessages,
        conversations,
        activeChatUserId,
        setActiveChatUserId
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
