import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router";
import {
  MapPin,
  Phone,
  Eye,
  Heart,
  Star,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  BedDouble,
  Thermometer,
  Wind,
  UtensilsCrossed,
  Bath,
  ShieldCheck,
  Flag,
  Share2,
  MessageCircle,
  X,
  CheckCircle,
  AlertTriangle,
  Droplets,
  Zap,
  Calendar,
  User,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { useAuth } from "../context/AuthContext";
import api from "../../lib/api";
import { ROOM_TYPE_LABELS, formatPrice, Review, formatDate, formatDateTime, RoomType, getUserAvatar } from "../data/mockData";

export function RoomDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { rooms, reviews, favorites, toggleFavorite, addReview, loadReviews, addReport, incrementViews, getOrCreateConversation, setActiveChat, markChatAsRead } = useApp();
  const { currentUser, isAuthenticated, isRole } = useAuth();

  const roomFromStore = rooms.find((r) => String(r.id) === id || String(r._id) === id);
  const [room, setRoom] = useState<any>(roomFromStore ?? null);
  const [fetchLoading, setFetchLoading] = useState(!roomFromStore);
  const [error, setError] = useState<string | null>(null);

  // Nếu rooms store chưa có (user vào thẳng URL), fetch trực tiếp từ API
  useEffect(() => {
    window.scrollTo(0, 0); // Đảm bảo cuộn lên đầu trang khi vào chi tiết phòng
    
    const fetchRoom = async () => {
      if (!id) return;
      try {
        setFetchLoading(true);
        const res = await api.get(`/rooms/${id}`);
        if (res.data?.success && res.data?.room) {
          setRoom(res.data.room);
          incrementViews(id);
        } else {
          setError("Phòng trọ không tồn tại hoặc đã bị gỡ.");
        }
      } catch (err) {
        console.error("Lỗi fetch chi tiết room:", err);
        setError("Không thể kết nối đến máy chủ.");
      } finally {
        setFetchLoading(false);
      }
    };

    if (!roomFromStore) fetchRoom();
  }, [id, incrementViews, roomFromStore]);
  const [activeImg, setActiveImg] = useState(0);
  const [showReport, setShowReport] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportDesc, setReportDesc] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reportDone, setReportDone] = useState(false);
  const [reviewDone, setReviewDone] = useState(false);

  useEffect(() => {
    if (room?.id) incrementViews(room.id);
  }, [room?.id]);

  if (fetchLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl max-w-md w-full text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="w-10 h-10 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Đã có lỗi xảy ra</h2>
          <p className="text-gray-500 mb-8">{error}</p>
          <div className="flex flex-col gap-3">
            <button 
              onClick={() => window.location.reload()}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-semibold transition-colors"
            >
              Thử lại
            </button>
            <Link 
              to="/search"
              className="w-full border-2 border-gray-100 hover:border-emerald-100 hover:bg-emerald-50 py-3 rounded-xl font-semibold text-gray-600 hover:text-emerald-600 transition-all"
            >
              Quay lại tìm kiếm
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Không tìm thấy phòng trọ này.</p>
          <Link to="/search" className="text-emerald-600 hover:underline">
            Quay lại tìm kiếm
          </Link>
        </div>
      </div>
    );
  }

  const isFavorite = favorites.includes(String(room.id));
  const canFavorite = isAuthenticated && isRole("renter");
  const roomReviews = reviews.filter((r) => String(r.roomId) === String(room.id) && r.status === "approved");
  const avgRating = roomReviews.length
    ? roomReviews.reduce((s, r) => s + r.rating, 0) / roomReviews.length
    : 0;

  // Đảm bảo images luôn là array (API có thể trả string JSON)
  if (!Array.isArray(room.images)) {
    try { room.images = JSON.parse(room.images || '[]'); } catch { room.images = []; }
  }

  const handleFavorite = async () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    const rid = String(room.id);
    const isNowFav = !isFavorite;
    
    // Cập nhật cục bộ để UX mượt mà
    setRoom((prev: any) => ({
      ...prev,
      favorites: isNowFav ? (prev.favorites + 1) : Math.max(0, prev.favorites - 1)
    }));
    
    await toggleFavorite(rid);
  };

  const handleReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportReason) return;
    addReport({
      roomId: room.id,
      userId: currentUser?.id || "anonymous",
      reason: reportReason,
      description: reportDesc,
      status: "pending",
      createdAt: new Date().toISOString().split("T")[0],
    });
    setReportDone(true);
  };

  const handleReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewComment.trim() || !currentUser) return;
    
    // Gửi lên server (Server sẽ tự gán userId, userName, avatar từ Token)
    const reviewData = {
      roomId: Number(room.id),
      rating: reviewRating,
      comment: reviewComment,
    };
    
    await addReview(reviewData);
    setReviewDone(true);
    setShowReviewForm(false);
    setReviewComment("");
    // Tự động load lại danh sách sau khi gửi thành công
    loadReviews(); 
  };

  const handleStartChat = async () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    const ownerId = room.ownerId || room.owner?.id;
    if (!ownerId) return;
    
    // Disable chat with self
    if (String(ownerId) === String(currentUser?.id)) return;

    const conv = await getOrCreateConversation(ownerId, room.id);
    if (conv) {
      if ((conv.unreadCount ?? 0) > 0) {
        markChatAsRead(conv.id);
      }
      // Fetch messages for this conversation
      const res = await api.get(`/chat/conversations/${conv.id}/messages`);
      if (res.data.success) {
        setActiveChat({ ...conv, messages: res.data.messages });
      } else {
        setActiveChat(conv);
      }
    }
  };

  const prevImg = () => setActiveImg((v) => (v === 0 ? (room.images?.length || 1) - 1 : v - 1));
  const nextImg = () => setActiveImg((v) => (v === (room.images?.length || 1) - 1 ? 0 : v + 1));

    // amenities từ API là array string, có thể là JSON string trong store
  const amenitiesList: string[] = (() => {
    const raw = room.amenities;
    if (!raw) return [];
    if (Array.isArray(raw)) return raw;
    try { return JSON.parse(raw); } catch { return [raw]; }
  })();

  const amenityIconMap: Record<string, JSX.Element> = {
    'wifi': <Wind className="w-4 h-4" />,
    'điều hòa': <Wind className="w-4 h-4" />,
    'máy lạnh': <Wind className="w-4 h-4" />,
    'tủ lạnh': <Droplets className="w-4 h-4" />,
    'máy giặt': <Droplets className="w-4 h-4" />,
    'máy giặt chung': <Droplets className="w-4 h-4" />,
    'bếp': <UtensilsCrossed className="w-4 h-4" />,
    'bếp riêng': <UtensilsCrossed className="w-4 h-4" />,
    'bếp chung': <UtensilsCrossed className="w-4 h-4" />,
    'ban công': <Maximize2 className="w-4 h-4" />,
    'gác lửng': <BedDouble className="w-4 h-4" />,
    'bảo vệ': <User className="w-4 h-4" />,
    'bảo vệ 24/7': <User className="w-4 h-4" />,
    'thang máy': <Zap className="w-4 h-4" />,
    'chỗ để xe': <Zap className="w-4 h-4" />,
    'nhà vệ sinh riêng': <Bath className="w-4 h-4" />,
    'nóng lạnh': <Bath className="w-4 h-4" />,
  };

  const facilityItems = amenitiesList.map((a) => ({
    icon: amenityIconMap[a.toLowerCase()] ?? <Zap className="w-4 h-4" />,
    label: a,
    value: "✓",
  }));

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen pb-12">
      {/* Breadcrumb */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-2 text-sm text-gray-500">
          <Link to="/" className="hover:text-emerald-600">Trang chủ</Link>
          <span>/</span>
          <Link to="/search" className="hover:text-emerald-600">Tìm phòng</Link>
          <span>/</span>
          <span className="text-gray-900 dark:text-white line-clamp-1">{room.title}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT */}
          <div className="lg:col-span-2 space-y-5">
            {/* Image Gallery */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm">
              <div className="relative h-64 md:h-96">
                <img
                  src={room.images?.[activeImg] || ""}
                  alt={room.title}
                  className="w-full h-full object-cover"
                />
                {(room.images?.length || 0) > 1 && (
                  <>
                    <button
                      onClick={prevImg}
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/40 hover:bg-black/60 text-white rounded-full flex items-center justify-center"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={nextImg}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/40 hover:bg-black/60 text-white rounded-full flex items-center justify-center"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                )}
                <div className="absolute bottom-3 right-3 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
                  {activeImg + 1}/{(room.images?.length || 0)}
                </div>
                {room.status === "rented" && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <span className="bg-red-500 text-white px-6 py-2 rounded-full font-semibold">
                      Đã có người thuê
                    </span>
                  </div>
                )}
              </div>
              <div className="flex gap-2 p-3 overflow-x-auto">
                {room.images?.map((img: string, i: number) => (
                  <button
                    key={i}
                    onClick={() => setActiveImg(i)}
                    className={`flex-shrink-0 w-16 h-12 rounded-lg overflow-hidden border-2 transition-all ${
                      activeImg === i ? "border-emerald-500" : "border-transparent"
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* Title & Main Info */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm">
              <div className="flex items-start gap-3 mb-3">
                <div className="flex-1">
                  <div className="flex flex-wrap gap-2 mb-2">
                    <span className="bg-emerald-100 text-emerald-700 text-xs px-2.5 py-1 rounded-full font-medium">
                      {ROOM_TYPE_LABELS[room.roomType as RoomType]}
                    </span>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                      room.status === "available" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                    }`}>
                      {room.status === "available" ? "Còn trống" : "Đã có người thuê"}
                    </span>
                  </div>
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white">{room.title}</h1>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  {canFavorite && (
                    <button
                      onClick={handleFavorite}
                      className={`w-9 h-9 rounded-full flex items-center justify-center border transition-colors ${
                        isFavorite ? "bg-red-500 border-red-500 text-white" : "border-gray-200 text-gray-400 hover:border-red-300"
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${isFavorite ? "fill-current" : ""}`} />
                    </button>
                  )}
                  <button className="w-9 h-9 rounded-full flex items-center justify-center border border-gray-200 text-gray-400 hover:border-gray-300">
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-1 text-gray-500 mb-4">
                <MapPin className="w-4 h-4 flex-shrink-0 text-emerald-500" />
                <span className="text-sm">{room.address.full}</span>
              </div>

              <div className="grid grid-cols-3 gap-4 py-4 border-y border-gray-100">
                <div className="text-center">
                  <p className="text-2xl font-bold text-emerald-600">{formatPrice(room.price)}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">/{room.priceUnit === "month" ? "tháng" : room.priceUnit === "quarter" ? "quý" : "năm"}</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">{room.area ?? "—"}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">m² diện tích</p>
                </div>
              </div>

              <div className="flex items-center gap-4 mt-4 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />{room.views} lượt xem
                </span>
                <span className="flex items-center gap-1">
                  <Heart className="w-4 h-4" />{room.favorites} yêu thích
                </span>
                {roomReviews.length > 0 && (
                  <span className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    {avgRating.toFixed(1)} ({roomReviews.length} đánh giá)
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />Đăng ngày {formatDate(room.createdAt)}
                </span>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm">
              <h2 className="font-semibold text-gray-900 dark:text-white mb-3">Mô tả chi tiết</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{room.description}</p>

              {(room.nearBy?.length || 0) > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Gần các địa điểm:</p>
                  <div className="flex flex-wrap gap-2">
                    {room.nearBy?.map((n: string, i: number) => (
                      <span key={i} className="flex items-center gap-1 bg-blue-50 text-blue-700 text-xs px-2.5 py-1 rounded-full">
                        <MapPin className="w-3 h-3" />{n}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Facilities */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm">
              <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Điều kiện cơ sở vật chất</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {facilityItems.map((item, i) => (
                  <div key={i} className="flex flex-col items-center text-center p-3 bg-gray-50 dark:bg-gray-900 rounded-xl">
                    <div className="text-emerald-600 mb-1">{item.icon}</div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{item.label}</p>
                    <p className="text-xs font-medium text-gray-800 mt-0.5">{item.value}</p>
                  </div>
                ))}
              </div>
              {(room.amenities?.length || 0) > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Tiện ích khác:</p>
                  <div className="flex flex-wrap gap-2">
                    {room.amenities?.map((a: string, i: number) => (
                      <span key={i} className="flex items-center gap-1 bg-emerald-50 text-emerald-700 text-xs px-2.5 py-1 rounded-full">
                        <CheckCircle className="w-3 h-3" />{a}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Reviews */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-gray-900 dark:text-white">
                  Đánh giá ({roomReviews.length})
                </h2>
                {isAuthenticated && currentUser?.role === "renter" && !reviewDone && (
                  <button
                    onClick={() => setShowReviewForm(!showReviewForm)}
                    className="text-sm text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1"
                  >
                    <MessageCircle className="w-4 h-4" />Viết đánh giá
                  </button>
                )}
              </div>

              {reviewDone && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 mb-4 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <p className="text-sm text-emerald-700">Đánh giá của bạn đang chờ kiểm duyệt.</p>
                </div>
              )}

              {showReviewForm && (
                <form onSubmit={handleReview} className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4 mb-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Đánh giá của bạn</p>
                  <div className="flex gap-1 mb-3">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setReviewRating(s)}
                        className="focus:outline-none"
                      >
                        <Star className={`w-6 h-6 ${s <= reviewRating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`} />
                      </button>
                    ))}
                  </div>
                  <textarea
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    rows={3}
                    placeholder="Chia sẻ trải nghiệm của bạn về phòng trọ này..."
                    className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-emerald-500 resize-none"
                    required
                  />
                  <div className="flex gap-2 mt-2">
                    <button type="submit" className="bg-emerald-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-emerald-700">
                      Gửi đánh giá
                    </button>
                    <button type="button" onClick={() => setShowReviewForm(false)} className="text-sm text-gray-500 px-4 py-2 rounded-lg hover:bg-gray-100">
                      Hủy
                    </button>
                  </div>
                </form>
              )}

              {roomReviews.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-6">Chưa có đánh giá nào.</p>
              ) : (
                <div className="space-y-4">
                  {roomReviews.map((rev) => (
                    <div key={rev.id} className="flex gap-3">
                      <img 
                        src={getUserAvatar({ avatar: rev.userAvatar, name: rev.userName, gender: rev.userGender })} 
                        alt={rev.userName} 
                        className="w-9 h-9 rounded-full object-cover flex-shrink-0" 
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium text-gray-900 dark:text-white">{rev.userName}</span>
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star key={s} className={`w-3.5 h-3.5 ${s <= rev.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-200"}`} />
                            ))}
                          </div>
                          <span className="text-xs text-gray-400">{formatDateTime(rev.createdAt)}</span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{rev.comment}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Report */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm">
              <button
                onClick={() => setShowReport(!showReport)}
                className="flex items-center gap-2 text-sm text-gray-500 hover:text-red-500 transition-colors"
              >
                <Flag className="w-4 h-4" />Báo cáo bài đăng không hợp lệ
              </button>
              {showReport && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  {reportDone ? (
                    <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 rounded-xl p-3">
                      <CheckCircle className="w-4 h-4" />
                      <p className="text-sm">Báo cáo của bạn đã được gửi. Chúng tôi sẽ xem xét sớm.</p>
                    </div>
                  ) : (
                    <form onSubmit={handleReport} className="space-y-3">
                      <div>
                        <label className="text-xs font-medium text-gray-700 mb-1 block">Lý do báo cáo *</label>
                        <select
                          value={reportReason}
                          onChange={(e) => setReportReason(e.target.value)}
                          className="w-full text-sm border bg-white dark:bg-gray-800 dark:text-white border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 outline-none focus:border-red-400"
                          required
                        >
                          <option value="">Chọn lý do...</option>
                          <option value="Thông tin không chính xác">Thông tin không chính xác</option>
                          <option value="Phòng không tồn tại">Phòng không tồn tại</option>
                          <option value="Giá tiền không đúng">Giá tiền không đúng</option>
                          <option value="Ảnh không phải thực tế">Ảnh không phải thực tế</option>
                          <option value="Lý do khác">Lý do khác</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-700 mb-1 block">Mô tả thêm</label>
                        <textarea
                          value={reportDesc}
                          onChange={(e) => setReportDesc(e.target.value)}
                          rows={2}
                          placeholder="Chi tiết về vấn đề bạn gặp..."
                          className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-red-400 resize-none"
                        />
                      </div>
                      <button type="submit" className="flex items-center gap-1 bg-red-500 text-white text-sm px-4 py-2 rounded-lg hover:bg-red-600">
                        <AlertTriangle className="w-3.5 h-3.5" />Gửi báo cáo
                      </button>
                    </form>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT Sidebar */}
          <div className="space-y-4">
            {/* Contact Card */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm sticky top-24">
              <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-100">
                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center overflow-hidden">
                  <img 
                    src={getUserAvatar(room.owner)} 
                    alt={room.owner?.name} 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">{room.owner?.name || room.ownerName || "Chủ nhà"}</p>
                  <div className="flex items-center gap-1 text-xs text-emerald-600">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Đã xác thực</span>
                  </div>
                </div>
              </div>

              <a
                href={`tel:${room.owner?.phone || room.ownerPhone || ""}`}
                className="flex items-center justify-center gap-2 w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-medium text-sm transition-colors"
              >
                <Phone className="w-4 h-4" />{room.owner?.phone || room.ownerPhone || "Liên hệ chủ nhà"}
              </a>
              
              {isAuthenticated && String(room.ownerId || room.owner?.id) !== String(currentUser?.id) && (
                <button
                  onClick={handleStartChat}
                  className="flex items-center justify-center gap-2 w-full mt-3 bg-white hover:bg-gray-50 text-emerald-600 border-2 border-emerald-600 py-3 rounded-xl font-medium text-sm transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />Nhắn tin cho chủ nhà
                </button>
              )}
              
              <p className="text-xs text-gray-400 text-center mt-2">
                Nhấn để liên hệ trực tiếp cho chủ nhà
              </p>

              <div className="mt-4 pt-4 border-t border-gray-100 space-y-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Thời hạn đăng</span>
                  <span className="text-gray-900 dark:text-white font-medium">{formatDate(room.expiresAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Lượt xem</span>
                  <span className="text-gray-900 dark:text-white font-medium">{room.views}</span>
                </div>
                <div className="flex justify-between">
                  <span>Lượt yêu thích</span>
                  <span className="text-gray-900 dark:text-white font-medium">{room.favorites}</span>
                </div>
              </div>

              {(canFavorite || !isAuthenticated) && (
                <>
                  <button
                    onClick={handleFavorite}
                    className={`flex items-center justify-center gap-2 w-full mt-4 py-3 rounded-xl font-medium text-sm border-2 transition-colors ${
                      isFavorite
                        ? "bg-red-50 border-red-300 text-red-600"
                        : "border-gray-200 text-gray-600 hover:border-red-200 hover:text-red-500"
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${isFavorite ? "fill-current" : ""}`} />
                    {isFavorite ? "Đã lưu yêu thích" : "Lưu vào yêu thích"}
                  </button>

                  {!isAuthenticated && (
                    <p className="text-xs text-gray-400 text-center mt-2">
                      <Link to="/login" className="text-emerald-600 hover:underline">Đăng nhập</Link> để lưu yêu thích
                    </p>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
