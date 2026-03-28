import { useState } from "react";
import {
  CheckCircle,
  XCircle,
  Eye,
  Users,
  FileText,
  BarChart2,
  MessageCircle,
  Bell,
  AlertTriangle,
  RefreshCw,
  Shield,
  ShieldOff,
  Send,
  TrendingUp,
  MapPin,
  Star,
  Clock,
  Flag,
} from "lucide-react";
import { Link } from "react-router";
import { useAuth } from "../context/AuthContext";
import { useApp } from "../context/AppContext";
import {
  USERS,
  POST_STATUS_COLORS,
  POST_STATUS_LABELS,
  formatPrice,
  ROOM_TYPE_LABELS,
} from "../data/mockData";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

type AdminTab = "posts" | "users" | "stats" | "chat" | "notifications" | "reports";

export function AdminDashboard() {
  const { currentUser } = useAuth();
  const {
    rooms,
    reviews,
    notifications,
    chatMessages,
    reports,
    approveRoom,
    rejectRoom,
    approveReview,
    rejectReview,
    resolveReport,
    sendChatMessage,
    getNotificationsForUser,
  } = useApp();

  const [activeTab, setActiveTab] = useState<AdminTab>("posts");
  const [selectedOwner, setSelectedOwner] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectTarget, setRejectTarget] = useState<string | null>(null);
  const [chatMsg, setChatMsg] = useState("");

  if (!currentUser || currentUser.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center text-center px-4">
        <div>
          <p className="text-gray-500 mb-4">Bạn cần đăng nhập với tư cách Admin.</p>
          <Link to="/login" className="text-emerald-600 hover:underline">Đăng nhập</Link>
        </div>
      </div>
    );
  }

  const adminNotifs = getNotificationsForUser(currentUser.id);
  const pendingRooms = rooms.filter((r) => r.postStatus === "pending");
  const pendingReviews = reviews.filter((r) => r.status === "pending");
  const owners = USERS.filter((u) => u.role === "owner");

  // Chat with selected owner
  const ownerChats = selectedOwner
    ? chatMessages.filter(
        (m) =>
          (m.fromId === selectedOwner && m.toId === currentUser.id) ||
          (m.fromId === currentUser.id && m.toId === selectedOwner)
      )
    : [];

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMsg.trim() || !selectedOwner) return;
    const owner = USERS.find((u) => u.id === selectedOwner);
    sendChatMessage({
      fromId: currentUser.id,
      fromName: currentUser.name,
      toId: selectedOwner,
      message: chatMsg,
      timestamp: new Date().toISOString(),
    });
    setChatMsg("");
  };

  const handleReject = (roomId: string) => {
    if (!rejectReason.trim()) return;
    rejectRoom(roomId, rejectReason);
    setRejectTarget(null);
    setRejectReason("");
  };

  // Stats data
  const roomsByType = [
    { name: "Phòng trọ", value: rooms.filter((r) => r.roomType === "phong_tro" && r.postStatus === "approved").length },
    { name: "CC Mini", value: rooms.filter((r) => r.roomType === "chung_cu_mini" && r.postStatus === "approved").length },
    { name: "Nhà nguyên căn", value: rooms.filter((r) => r.roomType === "nha_nguyen_can" && r.postStatus === "approved").length },
    { name: "CC nguyên căn", value: rooms.filter((r) => r.roomType === "chung_cu_nguyen_can" && r.postStatus === "approved").length },
  ];

  const viewsByRoom = rooms
    .filter((r) => r.postStatus === "approved")
    .sort((a, b) => b.views - a.views)
    .slice(0, 5)
    .map((r) => ({ name: r.title.slice(0, 20) + "...", views: r.views, favorites: r.favorites }));

  const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444"];

  const postStatusData = [
    { name: "Đã duyệt", value: rooms.filter((r) => r.postStatus === "approved").length },
    { name: "Chờ duyệt", value: rooms.filter((r) => r.postStatus === "pending").length },
    { name: "Từ chối", value: rooms.filter((r) => r.postStatus === "rejected").length },
  ];

  const TABS: { id: AdminTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: "posts", label: "Quản lý bài đăng", icon: <FileText className="w-4 h-4" />, badge: pendingRooms.length },
    { id: "users", label: "Tài khoản chủ nhà", icon: <Users className="w-4 h-4" /> },
    { id: "reports", label: "Báo cáo vi phạm", icon: <Flag className="w-4 h-4" />, badge: reports.filter(r => r.status === "pending").length },
    { id: "stats", label: "Thống kê", icon: <BarChart2 className="w-4 h-4" /> },
    { id: "chat", label: "Chat", icon: <MessageCircle className="w-4 h-4" /> },
    { id: "notifications", label: "Thông báo", icon: <Bell className="w-4 h-4" />, badge: adminNotifs.filter(n => !n.read).length },
  ];

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Shield className="w-5 h-5 text-emerald-600" />
                Bảng điều khiển Admin
              </h1>
              <p className="text-sm text-gray-500">AccomodCorp · {currentUser.name}</p>
            </div>
          </div>

          {/* Summary cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
            {[
              { label: "Tổng bài đăng", value: rooms.length, color: "text-blue-600", bg: "bg-blue-50" },
              { label: "Chờ duyệt", value: pendingRooms.length, color: "text-yellow-600", bg: "bg-yellow-50" },
              { label: "Chủ nhà", value: owners.length, color: "text-purple-600", bg: "bg-purple-50" },
              { label: "Bình luận chờ", value: pendingReviews.length, color: "text-pink-600", bg: "bg-pink-50" },
              { label: "Báo cáo", value: reports.filter(r => r.status === "pending").length, color: "text-red-600", bg: "bg-red-50" },
            ].map((s, i) => (
              <div key={i} className={`${s.bg} rounded-xl p-3 text-center`}>
                <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                <p className="text-xs text-gray-600 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="flex gap-1 overflow-x-auto">
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
        {/* Posts Management */}
        {activeTab === "posts" && (
          <div className="space-y-4">
            <h2 className="font-semibold text-gray-900">Tất cả bài đăng</h2>
            {rooms.map((room) => (
              <div key={room.id} className="bg-white rounded-2xl border border-gray-100 p-4">
                <div className="flex gap-4 items-start">
                  <img src={room.images[0]} alt="" className="w-20 h-16 rounded-xl object-cover flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="text-sm font-semibold text-gray-900 line-clamp-1">{room.title}</h3>
                        <p className="text-xs text-gray-500 mt-0.5">{room.ownerName} · {room.createdAt}</p>
                        <p className="text-xs text-gray-400">{room.address.full}</p>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${POST_STATUS_COLORS[room.postStatus]}`}>
                        {POST_STATUS_LABELS[room.postStatus]}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-gray-500">
                      <span>{formatPrice(room.price)}/tháng</span>
                      <span>{room.area}m²</span>
                      <span className="flex items-center gap-0.5"><Eye className="w-3 h-3" />{room.views}</span>
                      <span>{ROOM_TYPE_LABELS[room.roomType]}</span>
                    </div>

                    {room.postStatus === "rejected" && room.rejectedReason && (
                      <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />Lý do từ chối: {room.rejectedReason}
                      </p>
                    )}

                    <div className="flex flex-wrap gap-2 mt-3">
                      <Link
                        to={`/room/${room.id}`}
                        className="flex items-center gap-1 text-xs text-gray-600 border border-gray-200 px-2.5 py-1.5 rounded-lg hover:bg-gray-50"
                      >
                        <Eye className="w-3 h-3" />Xem chi tiết
                      </Link>

                      {room.postStatus === "pending" && (
                        <>
                          <button
                            onClick={() => approveRoom(room.id)}
                            className="flex items-center gap-1 text-xs text-green-700 border border-green-300 bg-green-50 px-2.5 py-1.5 rounded-lg hover:bg-green-100"
                          >
                            <CheckCircle className="w-3 h-3" />Phê duyệt
                          </button>
                          <button
                            onClick={() => setRejectTarget(room.id)}
                            className="flex items-center gap-1 text-xs text-red-700 border border-red-300 bg-red-50 px-2.5 py-1.5 rounded-lg hover:bg-red-100"
                          >
                            <XCircle className="w-3 h-3" />Từ chối
                          </button>
                        </>
                      )}

                      {room.postStatus === "rejected" && (
                        <button
                          onClick={() => approveRoom(room.id)}
                          className="flex items-center gap-1 text-xs text-blue-700 border border-blue-300 bg-blue-50 px-2.5 py-1.5 rounded-lg hover:bg-blue-100"
                        >
                          <RefreshCw className="w-3 h-3" />Khôi phục
                        </button>
                      )}
                    </div>

                    {/* Reject reason input */}
                    {rejectTarget === room.id && (
                      <div className="mt-3 flex gap-2">
                        <input
                          type="text"
                          value={rejectReason}
                          onChange={(e) => setRejectReason(e.target.value)}
                          placeholder="Nhập lý do từ chối..."
                          className="flex-1 text-sm border border-red-300 rounded-lg px-3 py-2 outline-none focus:border-red-500"
                          autoFocus
                        />
                        <button
                          onClick={() => handleReject(room.id)}
                          className="text-xs bg-red-500 text-white px-3 py-2 rounded-lg hover:bg-red-600"
                        >
                          Xác nhận
                        </button>
                        <button
                          onClick={() => { setRejectTarget(null); setRejectReason(""); }}
                          className="text-xs text-gray-500 px-3 py-2 rounded-lg hover:bg-gray-100"
                        >
                          Hủy
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Pending Reviews */}
            {pendingReviews.length > 0 && (
              <div className="mt-6">
                <h2 className="font-semibold text-gray-900 mb-3">Bình luận chờ kiểm duyệt ({pendingReviews.length})</h2>
                {pendingReviews.map((rev) => (
                  <div key={rev.id} className="bg-white rounded-2xl border border-gray-100 p-4 mb-3">
                    <div className="flex items-start gap-3">
                      <img src={rev.userAvatar} alt="" className="w-8 h-8 rounded-full object-cover" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{rev.userName}</p>
                        <div className="flex gap-0.5 my-1">
                          {[1,2,3,4,5].map(s => (
                            <Star key={s} className={`w-3 h-3 ${s <= rev.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-200"}`} />
                          ))}
                        </div>
                        <p className="text-sm text-gray-600">{rev.comment}</p>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => approveReview(rev.id)} className="text-xs bg-green-100 text-green-700 px-3 py-1.5 rounded-lg hover:bg-green-200">Duyệt</button>
                        <button onClick={() => rejectReview(rev.id)} className="text-xs bg-red-100 text-red-700 px-3 py-1.5 rounded-lg hover:bg-red-200">Từ chối</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Users Management */}
        {activeTab === "users" && (
          <div className="space-y-3">
            <h2 className="font-semibold text-gray-900">Danh sách chủ nhà trọ</h2>
            {owners.map((owner) => {
              const ownerRooms = rooms.filter((r) => r.ownerId === owner.id);
              return (
                <div key={owner.id} className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-4">
                  <img src={owner.avatar} alt={owner.name} className="w-12 h-12 rounded-full object-cover flex-shrink-0" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="font-semibold text-gray-900">{owner.name}</p>
                      {owner.verified ? (
                        <span className="flex items-center gap-0.5 text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                          <Shield className="w-3 h-3" />Đã xác nhận
                        </span>
                      ) : (
                        <span className="flex items-center gap-0.5 text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                          <AlertTriangle className="w-3 h-3" />Chờ xác nhận
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">{owner.email} · {owner.phone}</p>
                    <p className="text-xs text-gray-400">CCCD: {owner.cccd} · {owner.address}</p>
                    <p className="text-xs text-gray-400 mt-0.5">Tổng bài đăng: {ownerRooms.length}</p>
                  </div>
                  <div className="flex gap-2">
                    {!owner.verified && (
                      <button className="flex items-center gap-1 text-xs bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-lg hover:bg-emerald-200">
                        <CheckCircle className="w-3 h-3" />Xác nhận
                      </button>
                    )}
                    <button
                      onClick={() => { setSelectedOwner(owner.id); setActiveTab("chat"); }}
                      className="flex items-center gap-1 text-xs border border-gray-200 text-gray-600 px-3 py-1.5 rounded-lg hover:bg-gray-50"
                    >
                      <MessageCircle className="w-3 h-3" />Chat
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Reports */}
        {activeTab === "reports" && (
          <div className="space-y-3">
            <h2 className="font-semibold text-gray-900">Báo cáo vi phạm</h2>
            {reports.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
                <Flag className="w-10 h-10 text-gray-200 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">Không có báo cáo nào.</p>
              </div>
            ) : (
              reports.map((report) => {
                const room = rooms.find((r) => r.id === report.roomId);
                return (
                  <div key={report.id} className="bg-white rounded-2xl border border-gray-100 p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Flag className="w-4 h-4 text-red-500" />
                          <p className="font-medium text-gray-900">{report.reason}</p>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${report.status === "pending" ? "bg-yellow-100 text-yellow-700" : "bg-green-100 text-green-700"}`}>
                            {report.status === "pending" ? "Chờ xử lý" : "Đã giải quyết"}
                          </span>
                        </div>
                        {room && (
                          <p className="text-xs text-gray-500 mb-1">
                            Bài đăng: <Link to={`/room/${room.id}`} className="text-emerald-600 hover:underline">{room.title}</Link>
                          </p>
                        )}
                        <p className="text-sm text-gray-600">{report.description}</p>
                        <p className="text-xs text-gray-400 mt-1">{report.createdAt}</p>
                      </div>
                      {report.status === "pending" && (
                        <button
                          onClick={() => resolveReport(report.id)}
                          className="text-xs bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-lg hover:bg-emerald-200 ml-3 flex-shrink-0"
                        >
                          Đã giải quyết
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Statistics */}
        {activeTab === "stats" && (
          <div className="space-y-5">
            <h2 className="font-semibold text-gray-900">Thống kê & Phân tích xu hướng</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Top viewed rooms */}
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                  Bài đăng được xem nhiều nhất
                </h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={viewsByRoom} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 11 }} />
                    <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Bar dataKey="views" fill="#10b981" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Post status */}
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-emerald-600" />
                  Trạng thái bài đăng
                </h3>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={postStatusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {postStatusData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Room types */}
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-emerald-600" />
                  Phân bố loại phòng
                </h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={roomsByType}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Số phòng" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Top info */}
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-500" />
                  Thống kê tổng hợp
                </h3>
                <div className="space-y-3">
                  {[
                    { label: "Tổng lượt xem tất cả bài", value: rooms.reduce((s, r) => s + r.views, 0).toLocaleString() },
                    { label: "Tổng lượt yêu thích", value: rooms.reduce((s, r) => s + r.favorites, 0).toLocaleString() },
                    { label: "Phòng đang cho thuê", value: rooms.filter(r => r.status === "rented").length },
                    { label: "Phòng còn trống (đã duyệt)", value: rooms.filter(r => r.status === "available" && r.postStatus === "approved").length },
                    { label: "Bài đăng được duyệt", value: rooms.filter(r => r.postStatus === "approved").length },
                    { label: "Đánh giá đã duyệt", value: reviews.filter(r => r.status === "approved").length },
                  ].map((item, i) => (
                    <div key={i} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                      <span className="text-sm text-gray-600">{item.label}</span>
                      <span className="font-bold text-gray-900">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Chat */}
        {activeTab === "chat" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Owner list */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div className="p-4 border-b border-gray-100">
                <p className="font-semibold text-gray-900 text-sm">Danh sách chủ nhà</p>
              </div>
              <div className="divide-y divide-gray-50">
                {owners.map((owner) => {
                  const ownerMsgs = chatMessages.filter(
                    (m) =>
                      (m.fromId === owner.id && m.toId === currentUser.id) ||
                      (m.fromId === currentUser.id && m.toId === owner.id)
                  );
                  const lastMsg = ownerMsgs[ownerMsgs.length - 1];
                  return (
                    <button
                      key={owner.id}
                      onClick={() => setSelectedOwner(owner.id)}
                      className={`w-full p-3 flex items-start gap-3 hover:bg-gray-50 transition-colors text-left ${selectedOwner === owner.id ? "bg-emerald-50" : ""}`}
                    >
                      <img src={owner.avatar} alt={owner.name} className="w-9 h-9 rounded-full object-cover flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">{owner.name}</p>
                        {lastMsg && (
                          <p className="text-xs text-gray-400 line-clamp-1">{lastMsg.message}</p>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Chat window */}
            <div className="md:col-span-2 bg-white rounded-2xl border border-gray-100 flex flex-col" style={{ height: "450px" }}>
              {selectedOwner ? (
                <>
                  <div className="p-4 border-b border-gray-100">
                    {(() => {
                      const owner = USERS.find((u) => u.id === selectedOwner);
                      return (
                        <div className="flex items-center gap-2">
                          <img src={owner?.avatar} alt="" className="w-8 h-8 rounded-full object-cover" />
                          <div>
                            <p className="font-semibold text-gray-900 text-sm">{owner?.name}</p>
                            <p className="text-xs text-gray-400">{owner?.phone}</p>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                  <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {ownerChats.map((msg) => {
                      const isAdmin = msg.fromId === currentUser.id;
                      return (
                        <div key={msg.id} className={`flex ${isAdmin ? "justify-end" : "justify-start"}`}>
                          <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm ${isAdmin ? "bg-emerald-600 text-white" : "bg-gray-100 text-gray-800"}`}>
                            <p>{msg.message}</p>
                            <p className={`text-xs mt-1 ${isAdmin ? "text-emerald-200" : "text-gray-400"}`}>
                              {new Date(msg.timestamp).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                    {ownerChats.length === 0 && (
                      <p className="text-center text-sm text-gray-400 mt-10">Chưa có tin nhắn với chủ nhà này.</p>
                    )}
                  </div>
                  <form onSubmit={handleSendChat} className="p-3 border-t border-gray-100 flex gap-2">
                    <input
                      type="text"
                      value={chatMsg}
                      onChange={(e) => setChatMsg(e.target.value)}
                      placeholder="Nhập tin nhắn..."
                      className="flex-1 text-sm border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:border-emerald-500"
                    />
                    <button type="submit" className="bg-emerald-600 text-white px-4 py-2 rounded-xl hover:bg-emerald-700">
                      <Send className="w-4 h-4" />
                    </button>
                  </form>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <p className="text-sm text-gray-400">Chọn một chủ nhà để bắt đầu trò chuyện</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Notifications */}
        {activeTab === "notifications" && (
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-100">
              <p className="font-semibold text-gray-900">Thông báo hệ thống</p>
            </div>
            {adminNotifs.length === 0 ? (
              <div className="text-center py-12">
                <Bell className="w-10 h-10 text-gray-200 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">Không có thông báo.</p>
              </div>
            ) : (
              adminNotifs.map((notif) => (
                <div key={notif.id} className={`p-4 border-b border-gray-50 last:border-0 ${!notif.read ? "bg-blue-50" : ""}`}>
                  <div className="flex items-start gap-3">
                    <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${!notif.read ? "bg-blue-500" : "bg-gray-300"}`} />
                    <div>
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
    </div>
  );
}
