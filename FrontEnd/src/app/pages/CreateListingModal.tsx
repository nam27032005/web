import { useState } from "react";
import { X, CheckCircle, Upload, Plus, Minus } from "lucide-react";
import { useApp } from "../context/AppContext";
import { Room, RoomType, calcPostFee, formatPrice } from "../data/mockData";

interface CreateListingModalProps {
  onClose: () => void;
  ownerId: string;
  ownerName: string;
  ownerPhone: string;
}

const ROOM_IMAGES = [
  "https://images.unsplash.com/photo-1759691555010-7f3f8674d2f2?w=800&h=600&fit=crop",
  "https://images.unsplash.com/photo-1774311237295-a65a4c1ff38a?w=800&h=600&fit=crop",
  "https://images.unsplash.com/photo-1761123141836-3b3221dac3e5?w=800&h=600&fit=crop",
  "https://images.unsplash.com/photo-1765464184843-105e144bd54b?w=800&h=600&fit=crop",
];

export function CreateListingModal({ onClose, ownerId, ownerName, ownerPhone }: CreateListingModalProps) {
  const { addRoom } = useApp();
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    street: "",
    ward: "",
    district: "",
    city: "TP. Hồ Chí Minh",
    nearBy: "",
    roomType: "phong_tro" as RoomType,
    roomCount: 1,
    price: "",
    priceUnit: "month" as "month" | "quarter" | "year",
    area: "",
    sharedOwner: false,
    bathroomType: "private" as "private" | "shared",
    hasHotWater: false,
    kitchen: "private" as "private" | "shared" | "none",
    hasAC: false,
    hasBalcony: false,
    electricityPrice: "standard" as "standard" | "rental",
    electricityRate: "",
    waterRate: "",
    amenities: [] as string[],
    displayDuration: 1,
    displayDurationUnit: "month" as "week" | "month" | "quarter" | "year",
  });

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const value = e.target.type === "checkbox" ? (e.target as HTMLInputElement).checked : e.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const toggleAmenity = (a: string) => {
    setForm((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(a)
        ? prev.amenities.filter((x) => x !== a)
        : [...prev.amenities, a],
    }));
  };

  const postFee = calcPostFee(form.displayDuration, form.displayDurationUnit);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newRoom: Room = {
      id: `room-${Date.now()}`,
      ownerId,
      ownerName,
      ownerPhone,
      title: form.title,
      description: form.description,
      address: {
        street: form.street,
        ward: form.ward,
        district: form.district,
        city: form.city,
        full: `${form.street}, ${form.ward}, ${form.district}, ${form.city}`,
      },
      nearBy: form.nearBy.split(",").map((s) => s.trim()).filter(Boolean),
      roomType: form.roomType,
      roomCount: form.roomCount,
      price: Number(form.price),
      priceUnit: form.priceUnit,
      area: Number(form.area),
      sharedOwner: form.sharedOwner,
      bathroom: { type: form.bathroomType, hasHotWater: form.hasHotWater },
      kitchen: form.kitchen,
      hasAC: form.hasAC,
      hasBalcony: form.hasBalcony,
      electricityPrice: form.electricityPrice,
      electricityRate: form.electricityRate ? Number(form.electricityRate) : undefined,
      waterRate: form.waterRate ? Number(form.waterRate) : undefined,
      amenities: form.amenities,
      images: ROOM_IMAGES,
      status: "available",
      postStatus: "pending",
      displayDuration: form.displayDuration,
      displayDurationUnit: form.displayDurationUnit,
      postFee,
      views: 0,
      favorites: 0,
      createdAt: new Date().toISOString().split("T")[0],
    };
    addRoom(newRoom);
    setSubmitted(true);
  };

  const STEP_LABELS = ["Thông tin cơ bản", "Tiện ích", "Thời gian đăng", "Xác nhận"];

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="font-bold text-gray-900">Đăng bài cho thuê phòng</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {submitted ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-emerald-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Đã gửi bài đăng!</h3>
            <p className="text-sm text-gray-500 mb-6">
              Bài đăng của bạn đang chờ được Admin phê duyệt. Bạn sẽ nhận thông báo khi có kết quả.
            </p>
            <button
              onClick={onClose}
              className="bg-emerald-600 text-white px-6 py-2.5 rounded-xl font-medium text-sm hover:bg-emerald-700"
            >
              Đóng
            </button>
          </div>
        ) : (
          <>
            {/* Step indicator */}
            <div className="px-5 py-3 flex gap-2 border-b border-gray-100">
              {STEP_LABELS.map((label, i) => (
                <div key={i} className="flex items-center gap-2 flex-1">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                    i + 1 === step ? "bg-emerald-600 text-white" :
                    i + 1 < step ? "bg-emerald-100 text-emerald-600" :
                    "bg-gray-100 text-gray-400"
                  }`}>
                    {i + 1 < step ? <CheckCircle className="w-3.5 h-3.5" /> : i + 1}
                  </div>
                  <span className={`text-xs font-medium hidden sm:block ${i + 1 === step ? "text-emerald-700" : "text-gray-400"}`}>
                    {label}
                  </span>
                  {i < STEP_LABELS.length - 1 && <div className="flex-1 h-px bg-gray-200" />}
                </div>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto p-5">
              {/* Step 1: Basic Info */}
              {step === 1 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Tiêu đề bài đăng <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={form.title}
                      onChange={set("title")}
                      placeholder="Vd: Phòng trọ đầy đủ nội thất, gần ĐH Bách Khoa"
                      className="w-full text-sm border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-emerald-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Mô tả</label>
                    <textarea
                      value={form.description}
                      onChange={set("description")}
                      rows={3}
                      placeholder="Mô tả chi tiết về phòng trọ..."
                      className="w-full text-sm border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-emerald-500 resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Loại phòng *</label>
                      <select value={form.roomType} onChange={set("roomType")} className="w-full text-sm border border-gray-200 rounded-xl px-3 py-3 outline-none focus:border-emerald-500">
                        <option value="phong_tro">Phòng trọ</option>
                        <option value="chung_cu_mini">Chung cư mini</option>
                        <option value="nha_nguyen_can">Nhà nguyên căn</option>
                        <option value="chung_cu_nguyen_can">Chung cư nguyên căn</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Số phòng ngủ</label>
                      <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2">
                        <button type="button" onClick={() => setForm((p) => ({ ...p, roomCount: Math.max(1, p.roomCount - 1) }))} className="text-gray-400 hover:text-gray-600"><Minus className="w-4 h-4" /></button>
                        <span className="flex-1 text-center text-sm font-medium">{form.roomCount}</span>
                        <button type="button" onClick={() => setForm((p) => ({ ...p, roomCount: p.roomCount + 1 }))} className="text-gray-400 hover:text-gray-600"><Plus className="w-4 h-4" /></button>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Giá thuê *</label>
                      <input type="number" value={form.price} onChange={set("price")} placeholder="3500000" className="w-full text-sm border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-emerald-500" required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Tính theo</label>
                      <select value={form.priceUnit} onChange={set("priceUnit")} className="w-full text-sm border border-gray-200 rounded-xl px-3 py-3 outline-none focus:border-emerald-500">
                        <option value="month">Tháng</option>
                        <option value="quarter">Quý</option>
                        <option value="year">Năm</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Diện tích (m²) *</label>
                    <input type="number" value={form.area} onChange={set("area")} placeholder="25" className="w-full text-sm border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-emerald-500" required />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Địa chỉ *</label>
                    <input type="text" value={form.street} onChange={set("street")} placeholder="Số nhà - Đường/Thôn" className="w-full text-sm border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:border-emerald-500" required />
                    <div className="grid grid-cols-2 gap-2">
                      <input type="text" value={form.ward} onChange={set("ward")} placeholder="Phường/Xã" className="w-full text-sm border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:border-emerald-500" required />
                      <input type="text" value={form.district} onChange={set("district")} placeholder="Quận/Huyện" className="w-full text-sm border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:border-emerald-500" required />
                    </div>
                    <input type="text" value={form.city} onChange={set("city")} placeholder="Tỉnh/Thành phố" className="w-full text-sm border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:border-emerald-500" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Gần các địa điểm (phân tách bằng dấu phẩy)</label>
                    <input type="text" value={form.nearBy} onChange={set("nearBy")} placeholder="ĐH Bách Khoa, Công viên Gia Định, ..." className="w-full text-sm border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-emerald-500" />
                  </div>
                </div>
              )}

              {/* Step 2: Facilities */}
              {step === 2 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phòng tắm *</label>
                      <select value={form.bathroomType} onChange={set("bathroomType")} className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:border-emerald-500">
                        <option value="private">Khép kín</option>
                        <option value="shared">Chung</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Bếp *</label>
                      <select value={form.kitchen} onChange={set("kitchen")} className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:border-emerald-500">
                        <option value="private">Bếp riêng</option>
                        <option value="shared">Bếp chung</option>
                        <option value="none">Không nấu ăn</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Điện nước</label>
                      <select value={form.electricityPrice} onChange={set("electricityPrice")} className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:border-emerald-500">
                        <option value="standard">Giá dân</option>
                        <option value="rental">Giá thuê</option>
                      </select>
                    </div>
                    {form.electricityPrice === "rental" && (
                      <div className="space-y-2">
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Giá điện (đ/kWh)</label>
                          <input type="number" value={form.electricityRate} onChange={set("electricityRate")} placeholder="3500" className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 outline-none focus:border-emerald-500" />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Giá nước (đ/m³)</label>
                          <input type="number" value={form.waterRate} onChange={set("waterRate")} placeholder="80000" className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 outline-none focus:border-emerald-500" />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-700">Tiện nghi có sẵn *</label>
                    {[
                      { key: "hasAC", label: "Điều hòa" },
                      { key: "hasBalcony", label: "Ban công" },
                      { key: "hasHotWater", label: "Nóng lạnh" },
                      { key: "sharedOwner", label: "Chung chủ" },
                    ].map((item) => (
                      <label key={item.key} className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={form[item.key as keyof typeof form] as boolean}
                          onChange={set(item.key)}
                          className="w-4 h-4 accent-emerald-600"
                        />
                        <span className="text-sm text-gray-700">{item.label}</span>
                      </label>
                    ))}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tiện ích khác</label>
                    <div className="flex flex-wrap gap-2">
                      {["Tủ lạnh", "Máy giặt", "Giường tủ", "Bàn ghế", "Máy lạnh riêng"].map((a) => (
                        <button
                          key={a}
                          type="button"
                          onClick={() => toggleAmenity(a)}
                          className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                            form.amenities.includes(a)
                              ? "bg-emerald-100 border-emerald-300 text-emerald-700"
                              : "border-gray-200 text-gray-600 hover:border-gray-300"
                          }`}
                        >
                          {a}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="bg-amber-50 border border-amber-100 rounded-xl p-3">
                    <div className="flex items-center gap-1 mb-1">
                      <Upload className="w-4 h-4 text-amber-600" />
                      <p className="text-sm font-medium text-amber-700">Ảnh phòng trọ (tối thiểu 3 ảnh)</p>
                    </div>
                    <p className="text-xs text-amber-600">Hệ thống sẽ sử dụng ảnh mẫu trong bản demo. Trong thực tế, bạn có thể tải ảnh lên.</p>
                    <div className="flex gap-2 mt-2">
                      {ROOM_IMAGES.slice(0, 3).map((img, i) => (
                        <img key={i} src={img} alt="" className="w-16 h-12 object-cover rounded-lg border-2 border-emerald-300" />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Display Duration */}
              {step === 3 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Thời gian hiển thị bài đăng</label>
                    <p className="text-xs text-gray-500 mb-3">Tối thiểu 1 tuần. Phí đăng bài sẽ được tính dựa trên thời gian bạn chọn.</p>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Số lượng</label>
                        <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2">
                          <button type="button" onClick={() => setForm((p) => ({ ...p, displayDuration: Math.max(1, p.displayDuration - 1) }))} className="text-gray-400"><Minus className="w-4 h-4" /></button>
                          <span className="flex-1 text-center text-sm font-medium">{form.displayDuration}</span>
                          <button type="button" onClick={() => setForm((p) => ({ ...p, displayDuration: p.displayDuration + 1 }))} className="text-gray-400"><Plus className="w-4 h-4" /></button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Đơn vị</label>
                        <select value={form.displayDurationUnit} onChange={set("displayDurationUnit")} className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:border-emerald-500">
                          <option value="week">Tuần</option>
                          <option value="month">Tháng</option>
                          <option value="quarter">Quý (3 tháng)</option>
                          <option value="year">Năm</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm font-medium text-gray-700">Phí đăng bài</p>
                        <p className="text-xs text-gray-500">
                          {form.displayDuration} {form.displayDurationUnit === "week" ? "tuần" : form.displayDurationUnit === "month" ? "tháng" : form.displayDurationUnit === "quarter" ? "quý" : "năm"}
                        </p>
                      </div>
                      <p className="text-xl font-bold text-emerald-600">{formatPrice(postFee)}</p>
                    </div>
                    <p className="text-xs text-gray-400 mt-2">
                      * Thanh toán offline tại văn phòng AccomodCorp
                    </p>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Thông tin liên lạc (tự động)</p>
                    <div className="space-y-1 text-sm text-gray-600">
                      <p>Họ tên: <span className="font-medium text-gray-900">{ownerName}</span></p>
                      <p>Điện thoại: <span className="font-medium text-gray-900">{ownerPhone}</span></p>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Confirm */}
              {step === 4 && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900">Xem lại thông tin bài đăng</h3>

                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-500">Tiêu đề</span>
                      <span className="font-medium text-gray-900 text-right max-w-[200px]">{form.title || "—"}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-500">Loại phòng</span>
                      <span className="font-medium">{form.roomType === "phong_tro" ? "Phòng trọ" : form.roomType === "chung_cu_mini" ? "Chung cư mini" : form.roomType === "nha_nguyen_can" ? "Nhà nguyên căn" : "Chung cư nguyên căn"}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-500">Địa chỉ</span>
                      <span className="font-medium text-right max-w-[200px]">{form.street}, {form.ward}, {form.district}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-500">Giá thuê</span>
                      <span className="font-medium text-emerald-600">{form.price ? formatPrice(Number(form.price)) : "—"}/{form.priceUnit === "month" ? "tháng" : "quý"}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-500">Diện tích</span>
                      <span className="font-medium">{form.area || "—"} m²</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-500">Thời gian hiển thị</span>
                      <span className="font-medium">{form.displayDuration} {form.displayDurationUnit === "week" ? "tuần" : "tháng"}</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-gray-500">Phí đăng bài</span>
                      <span className="font-bold text-emerald-600">{formatPrice(postFee)}</span>
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-100 rounded-xl p-3">
                    <p className="text-xs text-blue-700">
                      ℹ️ Sau khi gửi, bài đăng sẽ vào trạng thái <strong>Chờ duyệt</strong>. Admin sẽ phê duyệt trong vòng 24-48 giờ và thông báo cho bạn qua hệ thống.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Footer Buttons */}
            <div className="p-4 border-t border-gray-100 flex justify-between">
              <button
                type="button"
                onClick={() => step > 1 ? setStep(step - 1) : onClose()}
                className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50"
              >
                {step > 1 ? "Quay lại" : "Hủy"}
              </button>

              {step < 4 ? (
                <button
                  type="button"
                  onClick={() => setStep(step + 1)}
                  className="px-6 py-2 text-sm bg-emerald-600 text-white rounded-xl hover:bg-emerald-700"
                >
                  Tiếp theo
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="px-6 py-2 text-sm bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 font-medium"
                >
                  Gửi bài đăng
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
