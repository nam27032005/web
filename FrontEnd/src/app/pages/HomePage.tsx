import { useState } from "react";
import { useNavigate, Link } from "react-router";
import {
  Search,
  MapPin,
  TrendingUp,
  Shield,
  Clock,
  Star,
  ChevronRight,
  Building,
  Home,
  Building2,
  Hotel,
} from "lucide-react";
import { RoomCard } from "../components/RoomCard";
import { useApp } from "../context/AppContext";
import { ROOM_TYPE_LABELS, RoomType } from "../data/mockData";

const CITIES = ["TP. Hồ Chí Minh", "Hà Nội", "Đà Nẵng", "Cần Thơ", "Bình Dương"];

const DISTRICTS_BY_CITY: Record<string, string[]> = {
  "TP. Hồ Chí Minh": ["Quận 1", "Quận 3", "Quận 7", "Quận 9", "Quận 10", "Quận Bình Thạnh", "Quận Gò Vấp"],
  "Hà Nội": ["Quận Đống Đa", "Quận Hai Bà Trưng", "Quận Cầu Giấy", "Quận Thanh Xuân", "Quận Hoàng Mai", "Quận Ba Đình", "Quận Long Biên"],
  "Đà Nẵng": ["Quận Hải Châu", "Quận Thanh Khê", "Quận Sơn Trà", "Quận Ngũ Hành Sơn", "Quận Liên Chiểu"],
  "Cần Thơ": ["Quận Ninh Kiều", "Quận Bình Thủy", "Quận Cái Răng", "Quận Ô Môn"],
  "Bình Dương": ["TP. Thủ Dầu Một", "TP. Dĩ An", "TP. Thuận An", "Huyện Bến Cát"],
};

const ROOM_TYPE_ICONS: Record<RoomType, React.ReactNode> = {
  phong_tro: <Home className="w-6 h-6" />,
  chung_cu_mini: <Building className="w-6 h-6" />,
  nha_nguyen_can: <Building2 className="w-6 h-6" />,
  chung_cu_nguyen_can: <Hotel className="w-6 h-6" />,
};

const ROOM_TYPES: RoomType[] = ["phong_tro", "chung_cu_mini", "nha_nguyen_can", "chung_cu_nguyen_can"];

