import { Link } from "react-router";
import { Heart, Eye, MapPin, Maximize2, BedDouble, Star } from "lucide-react";
import { Room, ROOM_TYPE_LABELS, formatPrice } from "../data/mockData";
import { useAuth } from "../context/AuthContext";
import { useApp } from "../context/AppContext";

interface RoomCardProps {
  room: Room;
  showStatus?: boolean;
}

export function RoomCard({ room, showStatus = false }: RoomCardProps) {
  const { isAuthenticated } = useAuth();
  const { favorites, toggleFavorite, reviews } = useApp();
  const isFavorite = favorites.includes(room.id);

  const handleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isAuthenticated) return;
    toggleFavorite(room.id);
  };

  const roomReviews = reviews.filter((r) => r.roomId === room.id && r.status === "approved");
  const avgRating =
    roomReviews.length > 0
      ? Math.round((roomReviews.reduce((sum, r) => sum + r.rating, 0) / roomReviews.length) * 10) / 10
      : null;

  return (
    <Link to={`/room/${room.id}`} className="group block">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow duration-200">
        {/* Image */}
        <div className="relative h-48 overflow-hidden">
          <img
            src={room.images[0]}
            alt={room.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {/* Status badge */}
          <div className="absolute top-3 left-3 flex gap-2">
            <span className="bg-white/90 dark:bg-gray-800/90 text-gray-700 dark:text-gray-200 text-xs px-2 py-1 rounded-full shadow-sm font-medium backdrop-blur-sm">
              {ROOM_TYPE_LABELS[room.roomType]}
            </span>
          </div>
          {/* Rented badge */}
          {room.status === "rented" && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="bg-red-500 text-white px-4 py-1.5 rounded-full text-sm font-semibold">
                Đã có người thuê
              </span>
            </div>
          )}
          {/* Favorite button */}
          <button
            onClick={handleFavorite}
            className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center shadow-sm transition-all focus:outline-none ${
              isFavorite
                ? "bg-red-500 text-white"
                : "bg-white/90 dark:bg-gray-800/90 text-gray-400 dark:text-gray-300 hover:text-red-500 dark:hover:text-red-400 backdrop-blur-sm"
            }`}
          >
            <Heart className={`w-4 h-4 ${isFavorite ? "fill-current" : ""}`} />
          </button>
          {/* Post status badge (for owner view) */}
          {showStatus && (
            <div className="absolute bottom-3 left-3">
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                room.postStatus === "approved" ? "bg-green-100 text-green-800" :
                room.postStatus === "pending" ? "bg-yellow-100 text-yellow-800" :
                room.postStatus === "rejected" ? "bg-red-100 text-red-800" :
                "bg-gray-100 text-gray-800"
              }`}>
                {room.postStatus === "approved" ? "Đã duyệt" :
                 room.postStatus === "pending" ? "Chờ duyệt" :
                 room.postStatus === "rejected" ? "Bị từ chối" : "Hết hạn"}
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
            {room.title}
          </h3>

          <div className="flex items-center gap-1 mt-1.5 text-gray-500 dark:text-gray-400">
            <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="text-xs line-clamp-1">{room.address.district}, {room.address.city}</span>
          </div>

          <div className="flex items-center gap-3 mt-2 text-xs text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1">
              <Maximize2 className="w-3.5 h-3.5" />{room.area} m²
            </span>
            <span className="flex items-center gap-1">
              <BedDouble className="w-3.5 h-3.5" />{room.roomCount} phòng
            </span>
            {room.hasAC && (
              <span className="flex items-center gap-1">❄️ Điều hòa</span>
            )}
          </div>

          <div className="flex items-center justify-between mt-3">
            <div>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold text-base">
                {formatPrice(room.price)}
              </span>
              <span className="text-gray-400 dark:text-gray-500 text-xs">/{room.priceUnit === "month" ? "tháng" : room.priceUnit === "quarter" ? "quý" : "năm"}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500">
              <span className="flex items-center gap-0.5">
                <Eye className="w-3.5 h-3.5" />{room.views}
              </span>
              <span className="flex items-center gap-0.5">
                <Heart className="w-3.5 h-3.5" />{room.favorites}
              </span>
              {avgRating !== null && (
                <span className="flex items-center gap-0.5">
                  <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />{avgRating}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
