import { useState } from "react";
import { Link, useNavigate } from "react-router";
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
  const { rooms, updateRoom, notifications, getNotificationsForUser, chatMessages, sendChatMessage } =
    useApp();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<DashboardTab>("listings");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [chatMsg, setChatMsg] = useState("");

  if (!currentUser || currentUser.role !== "owner") {
    return (
      <div className="min-h-screen flex items-center justify-center text-center px-4">
        <div>
          <p className="text-gray-500 mb-4">Bạn cần đăng nhập với tư cách chủ nhà trọ.</p>
          <Link to="/login" className="text-emerald-600 hover:underline">Đăng nhập</Link>
        </div>
      </div>
    );
  }

  const myRooms = rooms.filter((r) => r.ownerId === currentUser.id);
  const myNotifs = getNotificationsForUser(currentUser.id);
  const unreadNotifs = myNotifs.filter((n) => !n.read).length;

  // Chat messages with admin
  const adminId = "admin-001";
  const myChats = chatMessages.filter(
    (m) =>
      (m.fromId === currentUser.id && m.toId === adminId) ||
      (m.fromId === adminId && m.toId === currentUser.id)
  );

  const stats = {
    total: myRooms.length,
    approved: myRooms.filter((r) => r.postStatus === "approved").length,
    pending: myRooms.filter((r) => r.postStatus === "pending").length,
    rejected: myRooms.filter((r) => r.postStatus === "rejected").length,
    totalViews: myRooms.reduce((s, r) => s + r.views, 0),
    totalFavorites: myRooms.reduce((s, r) => s + r.favorites, 0),
  };

  const handleStatusToggle = (room: Room) => {
    updateRoom(room.id, {
      status: room.status === "available" ? "rented" : "available",
    });
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMsg.trim()) return;
    sendChatMessage({
      fromId: currentUser.id,
      fromName: currentUser.name,
      toId: adminId,
      message: chatMsg,
      timestamp: new Date().toISOString(),
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
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Quản lý bài đăng</h1>
              <p className="text-sm text-gray-500 mt-0.5">
                Xin chào, {currentUser.name}!{" "}
                {!currentUser.verified && (
                  <span className="text-amber-600">(Tài khoản chưa được xác nhận)</span>
                )}
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors"
            >
              <Plus className="w-4 h-4" />
              Đăng bài mới
            </button>
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
                    : "text-gray-600 hover:bg-gray-100"
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
                <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
                  <Home className="w-12 h-12 text-gray-200 mx-auto mb-3" />
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
                  <div key={room.id} className="bg-white rounded-2xl border border-gray-100 p-4 flex gap-4 items-start">
                    <img
                      src={room.images[0]}
                      alt={room.title}
                      className="w-20 h-16 rounded-xl object-cover flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="text-sm font-semibold text-gray-900 line-clamp-1">{room.title}</h3>
                          <p className="text-xs text-gray-500 mt-0.5">{room.address.full}</p>
                        </div>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${POST_STATUS_COLORS[room.postStatus]}`}>
                          {POST_STATUS_LABELS[room.postStatus]}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 mt-2">
                        <span className="text-sm font-semibold text-emerald-600">{formatPrice(room.price)}/tháng</span>
                        <span className="text-xs text-gray-400">{room.area}m²</span>
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
                          to={`/room/${room.id}`}
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
                  <p className="text-2xl font-bold text-gray-900">{s.value}</p>
                  <p className="text-sm text-gray-600 mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <h3 className="font-semibold text-gray-900 mb-4">Chi tiết từng bài đăng</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 text-left text-gray-500 text-xs">
                      <th className="pb-3 font-medium">Bài đăng</th>
                      <th className="pb-3 font-medium">Lượt xem</th>
                      <th className="pb-3 font-medium">Yêu thích</th>
                      <th className="pb-3 font-medium">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {myRooms.map((room) => (
                      <tr key={room.id}>
                        <td className="py-3 pr-4">
                          <p className="font-medium text-gray-900 line-clamp-1">{room.title}</p>
                          <p className="text-xs text-gray-400">{room.address.district}</p>
                        </td>
                        <td className="py-3 pr-4">
                          <div className="flex items-center gap-1">
                            <Eye className="w-3.5 h-3.5 text-gray-400" />
                            <span className="font-medium">{room.views}</span>
                          </div>
                        </td>
                        <td className="py-3 pr-4">
                          <div className="flex items-center gap-1">
                            <Heart className="w-3.5 h-3.5 text-gray-400" />
                            <span className="font-medium">{room.favorites}</span>
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

        {/* Chat Tab */}
        {activeTab === "chat" && (
          <div className="bg-white rounded-2xl border border-gray-100 flex flex-col" style={{ height: "500px" }}>
            <div className="p-4 border-b border-gray-100 flex items-center gap-3">
              <div className="w-9 h-9 bg-purple-100 rounded-full flex items-center justify-center">
                <MessageCircle className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-sm">AccomodCorp Admin</p>
                <p className="text-xs text-green-500">● Đang hoạt động</p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {myChats.length === 0 && (
                <p className="text-center text-sm text-gray-400 mt-10">
                  Chưa có tin nhắn nào. Hãy bắt đầu cuộc trò chuyện!
                </p>
              )}
              {myChats.map((msg) => {
                const isMe = msg.fromId === currentUser.id;
                return (
                  <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm ${
                      isMe ? "bg-emerald-600 text-white" : "bg-gray-100 text-gray-800"
                    }`}>
                      <p>{msg.message}</p>
                      <p className={`text-xs mt-1 ${isMe ? "text-emerald-200" : "text-gray-400"}`}>
                        {new Date(msg.timestamp).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <form onSubmit={handleSendChat} className="p-3 border-t border-gray-100 flex gap-2">
              <input
                type="text"
                value={chatMsg}
                onChange={(e) => setChatMsg(e.target.value)}
                placeholder="Nhập tin nhắn..."
                className="flex-1 text-sm border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:border-emerald-500"
              />
              <button
                type="submit"
                className="bg-emerald-600 text-white px-4 py-2 rounded-xl hover:bg-emerald-700 transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === "notifications" && (
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            {myNotifs.length === 0 ? (
              <div className="text-center py-12">
                <Bell className="w-10 h-10 text-gray-200 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">Không có thông báo nào.</p>
              </div>
            ) : (
              myNotifs.map((notif) => (
                <div
                  key={notif.id}
                  className={`p-4 border-b border-gray-50 last:border-0 ${!notif.read ? "bg-emerald-50" : ""}`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                      notif.type === "approval" ? "bg-green-500" :
                      notif.type === "rejection" ? "bg-red-500" :
                      notif.type === "status" ? "bg-blue-500" :
                      "bg-gray-400"
                    }`} />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{notif.title}</p>
                      <p className="text-sm text-gray-600 mt-0.5">{notif.message}</p>
                      <p className="text-xs text-gray-400 mt-1">{notif.createdAt}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
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
