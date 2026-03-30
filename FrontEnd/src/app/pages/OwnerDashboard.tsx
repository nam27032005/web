import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router";
import api from "../../lib/api";
import {
  Plus,
  Edit,
  Eye,
  Heart,
  BarChart2,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Home,
  ToggleLeft,
  ToggleRight,
  ChevronRight,
  TrendingUp,
  Bell,
  MessageCircle,
  X,
  Send,
  Shield,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useApp } from "../context/AppContext";
import {
  ROOM_TYPE_LABELS,
  formatPrice,
  calcPostFee,
  Room,
  POST_STATUS_COLORS,
  POST_STATUS_LABELS,
} from "../data/mockData";
import { CreateListingModal } from "./CreateListingModal";

type DashboardTab = "listings" | "create" | "stats" | "chat" | "notifications";

export function OwnerDashboard() {
  const { currentUser } = useAuth();
  const { loadChatMessages, rooms, updateRoom, notifications, getNotificationsForUser, chatMessages, sendChatMessage, setActiveChatUserId, deleteNotification, markNotificationRead } =
    useApp();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<DashboardTab>("listings");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [chatMsg, setChatMsg] = useState("");
  const [adminId, setAdminId] = useState<string | null>(null); // Fetch Admin ID dynamically
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Fetch real admin ID (backup if needed)
  useEffect(() => {
    const fetchAdmin = async () => {
      try {
        const res = await api.get("/users?role=admin");
        if (res.data.success && res.data.users.length > 0) {
          // Identify the specific admin by ID if possible, otherwise keep the default
          const specificAdmin = res.data.users.find((u: any) => (u._id || u.id) === "69c92c048c12a9bff8a1fa47");
          if (specificAdmin) {
            setAdminId(specificAdmin._id || specificAdmin.id);
          }
        }
      } catch (err) {}
    };
    if (currentUser && currentUser.role === "owner") {
      fetchAdmin();
    }
  }, [currentUser]);

  // Fetch chat messages when tab selected
  useEffect(() => {
    if (activeTab === "chat" && adminId) {
      loadChatMessages(adminId);
    } else if (activeTab !== "chat") {
      setActiveChatUserId(null);
    }
  }, [activeTab, adminId, loadChatMessages, setActiveChatUserId]);

  useEffect(() => {
    if (activeTab === "chat" && chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [chatMessages, activeTab]);

  if (!currentUser || currentUser.role !== "owner") {
    return (
      <div className="min-h-screen flex items-center justify-center text-center px-4">
        <div>
          <p className="text-gray-500 dark:text-gray-400 mb-4">Bạn cần đăng nhập với tư cách chủ nhà trọ.</p>
          <Link to="/login" className="text-emerald-600 hover:underline">Đăng nhập</Link>
        </div>
      </div>
    );
  }

  const myRooms = rooms.filter((r) => r.ownerId === currentUser.id);
  const myNotifs = getNotificationsForUser(currentUser.id);
  const unreadNotifs = myNotifs.filter((n) => !n.read).length;

  // Chat messages with admin
  const myChats = chatMessages.filter((m) => {
    const fromId = typeof m.fromId === 'object' ? (m.fromId as any)._id : m.fromId;
    const toId = typeof m.toId === 'object' ? (m.toId as any)._id : m.toId;
    const currentId = currentUser._id || currentUser.id;
    return (
      (fromId === currentId && toId === adminId) ||
      (fromId === adminId && toId === currentId)
    );
  });

  const adminProfile = {
    name: "Admin 7 Trọ",
    avatar: "https://images.unsplash.com/photo-1765648763932-43a3e2f8f35c?w=200&h=200&fit=crop",
  };

  const stats = {
    total: myRooms.length,
    approved: myRooms.filter((r) => r.postStatus === "approved").length,
    pending: myRooms.filter((r) => r.postStatus === "pending").length,
    rejected: myRooms.filter((r) => r.postStatus === "rejected").length,
    totalViews: myRooms.reduce((s, r) => s + r.views, 0),
    totalFavorites: myRooms.reduce((s, r) => s + r.favorites, 0),
  };

  const handleStatusToggle = async (room: Room) => {
    await updateRoom(room._id || room.id, {
      status: room.status === "available" ? "rented" : "available",
    });
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMsg.trim() || !adminId) return;
    sendChatMessage({
      toId: adminId,
      message: chatMsg,
    });
    setChatMsg("");
  };

  const TABS = [
    { id: "listings" as DashboardTab, label: "Bài đăng", icon: <Home className="w-4 h-4" /> },
    { id: "stats" as DashboardTab, label: "Thống kê", icon: <BarChart2 className="w-4 h-4" /> },
    { id: "chat" as DashboardTab, label: "Chat Admin", icon: <MessageCircle className="w-4 h-4" /> },
    {
      id: "notifications" as DashboardTab,
      label: "Thông báo",
      icon: <Bell className="w-4 h-4" />,
      badge: unreadNotifs,
    },
  ];

  return (
    <div className="bg-gray-50 dark:bg-gray-900 h-screen flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Quản lý bài đăng</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                Xin chào, {currentUser.name}!{" "}
                {!currentUser.verified && (currentUser.role as string) === "owner" && (
                  <span className="text-amber-600">(Tài khoản chưa được xác nhận)</span>
                )}
                {(currentUser.role as string) === "admin" && (
                  <span className="text-emerald-600 font-medium"> (Quản trị viên)</span>
                )}
              </p>
            </div>
            <div className="flex gap-2">
              {(currentUser.role as string) === "admin" && (
                <Link
                  to="/admin-dashboard"
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors shadow-lg shadow-blue-500/20"
                >
                  <Shield className="w-4 h-4" />
                  Bảng Admin
                </Link>
              )}
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors"
              >
                <Plus className="w-4 h-4" />
                Đăng bài mới
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mt-4 overflow-x-auto">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors relative ${
                  activeTab === tab.id
                    ? "bg-emerald-600 text-white"
                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                {tab.icon}
                {tab.label}
                {tab.badge != null && tab.badge > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {tab.badge}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Stats summary */}
          {activeTab === "listings" && (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {[
                  { label: "Tổng bài đăng", value: stats.total, color: "bg-blue-50 text-blue-700", icon: <Home className="w-5 h-5" /> },
                  { label: "Đã duyệt", value: stats.approved, color: "bg-green-50 text-green-700", icon: <CheckCircle className="w-5 h-5" /> },
                  { label: "Chờ duyệt", value: stats.pending, color: "bg-yellow-50 text-yellow-700", icon: <Clock className="w-5 h-5" /> },
                  { label: "Bị từ chối", value: stats.rejected, color: "bg-red-50 text-red-700", icon: <XCircle className="w-5 h-5" /> },
                ].map((s, i) => (
                  <div key={i} className={`rounded-2xl p-4 flex items-center gap-3 ${s.color}`}>
                    {s.icon}
                    <div>
                      <p className="text-2xl font-bold">{s.value}</p>
                      <p className="text-xs opacity-80">{s.label}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Room list */}
              <div className="space-y-3">
                {myRooms.length === 0 ? (
                  <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 text-center border border-gray-100 dark:border-gray-700">
                    <Home className="w-12 h-12 text-gray-200 dark:text-gray-700 mx-auto mb-3" />
                    <p className="text-gray-500">Bạn chưa có bài đăng nào.</p>
                    <button
                      onClick={() => setShowCreateModal(true)}
                      className="mt-4 text-sm text-emerald-600 hover:underline"
                    >
                      Đăng bài ngay
                    </button>
                  </div>
                ) : (
                  myRooms.map((room) => (
                    <div key={room._id || room.id} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-4 flex gap-4 items-start">
                      <img
                        src={room.images[0]}
                        alt={room.title}
                        className="w-20 h-16 rounded-xl object-cover flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-1">{room.title}</h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{room.address.full}</p>
                          </div>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${POST_STATUS_COLORS[room.postStatus]}`}>
                            {POST_STATUS_LABELS[room.postStatus]}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 mt-2">
                          <span className="text-sm font-semibold text-emerald-600">{formatPrice(room.price)}/tháng</span>
                          <span className="text-xs text-gray-400 dark:text-gray-500">{room.area}m²</span>
                          <span className="flex items-center gap-0.5 text-xs text-gray-400">
                            <Eye className="w-3 h-3" />{room.views}
                          </span>
                          <span className="flex items-center gap-0.5 text-xs text-gray-400">
                            <Heart className="w-3 h-3" />{room.favorites}
                          </span>
                          {room.expiresAt && (
                            <span className="flex items-center gap-0.5 text-xs text-gray-400">
                              <Clock className="w-3 h-3" />Hết hạn: {room.expiresAt}
                            </span>
                          )}
                        </div>

                        {room.postStatus === "rejected" && room.rejectedReason && (
                          <div className="mt-2 flex items-center gap-1 text-xs text-red-600 bg-red-50 rounded-lg px-2 py-1">
                            <AlertTriangle className="w-3 h-3 flex-shrink-0" />
                            {room.rejectedReason}
                          </div>
                        )}

                        <div className="flex flex-wrap gap-2 mt-3">
                          <Link
                            to={`/room/${room._id || room.id}`}
                            className="flex items-center gap-1 text-xs text-gray-600 hover:text-emerald-600 border border-gray-200 px-2.5 py-1.5 rounded-lg transition-colors"
                          >
                            <Eye className="w-3 h-3" />Xem
                          </Link>
                          {room.postStatus === "pending" && (
                            <button className="flex items-center gap-1 text-xs text-blue-600 border border-blue-200 px-2.5 py-1.5 rounded-lg hover:bg-blue-50">
                              <Edit className="w-3 h-3" />Chỉnh sửa
                            </button>
                          )}
                          {room.postStatus === "approved" && (
                            <button
                              onClick={() => handleStatusToggle(room)}
                              className={`flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg border transition-colors ${
                                room.status === "available"
                                  ? "text-orange-600 border-orange-200 hover:bg-orange-50"
                                  : "text-green-600 border-green-200 hover:bg-green-50"
                              }`}
                            >
                              {room.status === "available" ? (
                                <><ToggleLeft className="w-3 h-3" />Đánh dấu đã cho thuê</>
                              ) : (
                                <><ToggleRight className="w-3 h-3" />Còn trống</>
                              )}
                            </button>
                          )}
                          {room.postStatus === "approved" && (
                            <button className="flex items-center gap-1 text-xs text-purple-600 border border-purple-200 px-2.5 py-1.5 rounded-lg hover:bg-purple-50">
                              <RefreshCw className="w-3 h-3" />Gia hạn
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          )}

          {/* Stats Tab */}
          {activeTab === "stats" && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[
                  { label: "Tổng lượt xem", value: stats.totalViews, icon: <Eye className="w-5 h-5 text-blue-500" />, color: "bg-blue-50" },
                  { label: "Tổng lượt yêu thích", value: stats.totalFavorites, icon: <Heart className="w-5 h-5 text-red-500" />, color: "bg-red-50" },
                  { label: "Tỉ lệ duyệt", value: `${stats.total ? Math.round((stats.approved / stats.total) * 100) : 0}%`, icon: <TrendingUp className="w-5 h-5 text-green-500" />, color: "bg-green-50" },
                ].map((s, i) => (
                  <div key={i} className={`rounded-2xl p-5 ${s.color}`}>
                    <div className="mb-2">{s.icon}</div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{s.value}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Chi tiết từng bài đăng</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100 dark:border-gray-700 text-left text-gray-500 text-xs">
                        <th className="pb-3 font-medium">Bài đăng</th>
                        <th className="pb-3 font-medium">Lượt xem</th>
                        <th className="pb-3 font-medium">Yêu thích</th>
                        <th className="pb-3 font-medium">Trạng thái</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                      {myRooms.map((room) => (
                        <tr key={room._id || room.id}>
                          <td className="py-3 pr-4">
                            <p className="font-medium text-gray-900 dark:text-white line-clamp-1">{room.title}</p>
                            <p className="text-xs text-gray-400 dark:text-gray-500">{room.address.district}</p>
                          </td>
                          <td className="py-3 pr-4">
                            <div className="flex items-center gap-1">
                              <Eye className="w-3.5 h-3.5 text-gray-400" />
                              <span className="font-medium dark:text-gray-200">{room.views}</span>
                            </div>
                          </td>
                          <td className="py-3 pr-4">
                            <div className="flex items-center gap-1">
                              <Heart className="w-3.5 h-3.5 text-gray-400" />
                              <span className="font-medium dark:text-gray-200">{room.favorites}</span>
                            </div>
                          </td>
                          <td className="py-3">
                            <span className={`text-xs px-2 py-0.5 rounded-full ${POST_STATUS_COLORS[room.postStatus]}`}>
                              {POST_STATUS_LABELS[room.postStatus]}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Chat Tab (Messenger Style) */}
          {activeTab === "chat" && (
            <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 flex flex-col shadow-sm overflow-hidden h-[600px] max-h-[70vh]">
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-50 dark:border-gray-700 flex items-center justify-between bg-white/50 dark:bg-gray-800/50 backdrop-blur-md sticky top-0 z-10 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img src={adminProfile.avatar} alt="" className="w-10 h-10 rounded-full object-cover border-2 border-white dark:border-gray-700 shadow-sm" />
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-700 rounded-full"></span>
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 dark:text-white text-sm">{adminProfile.name}</p>
                    <p className="text-[10px] font-medium text-emerald-600 uppercase tracking-wider">Đang trực tuyến</p>
                  </div>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/30 dark:bg-gray-900/10 transition-colors">
                {myChats.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-full text-center space-y-2 opacity-40">
                    <MessageCircle className="w-12 h-12 text-gray-300" />
                    <p className="text-sm font-medium dark:text-gray-400">Bắt đầu cuộc trò chuyện với Admin</p>
                  </div>
                )}
                {myChats.map((msg, idx) => {
                  const currentId = currentUser._id || currentUser.id;
                  const fromIdStr = typeof msg.fromId === 'object' ? (msg.fromId as any)._id : msg.fromId;
                  const isMe = fromIdStr === currentId;
                  const isFirstInGroup = idx === 0 || (typeof myChats[idx-1].fromId === 'object' ? (myChats[idx-1].fromId as any)._id : myChats[idx-1].fromId) !== fromIdStr;
                  const time = msg.createdAt ? new Date(msg.createdAt) : new Date();

                  return (
                    <div key={msg._id || (msg as any).id} className={`flex items-end gap-2 ${isMe ? "justify-end" : "justify-start"}`}>
                      {!isMe && isFirstInGroup && (
                        <img src={adminProfile.avatar} alt="" className="w-7 h-7 rounded-full object-cover mb-1 border border-white dark:border-gray-700 shadow-sm" />
                      )}
                      {!isMe && !isFirstInGroup && <div className="w-7"></div>}
                      
                      <div className={`group relative max-w-[75%] px-4 py-2.5 shadow-sm transition-all hover:shadow-md ${
                        isMe 
                          ? "bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-2xl rounded-tr-none" 
                          : "bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-2xl rounded-tl-none border border-gray-100 dark:border-gray-600"
                      }`}>
                        <p className="text-sm leading-relaxed">{msg.message}</p>
                        <div className={`text-[9px] mt-1.5 font-medium opacity-0 group-hover:opacity-60 transition-opacity absolute ${isMe ? "right-0 -bottom-4 text-gray-500" : "left-0 -bottom-4 text-gray-500"}`}>
                          {time.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={chatEndRef} />
              </div>

              {/* Chat Input */}
              <form onSubmit={handleSendChat} className="p-4 bg-white dark:bg-gray-800 border-t border-gray-50 dark:border-gray-700 flex items-center gap-3 transition-colors">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={chatMsg}
                    onChange={(e) => setChatMsg(e.target.value)}
                    placeholder="Viết tin nhắn..."
                    className="w-full bg-gray-100 dark:bg-gray-900 dark:text-white border-transparent rounded-2xl px-5 py-3 text-sm focus:bg-white dark:focus:bg-gray-800 focus:ring-2 focus:ring-emerald-500/20 transition-all outline-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={!chatMsg.trim()}
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                    chatMsg.trim() 
                      ? "bg-emerald-600 text-white shadow-lg shadow-emerald-500/30 scale-100 hover:scale-110 active:scale-95" 
                      : "bg-gray-100 dark:bg-gray-700 text-gray-400 scale-90"
                  }`}
                >
                  <Send className="w-5 h-5" />
                </button>
              </form>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === "notifications" && (
            <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 overflow-hidden shadow-sm">
              {myNotifs.length === 0 ? (
                <div className="text-center py-20 opacity-40">
                  <Bell className="w-12 h-12 text-gray-200 dark:text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Không có thông báo nào</p>
                </div>
              ) : (
                myNotifs.map((notif) => (
                  <div
                    key={notif._id || notif.id}
                    onClick={() => !notif.read && markNotificationRead(notif._id || notif.id)}
                    className={`p-5 border-b border-gray-50 dark:border-gray-700 last:border-0 group cursor-pointer transition-all ${
                      !notif.read ? "bg-emerald-50/50 dark:bg-emerald-900/10" : "hover:bg-gray-50 dark:hover:bg-gray-900/50"
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-2.5 h-2.5 rounded-full mt-2 flex-shrink-0 shadow-sm ${
                        notif.read ? "bg-green-500" : "bg-red-500"
                      }`} />
                      <div className="flex-1">
                        <p className={`text-sm ${notif.read ? "font-medium text-gray-600 dark:text-gray-400" : "font-black text-gray-900 dark:text-white"}`}>
                          {notif.title}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">{notif.message}</p>
                        <p className="text-[10px] font-medium text-gray-400 dark:text-gray-500 mt-2 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(notif.createdAt).toLocaleString("vi-VN")}
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNotification(notif._id || notif.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Create Listing Modal */}
      {showCreateModal && (
        <CreateListingModal
          onClose={() => setShowCreateModal(false)}
          ownerId={currentUser.id}
          ownerName={currentUser.name}
          ownerPhone={currentUser.phone}
        />
      )}
    </div>
  );
}
