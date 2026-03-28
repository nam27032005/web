import { Link } from "react-router";
import { Home, Search } from "lucide-react";

export function NotFoundPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="text-center">
        <div className="text-8xl font-bold text-emerald-100 mb-4">404</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Trang không tìm thấy</h1>
        <p className="text-gray-500 mb-8">
          Trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/"
            className="flex items-center gap-2 bg-emerald-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-emerald-700 transition-colors"
          >
            <Home className="w-4 h-4" />Về trang chủ
          </Link>
          <Link
            to="/search"
            className="flex items-center gap-2 border border-gray-200 text-gray-700 px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            <Search className="w-4 h-4" />Tìm phòng trọ
          </Link>
        </div>
      </div>
    </div>
  );
}
