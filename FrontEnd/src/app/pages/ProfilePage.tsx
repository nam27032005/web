import { useState, useRef, useEffect } from "react";
import { User, Phone, Mail, MapPin, Lock, Eye, EyeOff, CheckCircle, AlertTriangle, Camera } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate, useParams } from "react-router";
import api from "../../lib/api";
import { getUserAvatar, Room, ROOM_TYPE_LABELS, formatPrice } from "../data/mockData";

export function ProfilePage() {
  const { currentUser, updateUser, logout } = useAuth();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [viewUser, setViewUser] = useState<any>(null);
  const [viewUserRooms, setViewUserRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(!!id);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    gender: "khác" as "nam" | "nữ" | "khác",
  });

  const isMe = !id || String(id) === String(currentUser?.id) || String(id) === String(currentUser?._id);

  useEffect(() => {
    if (isMe && currentUser) {
      setForm({
        name: currentUser.name || "",
        phone: currentUser.phone || "",
        gender: currentUser.gender || "khác",
      });
    }
  }, [isMe, currentUser]);

  useEffect(() => {
    const fetchUser = async () => {
      if (isMe) return;
      try {
        setLoading(true);
        const res = await api.get(`/users/${id}`);
        if (res.data.success) {
          setViewUser(res.data.user);
          // Fetch rooms if they are an owner
          if (res.data.user.role === "owner") {
            const roomRes = await api.get(`/rooms?ownerId=${id}`);
            if (roomRes.data.success) setViewUserRooms(roomRes.data.rooms);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [id, isMe]);

  const user = isMe ? currentUser : viewUser;

  const [pwForm, setPwForm] = useState({ old: "", new: "", confirm: "" });
  const [showPw, setShowPw] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [pwError, setPwError] = useState("");
  const [pwSuccess, setPwSuccess] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600" />
      </div>
    );
  }

  if (!user && !isMe) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Không tìm thấy người dùng này.</p>
          <Link to="/" className="text-emerald-600 hover:underline">Về trang chủ</Link>
        </div>
      </div>
    );
  }

  if (!currentUser && isMe) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Bạn cần đăng nhập.</p>
          <Link to="/login" className="text-emerald-600 hover:underline">Đăng nhập</Link>
        </div>
      </div>
    );
  }

  const isOwnerVerified = user?.role === "owner" && user?.verified;

  // ── Lưu thông tin gọi API thật ──────────────────────────────
  const handleSave = async () => {
    setSaveError("");
    try {
      const res = await api.put(`/users/${currentUser?.id}`, {
        name: form.name,
        phone: form.phone,
        gender: form.gender,
      });
      if (res.data.success) {
        updateUser({ name: form.name, phone: form.phone, gender: form.gender });
        setEditing(false);
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      }
    } catch (err: any) {
      setSaveError(err.response?.data?.message || "Lỗi cập nhật thông tin.");
    }
  };

  // ── Đổi ảnh đại diện (base64) ───────────────────────────────
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      alert("Ảnh quá lớn! Vui lòng chọn ảnh dưới 2MB.");
      return;
    }

    setAvatarLoading(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
    try {
      const res = await api.put(`/users/${currentUser?.id}`, { avatar: base64 });
      if (res.data.success) {
        updateUser({ avatar: base64 });
      }
    } catch (err) {
        alert("Lỗi cập nhật ảnh. Vui lòng thử lại.");
      } finally {
        setAvatarLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const getPasswordStrength = (pwd: string) => {
    let s = 0;
    if (pwd.length >= 8) s++;
    if (/[a-z]/.test(pwd)) s++;
    if (/[A-Z]/.test(pwd)) s++;
    if (/[0-9]/.test(pwd)) s++;
    if (/[^a-zA-Z0-9]/.test(pwd)) s++;
    return s;
  };

  const getStrengthColor = (s: number) => {
    if (s <= 1) return "bg-red-500";
    if (s === 2) return "bg-orange-500";
    if (s === 3) return "bg-amber-400";
    if (s === 4) return "bg-blue-500";
    return "bg-emerald-500";
  };

  // ── Đổi mật khẩu gọi API thật ──────────────────────────────
  const handleChangePw = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwError("");
    if (getPasswordStrength(pwForm.new) < 5) {
      setPwError("Mật khẩu mới chưa đủ mạnh (đạt " + getPasswordStrength(pwForm.new) + "/5 vạch).");
      return;
    }
    if (pwForm.new !== pwForm.confirm) {
      setPwError("Mật khẩu mới không khớp.");
      return;
    }
    try {
      const res = await api.post("/auth/change-password", {
        oldPassword: pwForm.old,
        newPassword: pwForm.new,
      });
      if (res.data.success) {
        setPwSuccess(true);
        setPwForm({ old: "", new: "", confirm: "" });
        setTimeout(() => setPwSuccess(false), 2500);
      }
    } catch (err: any) {
      setPwError(err.response?.data?.message || "Mật khẩu hiện tại không đúng.");
    }
  };

  const roleLabel =
    user?.role === "admin"
      ? "Quản trị viên"
      : user?.role === "owner"
      ? "Chủ nhà trọ"
      : "Người thuê trọ";

  const roleColor =
    user?.role === "admin"
      ? "bg-purple-100 text-purple-700"
      : user?.role === "owner"
      ? "bg-blue-100 text-blue-700"
      : "bg-green-100 text-green-700";

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen pb-12">
      <div className="bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-5">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Tài khoản của tôi</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 space-y-5">
        {/* Profile Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5">
          <div className="flex items-center gap-4 mb-5">
            {/* Avatar với nút upload */}
            <div className="relative flex-shrink-0">
              <div className="w-20 h-20 rounded-full overflow-hidden bg-emerald-100">
                <img
                  src={getUserAvatar(user)}
                  alt={user?.name}
                  className="w-full h-full object-cover"
                />
              </div>
              {isMe && (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={avatarLoading}
                  className="absolute -bottom-1 -right-1 w-7 h-7 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full flex items-center justify-center shadow-md transition-colors disabled:opacity-50"
                  title="Đổi ảnh đại diện"
                >
                  {avatarLoading
                    ? <div className="w-3.5 h-3.5 border border-white border-t-transparent rounded-full animate-spin" />
                    : <Camera className="w-3.5 h-3.5" />}
                </button>
              )}
              {isMe && (
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
              )}
            </div>

            <div>
              <h2 className="font-bold text-gray-900 dark:text-white text-lg">{user?.name}</h2>
              <span className={`text-xs px-2.5 py-0.5 rounded-full ${roleColor}`}>{roleLabel}</span>
              {user?.role === "owner" && (
                <div className="mt-1">
                  {isOwnerVerified ? (
                    <span className="flex items-center gap-1 text-xs text-green-600">
                      <CheckCircle className="w-3.5 h-3.5" />Tài khoản đã được xác nhận
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-xs text-amber-600">
                      <AlertTriangle className="w-3.5 h-3.5" />Chờ xác nhận bởi 7 Trọ
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {saved && (
            <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2.5 mb-4">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <p className="text-sm text-emerald-700">Thông tin đã được cập nhật.</p>
            </div>
          )}
          {saveError && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-3 py-2.5 mb-4">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              <p className="text-sm text-red-600">{saveError}</p>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide">Họ và tên</label>
              {editing && !isOwnerVerified ? (
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  className="w-full text-sm border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl px-4 py-3 outline-none focus:border-emerald-500"
                />
              ) : (
                <div className="flex items-center gap-2 text-sm text-gray-900 dark:text-gray-100 py-2">
                  <User className="w-4 h-4 text-gray-400" />{user?.name}
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide">Email</label>
              <div className="flex items-center gap-2 text-sm text-gray-900 dark:text-gray-100 py-2">
                <Mail className="w-4 h-4 text-gray-400" />{user?.email}
                {isMe && <span className="text-xs text-gray-400">(Không thể thay đổi)</span>}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide">Số điện thoại</label>
              {editing && !isOwnerVerified ? (
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                  className="w-full text-sm border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl px-4 py-3 outline-none focus:border-emerald-500"
                />
              ) : (
                <div className="flex items-center gap-2 text-sm text-gray-900 dark:text-gray-100 py-2">
                  <Phone className="w-4 h-4 text-gray-400" />{user?.phone}
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide">Giới tính</label>
              {editing ? (
                <div className="flex gap-4 py-2">
                  {["nam", "nữ", "khác"].map((g) => (
                    <label key={g} className="flex items-center gap-2 cursor-pointer group">
                      <input
                        type="radio"
                        name="gender"
                        value={g}
                        checked={form.gender === g}
                        onChange={(e) => setForm((p) => ({ ...p, gender: e.target.value as any }))}
                        className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 pointer-events-none"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300 capitalize group-hover:text-emerald-600 transition-colors">
                        {g}
                      </span>
                    </label>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-gray-900 dark:text-gray-100 py-2 capitalize">
                  {user?.gender || "Chưa xác định"}
                </div>
              )}
            </div>

            {currentUser.address && (
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide">Địa chỉ thường trú</label>
                <div className="flex items-center gap-2 text-sm text-gray-900 dark:text-gray-100 py-2">
                  <MapPin className="w-4 h-4 text-gray-400" />{user?.address}
                </div>
              </div>
            )}
          </div>

          {isMe && (
            isOwnerVerified ? (
              <p className="text-xs text-amber-600 mt-4 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                Tài khoản đã xác nhận. Liên hệ 7 Trọ để chỉnh sửa thông tin.
              </p>
            ) : (
              <div className="flex gap-2 mt-4">
                {editing ? (
                  <>
                    <button onClick={handleSave} className="bg-emerald-600 text-white text-sm px-4 py-2 rounded-xl hover:bg-emerald-700">
                      Lưu thay đổi
                    </button>
                    <button onClick={() => setEditing(false)} className="text-sm text-gray-500 px-4 py-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700">
                      Hủy
                    </button>
                  </>
                ) : (
                  <button onClick={() => setEditing(true)} className="text-sm text-emerald-600 border border-emerald-300 px-4 py-2 rounded-xl hover:bg-emerald-50">
                    Chỉnh sửa thông tin
                  </button>
                )}
              </div>
            )
          )}
        </div>

        {/* Rooms Posted (for owners) */}
        {!isMe && user?.role === "owner" && (
           <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5">
             <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Các bài đăng của {user.name}</h3>
             <div className="space-y-3">
               {viewUserRooms.length === 0 ? (
                 <p className="text-center text-gray-500 text-sm py-4">Chưa có bài đăng nào.</p>
               ) : (
                 viewUserRooms.map(room => (
                   <Link key={room.id} to={`/room/${room.id}`} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-xl transition-colors">
                     <img src={room.images[0]} className="w-12 h-10 object-cover rounded-lg" alt="" />
                     <div className="flex-1 min-w-0">
                       <p className="text-sm font-medium text-gray-900 truncate">{room.title}</p>
                       <p className="text-xs text-emerald-600 font-bold">{formatPrice(room.price)}/tháng</p>
                     </div>
                   </Link>
                 ))
               )}
             </div>
           </div>
        )}

        {isMe && (
          <>
            {/* Change Password */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Lock className="w-4 h-4" />Đổi mật khẩu
              </h3>
              {/* ... password fields ... */}
              <form onSubmit={handleChangePw} className="space-y-3">
                {[
                  { label: "Mật khẩu hiện tại", key: "old" },
                  { label: "Mật khẩu mới", key: "new" },
                  { label: "Xác nhận mật khẩu mới", key: "confirm" },
                ].map((field) => (
                  <div key={field.key}>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{field.label}</label>
                    <div className="relative">
                      <input
                        type={showPw ? "text" : "password"}
                        value={pwForm[field.key as keyof typeof pwForm]}
                        onChange={(e) => setPwForm((p) => ({ ...p, [field.key]: e.target.value }))}
                        className="w-full text-sm border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl px-4 py-3 pr-11 outline-none focus:border-emerald-500"
                      />
                      {field.key === "old" && (
                        <button type="button" onClick={() => setShowPw((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                          {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      )}
                    </div>
                    {field.key === "new" && pwForm.new.length > 0 && (
                      <div className="mt-2 text-xs">
                        <div className="flex gap-1 mb-1.5">
                          {[1, 2, 3, 4, 5].map((level) => (
                            <div
                              key={level}
                              className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                                getPasswordStrength(pwForm.new) >= level
                                  ? getStrengthColor(getPasswordStrength(pwForm.new))
                                  : "bg-gray-200 dark:bg-gray-700"
                              }`}
                            />
                          ))}
                        </div>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">
                          Yêu cầu: ≥ 8 ký tự, chữ hoa, chữ thường, số, ký tự đặc biệt.
                        </p>
                      </div>
                    )}
                  </div>
                ))}
                <button type="submit" className="bg-emerald-600 text-white text-sm px-5 py-2.5 rounded-xl hover:bg-emerald-700 font-medium">
                  Đổi mật khẩu
                </button>
              </form>
            </div>

            {/* Logout */}
            <button
              onClick={() => { logout(); navigate("/"); }}
              className="w-full text-red-600 border border-red-200 py-3 rounded-2xl text-sm font-medium hover:bg-red-50 transition-colors"
            >
              Đăng xuất
            </button>
          </>
        )}
      </div>
    </div>
  );
}
