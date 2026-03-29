import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { Eye, EyeOff, Building2, AlertCircle, CheckCircle, User, Home, Mail } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export function RegisterPage() {
  const { sendRegisterOtp, register } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const defaultRole = searchParams.get("role") === "owner" ? "owner" : "renter";

  const [role, setRole] = useState<"renter" | "owner">(defaultRole);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    gender: "nam",
    password: "",
    confirmPassword: "",
    address: "",
    cccd: "",
  });
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<1 | 2>(1); // 1: Info, 2: OTP

  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

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

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = "Vui lòng nhập họ tên.";
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email))
      errs.email = "Email không hợp lệ.";
    if (!form.phone.trim() || !/^0\d{9}$/.test(form.phone))
      errs.phone = "Số điện thoại không hợp lệ (10 số, bắt đầu bằng 0).";
    if (getPasswordStrength(form.password) < 5) errs.password = "Mật khẩu chưa đủ mạnh (đạt " + getPasswordStrength(form.password) + "/5 vạch).";
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

  const handleNextStep = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const result = await sendRegisterOtp(form.email, form.name);
      if (result.success) {
        setStep(2);
      } else {
        setError(result.message);
      }
    } catch (err: any) {
      setError("Lỗi gửi OTP.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) {
      setError("Vui lòng nhập mã OTP 6 số.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const result = await register({
        role,
        name: form.name,
        email: form.email,
        phone: form.phone,
        gender: form.gender,
        password: form.password,
        address: form.address,
        cccd: form.cccd,
        otp,
      });
      if (result.success) {
        setSuccess(true);
        setTimeout(() => navigate(role === "renter" ? "/" : "/login"), 2000);
      } else {
        setError(result.message);
      }
    } catch (err: any) {
      setError("Lỗi xác nhận đăng ký.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Đăng ký thành công!</h2>
          {role === "owner" ? (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Tài khoản chủ nhà của bạn đã được tạo. Vui lòng liên hệ trực tiếp với 7 Trọ để xác nhận thông tin trước khi đăng bài.
            </p>
          ) : (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Tài khoản người thuê trọ của bạn đã được tạo và có thể sử dụng ngay.
            </p>
          )}
          <div className="mt-4 text-sm text-emerald-600 dark:text-emerald-400 animate-pulse">Đang chuyển hướng...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900 dark:text-white">
              7 <span className="text-emerald-600">trọ</span>
            </span>
          </Link>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white mt-4">Tạo tài khoản mới</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Tham gia cộng đồng tìm nhà trọ hàng đầu</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 md:p-8">
          
          {error && (
            <div className="flex items-center gap-2 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl px-3 py-2.5 mb-6">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {step === 1 ? (
            <form onSubmit={handleNextStep} className="space-y-4">
              {/* Role Selection */}
              <div className="mb-5">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-3">Bạn là:</p>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRole("renter")}
                    className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${
                      role === "renter"
                        ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20"
                        : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                    }`}
                  >
                    <User className={`w-5 h-5 ${role === "renter" ? "text-emerald-600 dark:text-emerald-400" : "text-gray-400"}`} />
                    <p className={`text-sm font-medium ${role === "renter" ? "text-emerald-700 dark:text-emerald-400" : "text-gray-700 dark:text-gray-300"}`}>
                      Người thuê
                    </p>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole("owner")}
                    className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${
                      role === "owner"
                        ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20"
                        : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                    }`}
                  >
                    <Home className={`w-5 h-5 ${role === "owner" ? "text-emerald-600 dark:text-emerald-400" : "text-gray-400"}`} />
                    <p className={`text-sm font-medium ${role === "owner" ? "text-emerald-700 dark:text-emerald-400" : "text-gray-700 dark:text-gray-300"}`}>
                      Chủ nhà trọ
                    </p>
                  </button>
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 focus:border-red-500">
                  Họ và tên
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={handleChange("name")}
                  className={`w-full text-sm border bg-white dark:bg-gray-900 dark:text-white rounded-xl px-4 py-3 outline-none focus:ring-2 transition-all ${errors.name ? 'border-red-400 focus:ring-red-100' : 'border-gray-200 dark:border-gray-700 focus:border-emerald-500 focus:ring-emerald-100 dark:focus:ring-emerald-900/30'}`}
                />
              </div>

              {/* Email & Phone grid */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={handleChange("email")}
                    className={`w-full text-sm border bg-white dark:bg-gray-900 dark:text-white rounded-xl px-4 py-3 outline-none focus:ring-2 transition-all ${errors.email ? 'border-red-400' : 'border-gray-200 dark:border-gray-700 focus:border-emerald-500'}`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Số điện thoại</label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={handleChange("phone")}
                    className={`w-full text-sm border bg-white dark:bg-gray-900 dark:text-white rounded-xl px-4 py-3 outline-none focus:ring-2 transition-all ${errors.phone ? 'border-red-400' : 'border-gray-200 dark:border-gray-700 focus:border-emerald-500'}`}
                  />
                </div>
              </div>

              {/* Gender */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Giới tính</label>
                <div className="flex gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" value="nam" checked={form.gender === "nam"} onChange={handleChange("gender")} className="accent-emerald-600 w-4 h-4" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Nam</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" value="nữ" checked={form.gender === "nữ"} onChange={handleChange("gender")} className="accent-emerald-600 w-4 h-4" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Nữ</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" value="khác" checked={form.gender === "khác"} onChange={handleChange("gender")} className="accent-emerald-600 w-4 h-4" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Khác</span>
                  </label>
                </div>
              </div>

              {/* Owner Address & CCCD */}
              {role === "owner" && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Số CCCD</label>
                    <input
                      type="text"
                      maxLength={12}
                      value={form.cccd}
                      onChange={handleChange("cccd")}
                      className={`w-full text-sm border bg-white dark:bg-gray-900 dark:text-white rounded-xl px-4 py-3 outline-none focus:ring-2 transition-all ${errors.cccd ? 'border-red-400' : 'border-gray-200 dark:border-gray-700 focus:border-emerald-500'}`}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Địa chỉ</label>
                    <input
                      type="text"
                      value={form.address}
                      onChange={handleChange("address")}
                      className={`w-full text-sm border bg-white dark:bg-gray-900 dark:text-white rounded-xl px-4 py-3 outline-none focus:ring-2 transition-all ${errors.address ? 'border-red-400' : 'border-gray-200 dark:border-gray-700 focus:border-emerald-500'}`}
                    />
                  </div>
                </div>
              )}

              {/* Passwords */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Mật khẩu</label>
                  <div className="relative">
                    <input
                      type={showPwd ? "text" : "password"}
                      value={form.password}
                      onChange={handleChange("password")}
                      className={`w-full text-sm border bg-white dark:bg-gray-900 dark:text-white rounded-xl px-4 py-3 pr-10 outline-none focus:ring-2 transition-all ${errors.password ? 'border-red-400' : 'border-gray-200 dark:border-gray-700 focus:border-emerald-500'}`}
                    />
                    <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                      {showPwd ? <EyeOff className="w-4 h-4"/> : <Eye className="w-4 h-4"/>}
                    </button>
                  </div>
                  {/* Strength Bar */}
                  {form.password.length > 0 && (
                    <div className="mt-2 text-xs">
                      <div className="flex gap-1 mb-1.5">
                        {[1, 2, 3, 4, 5].map((level) => (
                          <div
                            key={level}
                            className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                              getPasswordStrength(form.password) >= level
                                ? getStrengthColor(getPasswordStrength(form.password))
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
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Xác nhận MK</label>
                  <input
                    type="password"
                    value={form.confirmPassword}
                    onChange={handleChange("confirmPassword")}
                    className={`w-full text-sm border bg-white dark:bg-gray-900 dark:text-white rounded-xl px-4 py-3 outline-none focus:ring-2 transition-all ${errors.confirmPassword ? 'border-red-400' : 'border-gray-200 dark:border-gray-700 focus:border-emerald-500'}`}
                  />
                  {errors.confirmPassword && (
                    <p className="text-red-500 text-xs mt-1.5">{errors.confirmPassword}</p>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white py-3 rounded-xl font-medium text-sm transition-colors mt-2"
              >
                {loading ? "Đang xử lý..." : "Tiếp tục"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleSubmitOtp} className="space-y-5">
              <div className="text-center mb-6">
                <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Mail className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white text-lg">Xác nhận Email</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  Chúng tôi đã gửi mã xác nhận đến email <strong>{form.email}</strong>. Vui lòng kiểm tra hộp thư của bạn.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-center text-gray-700 dark:text-gray-300 mb-3">Nhập mã OTP (6 số)</label>
                <input
                  type="text"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  className="w-full text-center text-2xl tracking-widest font-mono border bg-gray-50 dark:bg-gray-900 dark:text-white rounded-xl px-4 py-3 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 dark:border-gray-700"
                  placeholder="------"
                  autoFocus
                />
              </div>

              <div className="flex flex-col gap-3">
                <button
                  type="submit"
                  disabled={loading || otp.length !== 6}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white py-3 rounded-xl font-medium text-sm transition-colors"
                >
                  {loading ? "Đang xử lý..." : "Hoàn tất đăng ký"}
                </button>
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => setStep(1)}
                  className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 font-medium"
                >
                  Quay lại sửa thông tin
                </button>
              </div>
            </form>
          )}

          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6 pt-6 border-t border-gray-100 dark:border-gray-700">
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
