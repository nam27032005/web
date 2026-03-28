import React, { createContext, useContext, useState, useCallback } from "react";
import { User, USERS, UserRole, USER_CREDENTIALS, UserCredential } from "../data/mockData";

interface AuthContextType {
  currentUser: User | null;
  login: (email: string, password: string) => { success: boolean; message: string };
  logout: () => void;
  register: (data: Partial<User> & { password: string }) => { success: boolean; message: string };
  updateUser: (data: Partial<User>) => void;
  isAuthenticated: boolean;
  isRole: (role: UserRole) => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>(USERS);
  const [credentials, setCredentials] = useState<UserCredential[]>(USER_CREDENTIALS);

  const login = useCallback(
    (email: string, password: string) => {
      const cred = credentials.find((c) => c.email === email && c.passwordHash === password);
      if (!cred) {
        return { success: false, message: "Email hoặc mật khẩu không đúng." };
      }
      const user = users.find((u) => u.id === cred.userId);
      if (!user) {
        return { success: false, message: "Tài khoản không tồn tại." };
      }
      setCurrentUser(user);
      return { success: true, message: "Đăng nhập thành công!" };
    },
    [credentials, users]
  );

  const logout = useCallback(() => {
    setCurrentUser(null);
  }, []);

  const register = useCallback(
    (data: Partial<User> & { password: string }) => {
      const exists = credentials.find((c) => c.email === data.email);
      if (exists) {
        return { success: false, message: "Email đã tồn tại trong hệ thống." };
      }
      const newUserId = `user-${Date.now()}`;
      const newUser: User = {
        id: newUserId,
        role: (data.role as UserRole) || "renter",
        name: data.name || "",
        email: data.email || "",
        phone: data.phone || "",
        avatar: "https://images.unsplash.com/photo-1765648763932-43a3e2f8f35c?w=80&h=80&fit=crop",
        address: data.address,
        cccd: data.cccd,
        verified: false,
        createdAt: new Date().toISOString().split("T")[0],
      };
      const newCred: UserCredential = {
        userId: newUserId,
        email: data.email || "",
        passwordHash: data.password, // production: bcrypt.hashSync(data.password, 10)
      };
      setUsers((prev) => [...prev, newUser]);
      setCredentials((prev) => [...prev, newCred]);
      if (data.role === "renter" || !data.role) {
        setCurrentUser(newUser);
      }
      return { success: true, message: "Đăng ký thành công!" };
    },
    [credentials]
  );

  const updateUser = useCallback((data: Partial<User>) => {
    setCurrentUser((prev) => (prev ? { ...prev, ...data } : prev));
  }, []);

  const isAuthenticated = currentUser !== null;
  const isRole = (role: UserRole) => currentUser?.role === role;

  return (
    <AuthContext.Provider value={{ currentUser, login, logout, register, updateUser, isAuthenticated, isRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
