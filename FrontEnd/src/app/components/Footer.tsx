import { Link } from "react-router";
import { Building2, Phone, Mail, MapPin, Facebook, Youtube } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">
                Easy<span className="text-emerald-400">Accomod</span>
              </span>
            </div>
            <p className="text-sm text-gray-400 mb-4">
              Hệ thống tìm nhà trọ hàng đầu Việt Nam. Kết nối chủ nhà và người thuê một cách nhanh chóng, an toàn.
            </p>
            <div className="flex gap-3">
              <a href="#" className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-emerald-600 transition-colors">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="#" className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-emerald-600 transition-colors">
                <Youtube className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold text-white mb-4">Người thuê trọ</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/search" className="hover:text-emerald-400 transition-colors">Tìm phòng trọ</Link></li>
              <li><Link to="/search?type=phong_tro" className="hover:text-emerald-400 transition-colors">Phòng trọ</Link></li>
              <li><Link to="/search?type=chung_cu_mini" className="hover:text-emerald-400 transition-colors">Chung cư mini</Link></li>
              <li><Link to="/search?type=nha_nguyen_can" className="hover:text-emerald-400 transition-colors">Nhà nguyên căn</Link></li>
              <li><Link to="/favorites" className="hover:text-emerald-400 transition-colors">Danh sách yêu thích</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">Chủ nhà trọ</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/register?role=owner" className="hover:text-emerald-400 transition-colors">Đăng ký tài khoản</Link></li>
              <li><Link to="/owner" className="hover:text-emerald-400 transition-colors">Đăng bài cho thuê</Link></li>
              <li><Link to="/owner" className="hover:text-emerald-400 transition-colors">Quản lý bài đăng</Link></li>
              <li><a href="#" className="hover:text-emerald-400 transition-colors">Bảng giá đăng tin</a></li>
              <li><a href="#" className="hover:text-emerald-400 transition-colors">Hướng dẫn đăng tin</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-white mb-4">Liên hệ AccomodCorp</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-0.5 text-emerald-400 flex-shrink-0" />
                <span>123 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>1800 1234 (Miễn phí)</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>support@easyaccomod.vn</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-10 pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <p>© 2026 AccomodCorp. Tất cả quyền được bảo lưu.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-gray-300">Điều khoản sử dụng</a>
            <a href="#" className="hover:text-gray-300">Chính sách bảo mật</a>
            <a href="#" className="hover:text-gray-300">Quy chế hoạt động</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
