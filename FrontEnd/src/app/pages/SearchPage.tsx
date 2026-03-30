import { useState, useEffect } from "react";
import { useSearchParams } from "react-router";
import {
  Search,
  SlidersHorizontal,
  X,
  ChevronDown,
  ChevronUp,
  MapPin,
} from "lucide-react";
import { RoomCard } from "../components/RoomCard";
import { useApp } from "../context/AppContext";
import { useAuth } from "../context/AuthContext";
import { Room, RoomType, ROOM_TYPE_LABELS } from "../data/mockData";

const DISTRICTS_BY_CITY: Record<string, string[]> = {
  "Tất cả thành phố": [],
  "TP. Hồ Chí Minh": [
    "Quận 1", "Quận 3", "Quận 4", "Quận 5", "Quận 7",
    "Quận 9", "Quận 10", "Quận Bình Thạnh", "Quận Gò Vấp", "Quận Phú Nhuận",
  ],
  "Hà Nội": [
    "Quận Ba Đình", "Quận Hoàn Kiếm", "Quận Đống Đa", "Quận Hai Bà Trưng",
    "Quận Cầu Giấy", "Quận Thanh Xuân", "Quận Hoàng Mai", "Quận Long Biên",
    "Quận Nam Từ Liêm", "Quận Bắc Từ Liêm",
  ],
  "Đà Nẵng": ["Quận Hải Châu", "Quận Thanh Khê", "Quận Sơn Trà", "Quận Ngũ Hành Sơn", "Quận Liên Chiểu"],
  "Cần Thơ": ["Quận Ninh Kiều", "Quận Bình Thủy", "Quận Cái Răng", "Quận Ô Môn"],
  "Bình Dương": ["TP. Thủ Dầu Một", "TP. Dĩ An", "TP. Thuận An", "Huyện Bến Cát"],
};

const ALL_CITIES = Object.keys(DISTRICTS_BY_CITY);

const NEARBY_BY_CITY: Record<string, string[]> = {
  "Tất cả thành phố": ["Trường Đại học", "Bệnh viện", "Siêu thị", "Công viên"],
  "TP. Hồ Chí Minh": ["ĐH Bách Khoa TP.HCM", "ĐH Công Nghệ Thông Tin", "ĐH Sư Phạm TP.HCM", "ĐH Nông Lâm TP.HCM", "Công viên Gia Định"],
  "Hà Nội": ["ĐH Bách Khoa Hà Nội", "ĐH Quốc gia Hà Nội", "ĐH Kinh tế Quốc dân", "ĐH Xây dựng Hà Nội", "Công viên Hồ Tây"],
  "Đà Nẵng": ["ĐH Đà Nẵng", "ĐH Bách Khoa ĐN", "Bãi biển Mỹ Khê", "Công viên Âu Cơ"],
  "Cần Thơ": ["ĐH Cần Thơ", "Bến Ninh Kiều", "Chợ Nổi Cái Răng"],
  "Bình Dương": ["ĐH Quốc tế Minh Việt", "KCN VSIP", "Aeon Mall Bình Dương"],
};

const PRICE_RANGES = [
  { label: "Tất cả", min: 0, max: Infinity },
  { label: "Dưới 2 triệu", min: 0, max: 2000000 },
  { label: "2 - 4 triệu", min: 2000000, max: 4000000 },
  { label: "4 - 7 triệu", min: 4000000, max: 7000000 },
  { label: "7 - 15 triệu", min: 7000000, max: 15000000 },
  { label: "Trên 15 triệu", min: 15000000, max: Infinity },
];

const SORT_OPTIONS = [
  { label: "Mới nhất", value: "newest" },
  { label: "Giá tăng dần", value: "price_asc" },
  { label: "Giá giảm dần", value: "price_desc" },
  { label: "Diện tích tăng dần", value: "area_asc" },
  { label: "Lượt xem nhiều nhất", value: "views" },
];

type SortOption = "newest" | "price_asc" | "price_desc" | "area_asc" | "views";

