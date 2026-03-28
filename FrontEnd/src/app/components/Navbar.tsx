import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router";
import {
  Bell,
  LogOut,
  User,
  ChevronDown,
  Menu,
  X,
  Home,
  Search,
  Heart,
  LayoutDashboard,
  ShieldCheck,
  Building2,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useApp } from "../context/AppContext";

export function Navbar() {
  const { currentUser, logout, isAuthenticated, isRole } = useAuth();
  const { getNotificationsForUser, markAllNotificationsRead } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const notifications = currentUser
    ? getNotificationsForUser(currentUser.id)
    : [];
  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleLogout = () => {
    logout();
    setProfileOpen(false);
    navigate("/");
  };

  const handleNotifOpen = () => {
    setNotifOpen((v) => !v);
    if (currentUser && !notifOpen) {
      markAllNotificationsRead(currentUser.id);
    }
  };

  const isActive = (path: string) =>
    location.pathname === path
      ? "text-emerald-600 font-semibold"
      : "text-gray-600 hover:text-emerald-600";

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">
              Easy<span className="text-emerald-600">Accomod</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/" className={`text-sm transition-colors ${isActive("/")}`}>
              <span className="flex items-center gap-1"><Home className="w-4 h-4" />Trang chủ</span>
            </Link>
            <Link to="/search" className={`text-sm transition-colors ${isActive("/search")}`}>
              <span className="flex items-center gap-1"><Search className="w-4 h-4" />Tìm phòng</span>
            </Link>
            {isAuthenticated && isRole("renter") && (
              <Link to="/favorites" className={`text-sm transition-colors ${isActive("/favorites")}`}>
                <span className="flex items-center gap-1"><Heart className="w-4 h-4" />Yêu thích</span>
              </Link>
            )}
            {isAuthenticated && isRole("owner") && (
              <Link to="/owner" className={`text-sm transition-colors ${isActive("/owner")}`}>
                <span className="flex items-center gap-1"><LayoutDashboard className="w-4 h-4" />Quản lý bài đăng</span>
              </Link>
            )}
            {isAuthenticated && isRole("admin") && (
              <Link to="/admin" className={`text-sm transition-colors ${isActive("/admin")}`}>
                <span className="flex items-center gap-1"><ShieldCheck className="w-4 h-4" />Quản trị</span>
              </Link>
            )}
          </div>

          {/* Right Side */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <>
                {/* Notifications */}
                <div className="relative">
                  <button
                    onClick={handleNotifOpen}
                    className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
                  >
                    <Bell className="w-5 h-5 text-gray-600" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </span>
                    )}
                  </button>
                  {notifOpen && (
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50">
                      <div className="p-3 border-b border-gray-100 flex justify-between items-center">
                        <span className="font-semibold text-gray-800">Thông báo</span>
                        <button onClick={() => setNotifOpen(false)} className="text-gray-400 hover:text-gray-600">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="max-h-72 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <p className="text-center text-gray-500 py-6 text-sm">Không có thông báo</p>
                        ) : (
                          notifications.slice(0, 8).map((n) => (
                            <div
                              key={n.id}
                              className={`p-3 border-b border-gray-50 hover:bg-gray-50 ${!n.read ? "bg-emerald-50" : ""}`}
                            >
                              <p className="text-sm font-medium text-gray-800">{n.title}</p>
                              <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{n.message}</p>
                              <p className="text-xs text-gray-400 mt-1">{n.createdAt}</p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Profile Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setProfileOpen((v) => !v)}
                    className="flex items-center gap-2 hover:bg-gray-100 rounded-full pl-1 pr-3 py-1 transition-colors"
                  >
                    <img
                      src={currentUser?.avatar}
                      alt={currentUser?.name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <span className="text-sm font-medium text-gray-700 max-w-[100px] truncate">
                      {currentUser?.name}
                    </span>
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  </button>
                  {profileOpen && (
                    <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50">
                      <div className="p-3 border-b border-gray-100">
                        <p className="text-sm font-semibold text-gray-800">{currentUser?.name}</p>
                        <p className="text-xs text-gray-500">{currentUser?.email}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full mt-1 inline-block ${
                          currentUser?.role === "admin" ? "bg-purple-100 text-purple-700" :
                          currentUser?.role === "owner" ? "bg-blue-100 text-blue-700" :
                          "bg-green-100 text-green-700"
                        }`}>
                          {currentUser?.role === "admin" ? "Admin" : currentUser?.role === "owner" ? "Chủ nhà trọ" : "Người thuê"}
                        </span>
                      </div>
                      <Link
                        to="/profile"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <User className="w-4 h-4" />Tài khoản của tôi
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 w-full text-left"
                      >
                        <LogOut className="w-4 h-4" />Đăng xuất
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="text-sm text-gray-700 hover:text-emerald-600 px-4 py-2 rounded-lg transition-colors"
                >
                  Đăng nhập
                </Link>
                <Link
                  to="/register"
                  className="text-sm bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  Đăng ký
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100"
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 py-3 space-y-1">
          <Link to="/" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 py-2 text-sm text-gray-700 hover:text-emerald-600">
            <Home className="w-4 h-4" />Trang chủ
          </Link>
          <Link to="/search" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 py-2 text-sm text-gray-700 hover:text-emerald-600">
            <Search className="w-4 h-4" />Tìm phòng
          </Link>
          {isAuthenticated && isRole("renter") && (
            <Link to="/favorites" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 py-2 text-sm text-gray-700 hover:text-emerald-600">
              <Heart className="w-4 h-4" />Yêu thích
            </Link>
          )}
          {isAuthenticated && isRole("owner") && (
            <Link to="/owner" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 py-2 text-sm text-gray-700 hover:text-emerald-600">
              <LayoutDashboard className="w-4 h-4" />Quản lý
            </Link>
          )}
          {isAuthenticated && isRole("admin") && (
            <Link to="/admin" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 py-2 text-sm text-gray-700 hover:text-emerald-600">
              <ShieldCheck className="w-4 h-4" />Quản trị
            </Link>
          )}
          {!isAuthenticated ? (
            <div className="flex gap-2 pt-2">
              <Link to="/login" onClick={() => setMenuOpen(false)} className="flex-1 text-center text-sm text-gray-700 border border-gray-300 py-2 rounded-lg">
                Đăng nhập
              </Link>
              <Link to="/register" onClick={() => setMenuOpen(false)} className="flex-1 text-center text-sm bg-emerald-600 text-white py-2 rounded-lg">
                Đăng ký
              </Link>
            </div>
          ) : (
            <button onClick={handleLogout} className="flex items-center gap-2 py-2 text-sm text-red-600 w-full">
              <LogOut className="w-4 h-4" />Đăng xuất
            </button>
          )}
        </div>
      )}
    </nav>
  );
}