export function HomePage() {
  const { rooms } = useApp();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState("TP. Hồ Chí Minh");

  const approvedRooms = rooms
    .filter((r) => r.postStatus === "approved" && r.status === "available")
    .slice(0, 6);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery) params.set("q", searchQuery);
    if (selectedCity) params.set("city", selectedCity);
    navigate(`/search?${params.toString()}`);
  };

  const handleTypeSearch = (type: RoomType) => {
    navigate(`/search?type=${type}`);
  };

  const stats = {
    totalListings: rooms.filter((r) => r.postStatus === "approved").length,
    totalCities: 5,
    totalOwners: 3,
    successRate: 98,
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Hero Section */}
      <section
        className="relative min-h-[520px] flex items-center"
        style={{
          backgroundImage: `linear-gradient(135deg, rgba(5,150,105,0.92) 0%, rgba(6,78,59,0.88) 100%), url(https://images.unsplash.com/photo-1592982349567-c2d4873cfce9?w=1400&h=800&fit=crop)`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-16">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-white/20 text-white px-4 py-1.5 rounded-full text-sm mb-4">
              <TrendingUp className="w-4 h-4" />
              <span>Hơn {stats.totalListings}+ phòng đang cho thuê</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
              Tìm phòng trọ phù hợp<br />
              <span className="text-emerald-300">nhanh chóng & dễ dàng</span>
            </h1>
            <p className="text-emerald-100 text-lg max-w-2xl mx-auto">
              7 Trọ kết nối người thuê và chủ nhà uy tín, minh bạch. Hàng nghìn căn phòng đang chờ bạn.
            </p>
          </div>

          {/* Search Box */}
          <div className="max-w-3xl mx-auto">
            <form
              onSubmit={handleSearch}
              className="bg-white rounded-2xl shadow-xl p-2 flex flex-col sm:flex-row gap-2"
            >
              <div className="flex items-center gap-2 flex-1 px-3">
                <Search className="w-5 h-5 text-gray-400 flex-shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm theo địa chỉ, tên đường, trường đại học..."
                  className="flex-1 text-sm outline-none text-gray-700 placeholder-gray-400 bg-transparent"
                />
              </div>
              <div className="flex items-center gap-2 px-3 border-l border-gray-200">
                <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="text-sm text-gray-700 outline-none bg-transparent cursor-pointer"
                >
                  {CITIES.map((c) => (
                    <option key={c} value={c} className="text-gray-900">{c}</option>
                  ))}
                </select>
              </div>
              <button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl text-sm font-medium transition-colors flex items-center gap-2 justify-center"
              >
                <Search className="w-4 h-4" />Tìm kiếm
              </button>
            </form>

            {/* Quick filters */}
            <div className="flex flex-wrap gap-2 mt-4 justify-center">
              {(DISTRICTS_BY_CITY[selectedCity] ?? []).slice(0, 5).map((d) => (
                <button
                  key={d}
                  onClick={() => navigate(`/search?district=${encodeURIComponent(d)}`)}
                  className="bg-white/20 hover:bg-white/30 text-white text-xs px-3 py-1.5 rounded-full transition-colors border border-white/30"
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-gray-100 dark:divide-gray-700">
            {[
              { label: "Bài đăng đang hoạt động", value: `${stats.totalListings}+`, icon: <Building2 className="w-5 h-5 text-emerald-600" /> },
              { label: "Tỉnh/Thành phố", value: `${stats.totalCities}`, icon: <MapPin className="w-5 h-5 text-blue-500" /> },
              { label: "Chủ nhà uy tín", value: `${stats.totalOwners}+`, icon: <Shield className="w-5 h-5 text-purple-500" /> },
              { label: "Tỷ lệ hài lòng", value: `${stats.successRate}%`, icon: <Star className="w-5 h-5 text-yellow-500" /> },
            ].map((s, i) => (
              <div key={i} className="flex flex-col items-center py-6 px-4">
                <div className="mb-2">{s.icon}</div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{s.value}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Room Types */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Loại phòng phổ biến</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {ROOM_TYPES.map((type) => {
              const count = rooms.filter((r) => r.roomType === type && r.postStatus === "approved").length;
              return (
                <button
                  key={type}
                  onClick={() => handleTypeSearch(type)}
                  className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-5 flex flex-col items-center gap-3 hover:border-emerald-300 dark:hover:border-emerald-500 hover:shadow-md transition-all group"
                >
                  <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/50 transition-colors">
                    {ROOM_TYPE_ICONS[type]}
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{ROOM_TYPE_LABELS[type]}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{count} phòng</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Listings */}
      <section className="pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Phòng trọ nổi bật</h2>
            <Link
              to="/search"
              className="flex items-center gap-1 text-sm text-emerald-600 hover:text-emerald-700 font-medium"
            >
              Xem tất cả <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          {approvedRooms.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-10">Chưa có phòng trọ nào được đăng.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {approvedRooms.map((room) => (
                <RoomCard key={room.id} room={room} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-white dark:bg-gray-800 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-3">Cách thức hoạt động</h2>
          <p className="text-gray-500 dark:text-gray-400 text-center mb-10">Tìm phòng chỉ trong vài bước đơn giản</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                icon: <Search className="w-7 h-7 text-emerald-600" />,
                title: "Tìm kiếm phòng",
                desc: "Nhập địa điểm, loại phòng và các tiêu chí mong muốn để tìm phòng phù hợp.",
              },
              {
                step: "02",
                icon: <Star className="w-7 h-7 text-emerald-600" />,
                title: "Xem & So sánh",
                desc: "Xem ảnh thực tế, đọc đánh giá và lưu những phòng ưa thích vào danh sách.",
              },
              {
                step: "03",
                icon: <Shield className="w-7 h-7 text-emerald-600" />,
                title: "Liên hệ chủ nhà",
                desc: "Kết nối trực tiếp với chủ nhà đã được xác thực, đặt lịch xem phòng ngay.",
              },
            ].map((item, i) => (
              <div key={i} className="text-center">
                <div className="relative inline-flex">
                  <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    {item.icon}
                  </div>
                  <span className="absolute -top-2 -right-2 w-6 h-6 bg-emerald-600 text-white text-xs rounded-full flex items-center justify-center font-bold">
                    {item.step}
                  </span>
                </div>
                <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-2">{item.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            className="rounded-3xl p-8 md:p-12 text-white text-center"
            style={{
              background: "linear-gradient(135deg, #059669 0%, #047857 100%)",
            }}
          >
            <h2 className="text-2xl md:text-3xl font-bold mb-3">
              Bạn là chủ nhà trọ? Đăng tin ngay!
            </h2>
            <p className="text-emerald-100 mb-6 max-w-xl mx-auto">
              Tiếp cận hàng ngàn người thuê trọ tiềm năng. Đăng tin nhanh chóng, quản lý dễ dàng.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to="/register?role=owner"
                className="bg-white text-emerald-700 px-6 py-3 rounded-xl font-semibold hover:bg-emerald-50 transition-colors"
              >
                Đăng ký làm chủ nhà
              </Link>
              <Link
                to="/owner"
                className="bg-white/20 text-white px-6 py-3 rounded-xl font-semibold hover:bg-white/30 transition-colors border border-white/30"
              >
                <Clock className="w-4 h-4 inline mr-2" />
                Đăng bài ngay
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
