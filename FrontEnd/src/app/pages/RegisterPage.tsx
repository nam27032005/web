import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { Eye, EyeOff, Building2, AlertCircle, CheckCircle, User, Home } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const defaultRole = searchParams.get("role") === "owner" ? "owner" : "renter";

  const [role, setRole] = useState<"renter" | "owner">(defaultRole);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    address: "",
    cccd: "",
  });
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = "Vui lòng nhập họ tên.";
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email))
      errs.email = "Email không hợp lệ.";
    if (!form.phone.trim() || !/^0\d{9}$/.test(form.phone))
      errs.phone = "Số điện thoại không hợp lệ (10 số, bắt đầu bằng 0).";
    if (form.password.length < 6) errs.password = "Mật khẩu phải có ít nhất 6 ký tự.";
    if (form.password !== form.confirmPassword)
      errs.confirmPassword = "Mật khẩu xác nhận không khớp.";
    if (role === "owner") {
      if (!form.address.trim()) errs.address = "Vui lòng nhập địa chỉ thường trú.";
      if (!form.cccd.trim() || form.cccd.length !== 12)
        errs.cccd = "Số CCCD phải có 12 chữ số.";
    }
    return errs;
  };

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setLoading(true);
    setTimeout(() => {
      const result = register({
        role,
        name: form.name,
        email: form.email,
        phone: form.phone,
        password: form.password,
        address: form.address,
        cccd: form.cccd,
      });
      if (result.success) {
        setSuccess(true);
        setTimeout(() => navigate(role === "renter" ? "/" : "/login"), 2000);
      } else {
        setError(result.message);
      }
      setLoading(false);
    }, 800);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-emerald-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Đăng ký thành công!</h2>
          {role === "owner" ? (
            <p className="text-sm text-gray-600">
              Tài khoản chủ nhà của bạn đã được tạo. Vui lòng liên hệ trực tiếp với AccomodCorp để xác nhận thông tin trước khi đăng bài.
            </p>
          ) : (
            <p className="text-sm text-gray-600">
              Tài khoản người thuê trọ của bạn đã được tạo và có thể sử dụng ngay.
            </p>
          )}
          <div className="mt-4 text-sm text-emerald-600 animate-pulse">Đang chuyển hướng...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-lg mx-auto">
        {/* Logo */}
        <div className="text-center mb-6">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900">
              Easy<span className="text-emerald-600">Accomod</span>
            </span>
          </Link>
          <h1 className="text-xl font-bold text-gray-900 mt-4">Tạo tài khoản mới</h1>
          <p className="text-sm text-gray-500 mt-1">Tham gia cộng đồng tìm nhà trọ hàng đầu</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          {/* Role Selection */}
          <div className="mb-5">
            <p className="text-sm font-medium text-gray-700 mb-3">Bạn là:</p>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole("renter")}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                  role === "renter"
                    ? "border-emerald-500 bg-emerald-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <User className={`w-6 h-6 ${role === "renter" ? "text-emerald-600" : "text-gray-400"}`} />
                <div>
                  <p className={`text-sm font-medium ${role === "renter" ? "text-emerald-700" : "text-gray-700"}`}>
                    Người thuê trọ
                  </p>
                  <p className="text-xs text-gray-400">Sử dụng ngay</p>
                </div>
              </button>
              <button
                type="button"
                onClick={() => setRole("owner")}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                  role === "owner"
                    ? "border-emerald-500 bg-emerald-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <Home className={`w-6 h-6 ${role === "owner" ? "text-emerald-600" : "text-gray-400"}`} />
                <div>
                  <p className={`text-sm font-medium ${role === "owner" ? "text-emerald-700" : "text-gray-700"}`}>
                    Chủ nhà trọ
                  </p>
                  <p className="text-xs text-gray-400">Cần xác thực</p>
                </div>
              </button>
            </div>
          </div>

          {role === "owner" && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-5">
              <p className="text-xs text-amber-700">
                ⚠️ Tài khoản chủ nhà cần được AccomodCorp xác nhận thủ công trước khi có thể đăng bài. Sau khi đăng ký, vui lòng liên hệ trực tiếp với công ty.
              </p>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-3 py-2.5 mb-4">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Họ và tên <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.name}
                onChange={handleChange("name")}
                placeholder="Nguyễn Văn A"
                className={`w-full text-sm border rounded-xl px-4 py-3 outline-none focus:ring-2 transition-all ${
                  errors.name ? "border-red-400 focus:border-red-400 focus:ring-red-100" : "border-gray-200 focus:border-emerald-500 focus:ring-emerald-100"
                }`}
              />
              {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={form.email}
                onChange={handleChange("email")}
                placeholder="example@email.com"
                className={`w-full text-sm border rounded-xl px-4 py-3 outline-none focus:ring-2 transition-all ${
                  errors.email ? "border-red-400 focus:border-red-400 focus:ring-red-100" : "border-gray-200 focus:border-emerald-500 focus:ring-emerald-100"
                }`}
              />
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Số điện thoại <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={form.phone}
                onChange={handleChange("phone")}
                placeholder="0912345678"
                className={`w-full text-sm border rounded-xl px-4 py-3 outline-none focus:ring-2 transition-all ${
                  errors.phone ? "border-red-400 focus:border-red-400 focus:ring-red-100" : "border-gray-200 focus:border-emerald-500 focus:ring-emerald-100"
                }`}
              />
              {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
            </div>

            {/* Owner specific fields */}
            {role === "owner" && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Số CCCD <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.cccd}
                    onChange={handleChange("cccd")}
                    placeholder="012345678901"
                    maxLength={12}
                    className={`w-full text-sm border rounded-xl px-4 py-3 outline-none focus:ring-2 transition-all ${
                      errors.cccd ? "border-red-400 focus:border-red-400 focus:ring-red-100" : "border-gray-200 focus:border-emerald-500 focus:ring-emerald-100"
                    }`}
                  />
                  {errors.cccd && <p className="text-xs text-red-500 mt-1">{errors.cccd}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Địa chỉ thường trú <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.address}
                    onChange={handleChange("address")}
                    placeholder="Số nhà, đường, phường, quận, tỉnh/TP"
                    className={`w-full text-sm border rounded-xl px-4 py-3 outline-none focus:ring-2 transition-all ${
                      errors.address ? "border-red-400 focus:border-red-400 focus:ring-red-100" : "border-gray-200 focus:border-emerald-500 focus:ring-emerald-100"
                    }`}
                  />
                  {errors.address && <p className="text-xs text-red-500 mt-1">{errors.address}</p>}
                </div>
              </>
            )}

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Mật khẩu <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPwd ? "text" : "password"}
                  value={form.password}
                  onChange={handleChange("password")}
                  placeholder="Ít nhất 6 ký tự"
                  className={`w-full text-sm border rounded-xl px-4 py-3 pr-11 outline-none focus:ring-2 transition-all ${
                    errors.password ? "border-red-400 focus:border-red-400 focus:ring-red-100" : "border-gray-200 focus:border-emerald-500 focus:ring-emerald-100"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                >
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Xác nhận mật khẩu <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                value={form.confirmPassword}
                onChange={handleChange("confirmPassword")}
                placeholder="Nhập lại mật khẩu"
                className={`w-full text-sm border rounded-xl px-4 py-3 outline-none focus:ring-2 transition-all ${
                  errors.confirmPassword ? "border-red-400 focus:border-red-400 focus:ring-red-100" : "border-gray-200 focus:border-emerald-500 focus:ring-emerald-100"
                }`}
              />
              {errors.confirmPassword && (
                <p className="text-xs text-red-500 mt-1">{errors.confirmPassword}</p>
              )}
            </div>

            <div className="flex items-start gap-2">
              <input type="checkbox" className="accent-emerald-600 mt-0.5" required />
              <p className="text-xs text-gray-500">
                Tôi đồng ý với{" "}
                <a href="#" className="text-emerald-600 hover:underline">Điều khoản sử dụng</a> và{" "}
                <a href="#" className="text-emerald-600 hover:underline">Chính sách bảo mật</a> của EasyAccomod.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white py-3 rounded-xl font-medium text-sm transition-colors"
            >
              {loading ? "Đang xử lý..." : "Đăng ký tài khoản"}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-4">
            Đã có tài khoản?{" "}
            <Link to="/login" className="text-emerald-600 font-medium hover:underline">
              Đăng nhập
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
