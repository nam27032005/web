import React, { createContext, useContext, useState } from "react";
import {
  Room,
  Review,
  Notification,
  ChatMessage,
  Report,
  ROOMS,
  REVIEWS,
  NOTIFICATIONS,
  CHAT_MESSAGES,
  REPORTS,
} from "../data/mockData";

interface AppContextType {
  rooms: Room[];
  reviews: Review[];
  notifications: Notification[];
  chatMessages: ChatMessage[];
  reports: Report[];
  favorites: string[]; // roomIds
  addRoom: (room: Room) => void;
  updateRoom: (id: string, data: Partial<Room>) => void;
  approveRoom: (id: string) => void;
  rejectRoom: (id: string, reason: string) => void;
  toggleFavorite: (roomId: string) => void;
  addReview: (review: Review) => void;
  approveReview: (id: string) => void;
  rejectReview: (id: string) => void;
  addNotification: (notif: Omit<Notification, "id">) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: (userId: string) => void;
  sendChatMessage: (msg: Omit<ChatMessage, "id">) => void;
  addReport: (report: Omit<Report, "id">) => void;
  resolveReport: (id: string) => void;
  getNotificationsForUser: (userId: string) => Notification[];
  getChatForUser: (userId: string, adminId: string) => ChatMessage[];
  incrementViews: (roomId: string) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [rooms, setRooms] = useState<Room[]>(ROOMS);
  const [reviews, setReviews] = useState<Review[]>(REVIEWS);
  const [notifications, setNotifications] = useState<Notification[]>(NOTIFICATIONS);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(CHAT_MESSAGES);
  const [reports, setReports] = useState<Report[]>(REPORTS);
  const [favorites, setFavorites] = useState<string[]>(["room-001", "room-002"]);

  const addRoom = (room: Room) => setRooms((prev) => [...prev, room]);

  const updateRoom = (id: string, data: Partial<Room>) =>
    setRooms((prev) => prev.map((r) => (r.id === id ? { ...r, ...data } : r)));

  const approveRoom = (id: string) => {
    const room = rooms.find((r) => r.id === id);
    if (!room) return;
    const now = new Date();
    const expires = new Date(now);
    if (room.displayDurationUnit === "week") expires.setDate(expires.getDate() + 7 * room.displayDuration);
    else if (room.displayDurationUnit === "month") expires.setMonth(expires.getMonth() + room.displayDuration);
    else if (room.displayDurationUnit === "quarter") expires.setMonth(expires.getMonth() + 3 * room.displayDuration);
    else expires.setFullYear(expires.getFullYear() + room.displayDuration);

    updateRoom(id, {
      postStatus: "approved",
      approvedAt: now.toISOString().split("T")[0],
      expiresAt: expires.toISOString().split("T")[0],
    });
    addNotification({
      userId: room.ownerId,
      title: "Bài đăng được duyệt",
      message: `Bài đăng "${room.title}" đã được phê duyệt. Thời hạn hiển thị: ${room.displayDuration} ${room.displayDurationUnit}. Phí: ${room.postFee.toLocaleString("vi-VN")}đ.`,
      read: false,
      type: "approval",
      createdAt: new Date().toISOString(),
    });
  };

  const rejectRoom = (id: string, reason: string) => {
    const room = rooms.find((r) => r.id === id);
    if (!room) return;
    updateRoom(id, { postStatus: "rejected", rejectedReason: reason });
    addNotification({
      userId: room.ownerId,
      title: "Bài đăng bị từ chối",
      message: `Bài đăng "${room.title}" bị từ chối. Lý do: ${reason}`,
      read: false,
      type: "rejection",
      createdAt: new Date().toISOString(),
    });
  };

  const toggleFavorite = (roomId: string) => {
    setFavorites((prev) =>
      prev.includes(roomId) ? prev.filter((id) => id !== roomId) : [...prev, roomId]
    );
    setRooms((prev) =>
      prev.map((r) =>
        r.id === roomId
          ? { ...r, favorites: favorites.includes(roomId) ? r.favorites - 1 : r.favorites + 1 }
          : r
      )
    );
  };

  const addReview = (review: Review) => setReviews((prev) => [...prev, review]);

  const approveReview = (id: string) =>
    setReviews((prev) => prev.map((r) => (r.id === id ? { ...r, status: "approved" } : r)));

  const rejectReview = (id: string) =>
    setReviews((prev) => prev.map((r) => (r.id === id ? { ...r, status: "rejected" } : r)));

  const addNotification = (notif: Omit<Notification, "id">) => {
    const newNotif: Notification = { ...notif, id: `notif-${Date.now()}` };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  const markNotificationRead = (id: string) =>
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));

  const markAllNotificationsRead = (userId: string) =>
    setNotifications((prev) =>
      prev.map((n) => (n.userId === userId ? { ...n, read: true } : n))
    );

  const sendChatMessage = (msg: Omit<ChatMessage, "id">) => {
    const newMsg: ChatMessage = { ...msg, id: `chat-${Date.now()}` };
    setChatMessages((prev) => [...prev, newMsg]);
  };

  const addReport = (report: Omit<Report, "id">) => {
    const newReport: Report = { ...report, id: `report-${Date.now()}` };
    setReports((prev) => [...prev, newReport]);
  };

  const resolveReport = (id: string) =>
    setReports((prev) => prev.map((r) => (r.id === id ? { ...r, status: "resolved" } : r)));

  const getNotificationsForUser = (userId: string) =>
    notifications.filter((n) => n.userId === userId);

  const getChatForUser = (userId: string, adminId: string) =>
    chatMessages.filter(
      (m) =>
        (m.fromId === userId && m.toId === adminId) ||
        (m.fromId === adminId && m.toId === userId)
    );

  const incrementViews = (roomId: string) =>
    setRooms((prev) => prev.map((r) => (r.id === roomId ? { ...r, views: r.views + 1 } : r)));

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
        toggleFavorite,
        addReview,
        approveReview,
        rejectReview,
        addNotification,
        markNotificationRead,
        markAllNotificationsRead,
        sendChatMessage,
        addReport,
        resolveReport,
        getNotificationsForUser,
        getChatForUser,
        incrementViews,
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
