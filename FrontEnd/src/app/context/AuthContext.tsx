import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import api from "../../lib/api";
import { User, UserRole } from "../data/mockData";

interface AuthContextType {
  currentUser: User | null;
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  sendRegisterOtp: (email: string, name: string) => Promise<{ success: boolean; message: string }>;
  register: (data: Partial<User> & { password: string; otp: string; gender?: string }) => Promise<{ success: boolean; message: string }>;
  forgotPassword: (email: string) => Promise<{ success: boolean; message: string }>;
  resetPassword: (token: string, password: string) => Promise<{ success: boolean; message: string }>;
  updateUser: (data: Partial<User>) => void;
  isAuthenticated: boolean;
  isRole: (role: UserRole) => boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Load user profile nếu có token
  useEffect(() => {
    const fetchMe = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await api.get("/auth/me");
        if (res.data.success) {
          setCurrentUser(res.data.user);
        }
      } catch (err) {
        localStorage.removeItem("token");
      } finally {
        setLoading(false);
      }
    };
    fetchMe();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const res = await api.post("/auth/login", { email, password });
      if (res.data.success) {
        localStorage.setItem("token", res.data.token);
        setCurrentUser(res.data.user);
        return { success: true, message: "Đăng nhập thành công!" };
      }
      return { success: false, message: res.data.message || "Lỗi đăng nhập." };
    } catch (err: any) {
      return { success: false, message: err.response?.data?.message || "Sai tài khoản hoặc mật khẩu." };
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    setCurrentUser(null);
  }, []);

  const sendRegisterOtp = useCallback(async (email: string, name: string) => {
    try {
      const res = await api.post("/auth/send-register-otp", { email, name });
      return { success: true, message: res.data.message || "OTP sent" };
    } catch (err: any) {
      return { success: false, message: err.response?.data?.message || "Lỗi gửi OTP." };
    }
  }, []);

  const register = useCallback(async (data: Partial<User> & { password: string; otp: string; gender?: string }) => {
    try {
      const payload = {
        name: data.name,
        email: data.email,
        phone: data.phone,
        password: data.password,
        role: data.role || "renter",
        address: data.address,
        cccd: data.cccd,
        otp: data.otp,
        gender: data.gender,
      };
      const res = await api.post("/auth/register", payload);
      if (res.data.success) {
        if (payload.role === "renter") {
          localStorage.setItem("token", res.data.token);
          setCurrentUser(res.data.user);
        }
        return { success: true, message: "Đăng ký thành công!" };
      }
      return { success: false, message: res.data.message || "Đăng ký thất bại." };
    } catch (err: any) {
      return { success: false, message: err.response?.data?.message || "Mã OTP không đúng hoặc email tồn tại." };
    }
  }, []);

  const forgotPassword = useCallback(async (email: string) => {
    try {
      const res = await api.post("/auth/forgot-password", { email });
      return { success: true, message: res.data.message };
    } catch (err: any) {
      return { success: false, message: err.response?.data?.message || "Lỗi." };
    }
  }, []);

  const resetPassword = useCallback(async (token: string, password: string) => {
    try {
      const res = await api.post("/auth/reset-password", { token, password });
      return { success: true, message: res.data.message };
    } catch (err: any) {
      return { success: false, message: err.response?.data?.message || "Lỗi." };
    }
  }, []);


  const updateUser = useCallback((data: Partial<User>) => {
    setCurrentUser((prev) => (prev ? { ...prev, ...data } : prev));
  }, []);

  const isAuthenticated = currentUser !== null;
  const isRole = (role: UserRole) => currentUser?.role === role;

  return (
    <AuthContext.Provider value={{ currentUser, login, logout, sendRegisterOtp, register, forgotPassword, resetPassword, updateUser, isAuthenticated, isRole, loading }}>
        {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
