import { useState } from "react";
import { Link } from "react-router";
import { Building2, AlertCircle, CheckCircle, Mail, ArrowLeft } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export function ForgotPasswordPage() {
  const { forgotPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError("Vui lòng nhập email.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const result = await forgotPassword(email);
      if (result.success) {
        setSuccess(true);
      } else {
        setError(result.message);
      }
    } catch (err: any) {
      setError("Lỗi xử lý. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
        <div className="text-center max-w-md bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm">
          <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Đã gửi liên kết!</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
            Chúng tôi đã gửi một liên kết đặt lại mật khẩu đến <strong>{email}</strong>. Vui lòng kiểm tra hộp thư của bạn (kể cả mục Thư rác).
          </p>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-sm text-emerald-600 hover:text-emerald-700 font-medium"
          >
            <ArrowLeft className="w-4 h-4" /> Quay lại đăng nhập
          </Link>
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
          <h1 className="text-xl font-bold text-gray-900 dark:text-white mt-2">Quên mật khẩu?</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Đừng lo lắng, chúng tôi sẽ gửi liên kết để bạn đặt lại mật khẩu.
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 md:p-8">
          {error && (
            <div className="flex items-start gap-2 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl px-3 py-2.5 mb-6">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Email của bạn
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full text-sm border bg-white dark:bg-gray-900 dark:text-white rounded-xl px-4 py-3 outline-none focus:ring-2 transition-all border-gray-200 dark:border-gray-700 focus:border-emerald-500 focus:ring-emerald-100 dark:focus:ring-emerald-900/30"
                placeholder="example@email.com"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white py-3 rounded-xl font-medium text-sm transition-colors"
            >
              {loading ? "Đang gửi..." : "Gửi liên kết"}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6 pt-6 border-t border-gray-100 dark:border-gray-700">
            <Link to="/login" className="inline-flex items-center gap-1.5 text-emerald-600 font-medium hover:underline">
              <ArrowLeft className="w-4 h-4" /> Quay lại đăng nhập
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
