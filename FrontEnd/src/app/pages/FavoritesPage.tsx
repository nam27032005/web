import { Heart, Search } from "lucide-react";
import { Link } from "react-router";
import { useApp } from "../context/AppContext";
import { useAuth } from "../context/AuthContext";
import { RoomCard } from "../components/RoomCard";

export function FavoritesPage() {
  const { currentUser } = useAuth();
  const { rooms, favorites } = useApp();

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center px-4">
        <div>
          <Heart className="w-12 h-12 text-gray-200 mx-auto mb-4" />
          <p className="text-gray-500 mb-4">Bạn cần đăng nhập để xem danh sách yêu thích.</p>
          <Link to="/login" className="bg-emerald-600 text-white px-5 py-2 rounded-xl text-sm font-medium hover:bg-emerald-700">
            Đăng nhập
          </Link>
        </div>
      </div>
    );
  }

  const favoriteRooms = rooms.filter((r) => favorites.includes(r.id));

  return (
    <div className="bg-gray-50 min-h-screen pb-12">
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Heart className="w-5 h-5 text-red-500 fill-red-500" />
            Danh sách yêu thích
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {favoriteRooms.length} phòng đã lưu
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {favoriteRooms.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
            <Heart className="w-14 h-14 text-gray-200 mx-auto mb-4" />
            <h2 className="font-semibold text-gray-900 mb-2">Chưa có phòng yêu thích</h2>
            <p className="text-sm text-gray-500 mb-6">
              Lưu những phòng trọ ưng ý để xem lại dễ dàng sau này
            </p>
            <Link
              to="/search"
              className="inline-flex items-center gap-2 bg-emerald-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-emerald-700 transition-colors"
            >
              <Search className="w-4 h-4" />Tìm phòng ngay
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {favoriteRooms.map((room) => (
              <RoomCard key={room.id} room={room} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
