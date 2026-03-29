import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { Eye, EyeOff, Building2, AlertCircle, CheckCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export function ResetPasswordPage() {
  const { resetPassword } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setError("Token không tồn tại hoặc không hợp lệ.");
      return;
    }
    if (getPasswordStrength(password) < 5) {
      setError("Mật khẩu mới chưa đủ mạnh (đạt " + getPasswordStrength(password) + "/5 vạch).");
      return;
    }
    if (password !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp.");
      return;
    }
    
    setLoading(true);
    setError("");
    try {
      const result = await resetPassword(token, password);
      if (result.success) {
        setSuccess(true);
        setTimeout(() => navigate('/login'), 3000);
      } else {
        setError(result.message);
      }
    } catch (err: any) {
      setError("Lỗi xử lý.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
        <div className="text-center max-w-md bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm">
          <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Đổi mật khẩu thành công!</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
            Mật khẩu của bạn đã được cập nhật. Bạn có thể đăng nhập bằng mật khẩu mới.
          </p>
          <div className="mt-4 text-sm text-emerald-600 dark:text-emerald-400 animate-pulse">Đang chuyển hướng về Đăng nhập...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-3">
            <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900 dark:text-white">
              7 <span className="text-emerald-600">trọ</span>
            </span>
          </Link>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white mt-2">Đặt lại mật khẩu</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Vui lòng nhập mật khẩu mới cho tài khoản của bạn.
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 md:p-8">
          {(!token) && (
            <div className="flex items-center gap-2 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl px-3 py-2.5 mb-6">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
              <p className="text-sm text-red-600 dark:text-red-400">Đường dẫn đặt lại mật khẩu không hợp lệ.</p>
            </div>
          )}
          {error && (
            <div className="flex items-start gap-2 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl px-3 py-2.5 mb-6">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Mật khẩu mới</label>
              <div className="relative">
                <input
                  type={showPwd ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full text-sm border bg-white dark:bg-gray-900 dark:text-white rounded-xl px-4 py-3 pr-11 outline-none focus:ring-2 transition-all border-gray-200 dark:border-gray-700 focus:border-emerald-500 focus:ring-emerald-100 dark:focus:ring-emerald-900/30"
                  disabled={!token || loading}
                />
                <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                  {showPwd ? <EyeOff className="w-4 h-4"/> : <Eye className="w-4 h-4"/>}
                </button>
              </div>
              {password.length > 0 && (
                <div className="mt-2 text-xs">
                  <div className="flex gap-1 mb-1.5">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <div
                        key={level}
                        className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                          getPasswordStrength(password) >= level
                            ? getStrengthColor(getPasswordStrength(password))
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
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Xác nhận mật khẩu</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full text-sm border bg-white dark:bg-gray-900 dark:text-white rounded-xl px-4 py-3 outline-none focus:ring-2 transition-all border-gray-200 dark:border-gray-700 focus:border-emerald-500 focus:ring-emerald-100 dark:focus:ring-emerald-900/30"
                disabled={!token || loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading || !token}
              className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white py-3 rounded-xl font-medium text-sm transition-colors mt-2"
            >
              {loading ? "Đang đặt lại..." : "Đặt lại mật khẩu"}
            </button>
          </form>

        </div>
      </div>
    </div>
  );
}
