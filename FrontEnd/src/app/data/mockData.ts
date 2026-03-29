// ============================================================
// EASYACCOMOD - TypeScript Interfaces (Dọn dẹp Mock Data)
// ============================================================

export type UserRole = "renter" | "owner" | "admin";
export type PostStatus = "pending" | "approved" | "rejected" | "expired";
export type RoomType = "phong_tro" | "chung_cu_mini" | "nha_nguyen_can" | "chung_cu_nguyen_can";
export type RoomStatus = "available" | "rented";

export interface User {
  id: string;
  _id?: string;
  role: UserRole;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  address?: string;
  cccd?: string;
  verified?: boolean; // owner: đã được admin xác nhận
  createdAt: string;
}

export interface UserCredential {
  userId: string;
  email: string;
  passwordHash: string; // trong demo: plain text, production: dùng bcrypt
}

export interface Room {
  id: string;
  _id?: string;
  ownerId: string;
  ownerName: string;
  ownerPhone: string;
  title: string;
  description: string;
  address: {
    street: string;
    ward: string;
    district: string;
    city: string;
    full: string;
  };
  nearBy: string[];
  roomType: RoomType;
  roomCount: number;
  price: number;
  priceUnit: "month" | "quarter" | "year";
  area: number;
  sharedOwner: boolean;
  bathroom: { type: "private" | "shared"; hasHotWater: boolean };
  kitchen: "private" | "shared" | "none";
  hasAC: boolean;
  hasBalcony: boolean;
  electricityPrice: "standard" | "rental";
  electricityRate?: number;
  waterRate?: number;
  amenities: string[];
  images: string[];
  status: RoomStatus;
  postStatus: PostStatus;
  displayDuration: number;
  displayDurationUnit: "week" | "month" | "quarter" | "year";
  postFee: number;
  views: number;
  favorites: number;
  createdAt: string;
  approvedAt?: string;
  expiresAt?: string;
  rejectedReason?: string;
}

export interface Review {
  id: string;
  _id?: string;
  roomId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  rating: number;
  comment: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}

export interface Notification {
  id: string;
  _id?: string;
  userId: string;
  title: string;
  message: string;
  read: boolean;
  type: "approval" | "rejection" | "status" | "renewal" | "system";
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  _id?: string;
  fromId: string | User;
  fromName: string;
  toId: string | User;
  message: string;
  timestamp?: string;
  createdAt?: string;
}

export interface Report {
  id: string;
  _id?: string;
  roomId: string;
  userId: string;
  reason: string;
  description: string;
  status: "pending" | "resolved";
  createdAt: string;
}

// ============================================================
// HỖ TRỢ HIỂN THỊ UI (Giữ lại để build)
// ============================================================

export const ROOM_TYPE_LABELS: Record<RoomType, string> = {
  phong_tro: "Phòng trọ",
  chung_cu_mini: "Chung cư mini",
  nha_nguyen_can: "Nhà nguyên căn",
  chung_cu_nguyen_can: "Chung cư nguyên căn",
};

export const POST_STATUS_LABELS: Record<PostStatus, string> = {
  pending: "Chờ duyệt",
  approved: "Đã duyệt",
  rejected: "Bị từ chối",
  expired: "Hết hạn",
};

export const POST_STATUS_COLORS: Record<PostStatus, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  approved: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
  expired: "bg-gray-100 text-gray-800",
};

export const POST_PRICING_RATES: Record<string, { label: string; price: number }> = {
  week: { label: "Tuần", price: 50000 },
  month: { label: "Tháng", price: 200000 },
  quarter: { label: "Quý (3 tháng)", price: 450000 },
  year: { label: "Năm", price: 1500000 },
};

export function formatPrice(price: number): string {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);
}

export function calcPostFee(duration: number, unit: string): number {
  const rate = POST_PRICING_RATES[unit]?.price || 200000;
  return duration * rate;
}

// (Đã dọn dẹp biến tạm sau khi migrate sang API MongoDB)
