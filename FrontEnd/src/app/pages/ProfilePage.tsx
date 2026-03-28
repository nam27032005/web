import { useState } from "react";
import { User, Phone, Mail, MapPin, Lock, Eye, EyeOff, CheckCircle, AlertTriangle } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router";

export function ProfilePage() {
  const { currentUser, updateUser, logout } = useAuth();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: currentUser?.name || "",
    phone: currentUser?.phone || "",
  });
  const [pwForm, setPwForm] = useState({ old: "", new: "", confirm: "" });
  const [showPw, setShowPw] = useState(false);
  const [saved, setSaved] = useState(false);
  const [pwError, setPwError] = useState("");
  const [pwSuccess, setPwSuccess] = useState(false);

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Bạn cần đăng nhập.</p>
          <Link to="/login" className="text-emerald-600 hover:underline">Đăng nhập</Link>
        </div>
      </div>
    );
  }

  const isOwnerVerified = currentUser.role === "owner" && currentUser.verified;

  const handleSave = () => {
    updateUser({ name: form.name, phone: form.phone });
    setEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleChangePw = (e: React.FormEvent) => {
    e.preventDefault();
    setPwError("");
    if (pwForm.old !== currentUser.password) {
      setPwError("Mật khẩu cũ không đúng.");
      return;
    }
    if (pwForm.new.length < 6) {
      setPwError("Mật khẩu mới phải có ít nhất 6 ký tự.");
      return;
    }
    if (pwForm.new !== pwForm.confirm) {
      setPwError("Mật khẩu mới không khớp.");
      return;
    }
    updateUser({ password: pwForm.new });
    setPwSuccess(true);
    setPwForm({ old: "", new: "", confirm: "" });
    setTimeout(() => setPwSuccess(false), 2500);
  };

  const roleLabel =
    currentUser.role === "admin"
      ? "Quản trị viên"
      : currentUser.role === "owner"
      ? "Chủ nhà trọ"
      : "Người thuê trọ";

  const roleColor =
    currentUser.role === "admin"
      ? "bg-purple-100 text-purple-700"
      : currentUser.role === "owner"
      ? "bg-blue-100 text-blue-700"
      : "bg-green-100 text-green-700";

  return (
    <div className="bg-gray-50 min-h-screen pb-12">
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-5">
          <h1 className="text-xl font-bold text-gray-900">Tài khoản của tôi</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 space-y-5">
        {/* Profile Card */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center gap-4 mb-5">
            <div className="w-16 h-16 rounded-full overflow-hidden bg-emerald-100 flex-shrink-0">
              <img src={currentUser.avatar} alt={currentUser.name} className="w-full h-full object-cover" />
            </div>
            <div>
              <h2 className="font-bold text-gray-900 text-lg">{currentUser.name}</h2>
              <span className={`text-xs px-2.5 py-0.5 rounded-full ${roleColor}`}>{roleLabel}</span>
              {currentUser.role === "owner" && (
                <div className="mt-1">
                  {isOwnerVerified ? (
                    <span className="flex items-center gap-1 text-xs text-green-600">
                      <CheckCircle className="w-3.5 h-3.5" />Tài khoản đã được xác nhận
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-xs text-amber-600">
                      <AlertTriangle className="w-3.5 h-3.5" />Chờ xác nhận bởi AccomodCorp
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

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">Họ và tên</label>
              {editing && !isOwnerVerified ? (
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  className="w-full text-sm border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-emerald-500"
                />
              ) : (
                <div className="flex items-center gap-2 text-sm text-gray-900 py-2">
                  <User className="w-4 h-4 text-gray-400" />{currentUser.name}
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">Email</label>
              <div className="flex items-center gap-2 text-sm text-gray-900 py-2">
                <Mail className="w-4 h-4 text-gray-400" />{currentUser.email}
                <span className="text-xs text-gray-400">(Không thể thay đổi)</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">Số điện thoại</label>
              {editing && !isOwnerVerified ? (
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                  className="w-full text-sm border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-emerald-500"
                />
              ) : (
                <div className="flex items-center gap-2 text-sm text-gray-900 py-2">
                  <Phone className="w-4 h-4 text-gray-400" />{currentUser.phone}
                </div>
              )}
            </div>

            {currentUser.address && (
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">Địa chỉ thường trú</label>
                <div className="flex items-center gap-2 text-sm text-gray-900 py-2">
                  <MapPin className="w-4 h-4 text-gray-400" />{currentUser.address}
                </div>
              </div>
            )}
          </div>

          {isOwnerVerified ? (
            <p className="text-xs text-amber-600 mt-4 flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" />
              Tài khoản đã xác nhận. Liên hệ AccomodCorp để chỉnh sửa thông tin.
            </p>
          ) : (
            <div className="flex gap-2 mt-4">
              {editing ? (
                <>
                  <button onClick={handleSave} className="bg-emerald-600 text-white text-sm px-4 py-2 rounded-xl hover:bg-emerald-700">
                    Lưu thay đổi
                  </button>
                  <button onClick={() => setEditing(false)} className="text-sm text-gray-500 px-4 py-2 rounded-xl hover:bg-gray-100">
                    Hủy
                  </button>
                </>
              ) : (
                <button onClick={() => setEditing(true)} className="text-sm text-emerald-600 border border-emerald-300 px-4 py-2 rounded-xl hover:bg-emerald-50">
                  Chỉnh sửa thông tin
                </button>
              )}
            </div>
          )}
        </div>

        {/* Change Password */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Lock className="w-4 h-4" />Đổi mật khẩu
          </h3>

          {pwSuccess && (
            <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2.5 mb-4">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <p className="text-sm text-emerald-700">Mật khẩu đã được đổi thành công.</p>
            </div>
          )}

          {pwError && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-3 py-2.5 mb-4">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              <p className="text-sm text-red-600">{pwError}</p>
            </div>
          )}

          <form onSubmit={handleChangePw} className="space-y-3">
            {[
              { label: "Mật khẩu hiện tại", key: "old" },
              { label: "Mật khẩu mới", key: "new" },
              { label: "Xác nhận mật khẩu mới", key: "confirm" },
            ].map((field) => (
              <div key={field.key}>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{field.label}</label>
                <div className="relative">
                  <input
                    type={showPw ? "text" : "password"}
                    value={pwForm[field.key as keyof typeof pwForm]}
                    onChange={(e) => setPwForm((p) => ({ ...p, [field.key]: e.target.value }))}
                    className="w-full text-sm border border-gray-200 rounded-xl px-4 py-3 pr-11 outline-none focus:border-emerald-500"
                  />
                  {field.key === "old" && (
                    <button type="button" onClick={() => setShowPw((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                      {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  )}
                </div>
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
      </div>
    </div>
  );
}
