import { useState, useEffect } from "react";
import { X, CheckCircle, Upload, Plus, Minus, Save, Loader2 } from "lucide-react";
import { useApp } from "../context/AppContext";
import { Room, RoomType, calcPostFee, formatPrice, POST_PRICING_RATES, formatDate } from "../data/mockData";

interface EditRoomModalProps {
  onClose: () => void;
  room: Room;
}

export function EditRoomModal({ onClose, room }: EditRoomModalProps) {
  const { updateRoom } = useApp();
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    title: room.title || "",
    description: room.description || "",
    street: room.address?.street || "",
    ward: room.address?.ward || "",
    district: room.address?.district || "",
    city: room.address?.city || "TP. Hồ Chí Minh",
    nearBy: (room.nearBy || []).join(", "),
    roomType: (room.roomType || "phong_tro") as RoomType,
    roomCount: room.roomCount || 1,
    price: String(room.price || ""),
    priceUnit: (room.priceUnit || "month") as "month" | "quarter" | "year",
    area: String(room.area || ""),
    sharedOwner: room.sharedOwner || false,
    bathroomType: (room.bathroom?.type || "private") as "private" | "shared",
    hasHotWater: room.bathroom?.hasHotWater || false,
    kitchen: (room.kitchen || "private") as "private" | "shared" | "none",
    hasAC: room.hasAC || false,
    hasBalcony: room.hasBalcony || false,
    electricityPrice: (room.electricityPrice || "standard") as "standard" | "rental",
    electricityRate: String(room.electricityRate || ""),
    waterRate: String(room.waterRate || ""),
    amenities: room.amenities || [],
    images: room.images || [],
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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setForm((prev) => ({
          ...prev,
          images: [...prev.images, reader.result as string],
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const updatedData: Partial<Room> = {
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
      images: form.images,
    };
    
    const res = await updateRoom(String(room.id), updatedData);
    setLoading(false);
    if (res.success) {
      setSubmitted(true);
    } else {
      alert(res.message);
    }
  };

  const STEP_LABELS = ["Thông tin", "Tiện ích", "Xác nhận"];

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-700 bg-emerald-600 text-white rounded-t-2xl">
          <h2 className="font-bold flex items-center gap-2">
            <Save className="w-5 h-5" />
            Cập nhật bài đăng: {room.title.substring(0, 30)}...
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-emerald-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Đã cập nhật thành công!</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
              Thông tin phòng trọ đã được lưu lại và hiển thị ngay lập tức.
            </p>
            <button
              onClick={onClose}
              className="bg-emerald-600 text-white px-8 py-3 rounded-xl font-semibold shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-all"
            >
              Hoàn tất
            </button>
          </div>
        ) : (
          <>
            {/* Step indicator */}
            <div className="px-6 py-4 flex gap-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/20">
              {STEP_LABELS.map((label, i) => (
                <div key={i} className="flex items-center gap-3 flex-1">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${i + 1 === step ? "bg-emerald-600 text-white scale-110 shadow-md shadow-emerald-200" :
                    i + 1 < step ? "bg-emerald-100 text-emerald-600" : "bg-gray-200 text-gray-400"}`}>
                    {i + 1 < step ? <CheckCircle className="w-4 h-4" /> : i + 1}
                  </div>
                  <span className={`text-xs font-bold uppercase tracking-tight ${i + 1 === step ? "text-emerald-700" : "text-gray-400"}`}>
                    {label}
                  </span>
                  {i < STEP_LABELS.length - 1 && <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />}
                </div>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
              {step === 1 && (
                <div className="space-y-5 animate-in fade-in duration-300">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5 ml-1">Tiêu đề bài đăng</label>
                      <input
                        type="text"
                        value={form.title}
                        onChange={set("title")}
                        className="w-full bg-gray-50 dark:bg-gray-700/50 border-2 border-transparent focus:border-emerald-500 focus:bg-white dark:focus:bg-gray-800 rounded-xl px-4 py-3 text-sm transition-all outline-none dark:text-white"
                        required
                      />
                    </div>
                    <div className="col-span-2">
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5 ml-1">Mô tả</label>
                        <textarea
                          value={form.description}
                          onChange={set("description")}
                          rows={4}
                          className="w-full bg-gray-50 dark:bg-gray-700/50 border-2 border-transparent focus:border-emerald-500 focus:bg-white dark:focus:bg-gray-800 rounded-xl px-4 py-3 text-sm transition-all outline-none resize-none dark:text-white"
                        />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5 ml-1">Giá thuê (VND)</label>
                      <input type="number" value={form.price} onChange={set("price")} className="w-full bg-gray-50 dark:bg-gray-700/50 border-2 border-transparent focus:border-emerald-500 rounded-xl px-4 py-3 text-sm outline-none dark:text-white" required />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5 ml-1">Diện tích (m²)</label>
                      <input type="number" value={form.area} onChange={set("area")} className="w-full bg-gray-50 dark:bg-gray-700/50 border-2 border-transparent focus:border-emerald-500 rounded-xl px-4 py-3 text-sm outline-none dark:text-white" required />
                    </div>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-3 ml-1">Tiện nghi của phòng</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {[
                        { key: "hasAC", label: "Máy lạnh" },
                        { key: "hasBalcony", label: "Ban công" },
                        { key: "hasHotWater", label: "Nóng lạnh" },
                        { key: "sharedOwner", label: "Chung chủ" },
                      ].map((item) => (
                        <label key={item.key} className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all cursor-pointer ${form[item.key as keyof typeof form] ? "border-emerald-500 bg-emerald-50/50" : "border-gray-50 bg-gray-50/30"}`}>
                          <input type="checkbox" checked={form[item.key as keyof typeof form] as boolean} onChange={set(item.key)} className="w-4 h-4 accent-emerald-600" />
                          <span className="text-sm font-medium text-gray-700">{item.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-3 ml-1">Ảnh đã tải lên</label>
                    <div className="grid grid-cols-4 gap-3">
                      {form.images.map((img, i) => (
                        <div key={i} className="relative aspect-square group">
                          <img src={img} className="w-full h-full object-cover rounded-xl border border-gray-100" />
                          <button onClick={() => removeImage(i)} className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all"><X className="w-3 h-3" /></button>
                        </div>
                      ))}
                      <label className="aspect-square border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors">
                        <Plus className="w-6 h-6 text-gray-400" />
                        <span className="text-[10px] uppercase font-bold text-gray-400">Thêm ảnh</span>
                        <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageUpload} />
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-6 animate-in fade-in duration-300">
                    <div className="p-6 bg-gray-50 dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-700">
                        <h4 className="text-sm font-bold text-gray-400 uppercase mb-4 tracking-wider">Xác nhận thay đổi</h4>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-500">Tiêu đề mới</span>
                                <span className="font-bold text-gray-900 dark:text-white truncate max-w-[200px]">{form.title}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-500">Giá thuê</span>
                                <span className="font-bold text-emerald-600">{formatPrice(Number(form.price))}/tháng</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-500">Diện tích</span>
                                <span className="font-bold text-gray-900 dark:text-white">{form.area} m²</span>
                            </div>
                        </div>
                    </div>
                    <div className="p-4 bg-yellow-50 border border-yellow-100 rounded-2xl flex items-start gap-3">
                        <div className="p-2 bg-white rounded-full shadow-sm"><Loader2 className="w-4 h-4 text-yellow-600" /></div>
                        <p className="text-xs text-yellow-800 leading-relaxed">
                            Cập nhật thông tin sẽ không làm thay đổi trạng thái của bài đăng (đã duyệt/hết hạn). Nếu bạn cần gia hạn bài đăng, vui lòng thực hiện riêng.
                        </p>
                    </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-100 dark:border-gray-700 flex justify-between bg-gray-50/30">
              <button
                type="button"
                onClick={() => step > 1 ? setStep(step - 1) : onClose()}
                className="px-6 py-2.5 text-sm font-bold text-gray-400 hover:text-gray-600 transition-colors"
              >
                {step > 1 ? "Quay lại" : "Hủy bỏ"}
              </button>

              {step < 3 ? (
                <button
                  type="button"
                  onClick={() => setStep(step + 1)}
                  className="bg-emerald-600 text-white px-8 py-2.5 rounded-xl font-bold hover:bg-emerald-700 shadow-lg shadow-emerald-100 active:scale-95 transition-all"
                >
                  Kế tiếp
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading}
                  className="bg-emerald-600 text-white px-8 py-2.5 rounded-xl font-bold hover:bg-emerald-700 shadow-lg shadow-emerald-100 flex items-center gap-2 active:scale-95 transition-all disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Lưu thay đổi
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