export function SearchPage() {
  const { rooms } = useApp();
  const { currentUser } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const isAdmin = currentUser?.role === "admin";
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [selectedCity, setSelectedCity] = useState(
    searchParams.get("city") || "TP. Hồ Chí Minh"
  );
  const [selectedType, setSelectedType] = useState<RoomType | "">(
    (searchParams.get("type") as RoomType) || ""
  );
  const [selectedDistrict, setSelectedDistrict] = useState(
    searchParams.get("district") || "Tất cả"
  );
  const [priceRange, setPriceRange] = useState(0);
  const [hasAC, setHasAC] = useState(false);
  const [hasBalcony, setHasBalcony] = useState(false);
  const [hasHotWater, setHasHotWater] = useState(false);
  const [sharedOwner, setSharedOwner] = useState<"" | "yes" | "no">("");
  const [kitchen, setKitchen] = useState<"" | "private" | "shared" | "none">("");
  const [selectedNearby, setSelectedNearby] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [showFilters, setShowFilters] = useState(false);
  const [filterSections, setFilterSections] = useState({
    type: true,
    price: true,
    area: false,
    facilities: false,
  });

  // Districts + nearby tự cập nhật khi thay đổi thành phố
  const currentDistricts = ["Tất cả", ...(DISTRICTS_BY_CITY[selectedCity] ?? [])];
  const currentNearby = NEARBY_BY_CITY[selectedCity] ?? [];

  const handleCityChange = (city: string) => {
    setSelectedCity(city);
    setSelectedDistrict("Tất cả"); // reset quận khi đổi thành phố
    setSelectedNearby([]);           // reset nearby khi đổi thành phố
  };

  const toggleSection = (section: keyof typeof filterSections) =>
    setFilterSections((prev) => ({ ...prev, [section]: !prev[section] }));

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    setSearchParams(params);
  };

  const clearFilters = () => {
    setQuery("");
    setSelectedCity("TP. Hồ Chí Minh");
    setSelectedType("");
    setSelectedDistrict("Tất cả");
    setPriceRange(0);
    setHasAC(false);
    setHasBalcony(false);
    setHasHotWater(false);
    setSharedOwner("");
    setKitchen("");
    setSelectedNearby([]);
    setSortBy("newest");
    setSearchParams({});
  };

  const toggleNearby = (n: string) =>
    setSelectedNearby((prev) =>
      prev.includes(n) ? prev.filter((x) => x !== n) : [...prev, n]
    );

  const filteredRooms = rooms
    .filter((r) => r.postStatus === "approved" || (isAdmin && r.postStatus === "pending"))
    .filter((r) => {
      // Query
      if (query) {
        const q = query.toLowerCase();
        if (
          !r.title.toLowerCase().includes(q) &&
          !r.address.full.toLowerCase().includes(q) &&
          !r.nearBy.some((n) => n.toLowerCase().includes(q))
        )
          return false;
      }
      // Type
      if (selectedType && r.roomType !== selectedType) return false;
      // District
      if (selectedDistrict !== "Tất cả" && !r.address.district.includes(selectedDistrict))
        return false;
      // Price
      const range = PRICE_RANGES[priceRange];
      if (r.price < range.min || r.price > range.max) return false;
      // Facilities
      if (hasAC && !r.hasAC) return false;
      if (hasBalcony && !r.hasBalcony) return false;
      if (hasHotWater && !r.bathroom.hasHotWater) return false;
      if (sharedOwner === "yes" && !r.sharedOwner) return false;
      if (sharedOwner === "no" && r.sharedOwner) return false;
      if (kitchen && r.kitchen !== kitchen) return false;
      // Nearby
      if (selectedNearby.length > 0 && !selectedNearby.some((n) => r.nearBy.includes(n)))
        return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "price_asc") return a.price - b.price;
      if (sortBy === "price_desc") return b.price - a.price;
      if (sortBy === "area_asc") return a.area - b.area;
      if (sortBy === "views") return b.views - a.views;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  const FilterSidebar = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900 dark:text-white">Bộ lọc</h3>
        <button
          onClick={clearFilters}
          className="text-xs text-emerald-600 hover:text-emerald-700"
        >
          Xóa tất cả
        </button>
      </div>

      {/* Room Type */}
      <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
        <button
          onClick={() => toggleSection("type")}
          className="w-full flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 text-sm font-medium text-gray-700 dark:text-gray-200"
        >
          Loại phòng
          {filterSections.type ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
        {filterSections.type && (
          <div className="p-3 space-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="type"
                checked={selectedType === ""}
                onChange={() => setSelectedType("")}
                className="accent-emerald-600"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Tất cả</span>
            </label>
            {(Object.keys(ROOM_TYPE_LABELS) as RoomType[]).map((t) => (
              <label key={t} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="type"
                  checked={selectedType === t}
                  onChange={() => setSelectedType(t)}
                  className="accent-emerald-600"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">{ROOM_TYPE_LABELS[t]}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Price */}
      <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
        <button
          onClick={() => toggleSection("price")}
          className="w-full flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 text-sm font-medium text-gray-700 dark:text-gray-200"
        >
          Khoảng giá
          {filterSections.price ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
        {filterSections.price && (
          <div className="p-3 space-y-2">
            {PRICE_RANGES.map((r, i) => (
              <label key={i} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="price"
                  checked={priceRange === i}
                  onChange={() => setPriceRange(i)}
                  className="accent-emerald-600"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">{r.label}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Facilities */}
      <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
        <button
          onClick={() => toggleSection("facilities")}
          className="w-full flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 text-sm font-medium text-gray-700 dark:text-gray-200"
        >
          Tiện ích
          {filterSections.facilities ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
        {filterSections.facilities && (
          <div className="p-3 space-y-2">
            {[
              { label: "Có điều hòa", value: hasAC, setter: setHasAC },
              { label: "Có ban công", value: hasBalcony, setter: setHasBalcony },
              { label: "Nước nóng lạnh", value: hasHotWater, setter: setHasHotWater },
            ].map((item, i) => (
              <label key={i} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={item.value}
                  onChange={(e) => item.setter(e.target.checked)}
                  className="accent-emerald-600"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">{item.label}</span>
              </label>
            ))}
            <div className="mt-3">
              <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">Chung/không chung chủ</p>
              {[
                { label: "Tất cả", value: "" },
                { label: "Không chung chủ", value: "no" },
                { label: "Chung chủ", value: "yes" },
              ].map((o) => (
                <label key={o.value} className="flex items-center gap-2 cursor-pointer mb-1.5">
                  <input
                    type="radio"
                    name="sharedOwner"
                    checked={sharedOwner === o.value}
                    onChange={() => setSharedOwner(o.value as any)}
                    className="accent-emerald-600"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{o.label}</span>
                </label>
              ))}
            </div>
            <div className="mt-3">
              <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">Bếp</p>
              {[
                { label: "Tất cả", value: "" },
                { label: "Bếp riêng", value: "private" },
                { label: "Bếp chung", value: "shared" },
                { label: "Không nấu ăn", value: "none" },
              ].map((o) => (
                <label key={o.value} className="flex items-center gap-2 cursor-pointer mb-1.5">
                  <input
                    type="radio"
                    name="kitchen"
                    checked={kitchen === o.value}
                    onChange={() => setKitchen(o.value as any)}
                    className="accent-emerald-600"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{o.label}</span>
                </label>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Thành phố */}
      <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
        <button
          onClick={() => toggleSection("area")}
          className="w-full flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 text-sm font-medium text-gray-700 dark:text-gray-200"
        >
          Thành phố / Quận–Huyện
          {filterSections.area ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
        {filterSections.area && (
          <div className="p-3 space-y-2">
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Thành phố</p>
              <select
                value={selectedCity}
                onChange={(e) => handleCityChange(e.target.value)}
                className="w-full text-sm border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 outline-none focus:border-emerald-500 bg-white dark:bg-gray-800"
              >
                {ALL_CITIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            {currentDistricts.length > 1 && (
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Quận / Huyện</p>
                <select
                  value={selectedDistrict}
                  onChange={(e) => setSelectedDistrict(e.target.value)}
                  className="w-full text-sm border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 outline-none focus:border-emerald-500 bg-white dark:bg-gray-800"
                >
                  {currentDistricts.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Nearby – tự động cập nhật theo thành phố */}
      {currentNearby.length > 0 && (
        <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-3">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Gần địa điểm</p>
          <div className="space-y-1.5">
            {currentNearby.map((n) => (
              <label key={n} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedNearby.includes(n)}
                  onChange={() => toggleNearby(n)}
                  className="accent-emerald-600"
                />
                <span className="text-xs text-gray-600 dark:text-gray-400">{n}</span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Search Bar */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="flex-1 flex items-center gap-2 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 focus-within:border-emerald-500 bg-white dark:bg-gray-800">
              <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Tìm theo địa chỉ, tên đường, trường đại học..."
                className="flex-1 text-sm outline-none text-gray-700 dark:text-gray-200 placeholder-gray-400 bg-transparent"
              />
              {query && (
                <button type="button" onClick={() => setQuery("")}>
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              )}
            </div>
            <button
              type="submit"
              className="bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-emerald-700 transition-colors"
            >
              Tìm
            </button>
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className={`md:hidden flex items-center gap-1 px-4 py-2 rounded-xl text-sm border ${
                showFilters ? "border-emerald-500 text-emerald-600 dark:text-emerald-400" : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300"
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />Lọc
            </button>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="hidden md:block text-sm border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 outline-none focus:border-emerald-500 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </form>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-6">
          {/* Sidebar - Desktop */}
          <aside className="hidden md:block w-64 flex-shrink-0">
            <FilterSidebar />
          </aside>

          {/* Mobile filter */}
          {showFilters && (
            <div className="md:hidden fixed inset-0 bg-black/50 z-50 flex items-end">
              <div className="bg-white dark:bg-gray-800 rounded-t-2xl w-full max-h-[85vh] overflow-y-auto p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white">Bộ lọc</h3>
                  <button onClick={() => setShowFilters(false)}>
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>
                <FilterSidebar />
                <button
                  onClick={() => setShowFilters(false)}
                  className="w-full mt-4 bg-emerald-600 text-white py-3 rounded-xl font-medium"
                >
                  Áp dụng ({filteredRooms.length} kết quả)
                </button>
              </div>
            </div>
          )}

          {/* Results */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-600">
                Tìm thấy <span className="font-semibold text-gray-900 dark:text-white">{filteredRooms.length}</span> phòng
              </p>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="md:hidden text-sm border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 outline-none text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800"
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>

            {filteredRooms.length === 0 ? (
              <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
                <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">Không tìm thấy phòng trọ phù hợp</p>
                <p className="text-sm text-gray-400 mt-1">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
                <button
                  onClick={clearFilters}
                  className="mt-4 text-sm text-emerald-600 hover:underline"
                >
                  Xóa bộ lọc
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {filteredRooms.map((room) => (
                  <RoomCard key={room.id} room={room} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
