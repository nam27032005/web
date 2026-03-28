// ============================================================
// EASYACCOMOD - Mock Data
// ============================================================

export type UserRole = "renter" | "owner" | "admin";
export type PostStatus = "pending" | "approved" | "rejected" | "expired";
export type RoomType = "phong_tro" | "chung_cu_mini" | "nha_nguyen_can" | "chung_cu_nguyen_can";
export type RoomStatus = "available" | "rented";

export interface User {
  id: string;
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

/** Chỉ dùng nội bộ cho auth – không expose ra ngoài state */
export interface UserCredential {
  userId: string;
  email: string;
  passwordHash: string; // trong demo: plain text, production: dùng bcrypt
}

export interface Room {
  id: string;
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
  userId: string;
  title: string;
  message: string;
  read: boolean;
  type: "approval" | "rejection" | "status" | "renewal" | "system";
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  fromId: string;
  fromName: string;
  toId: string;
  message: string;
  timestamp: string;
}

export interface Report {
  id: string;
  roomId: string;
  userId: string;
  reason: string;
  description: string;
  status: "pending" | "resolved";
  createdAt: string;
}

// ============================================================
// USERS
// ============================================================
export const USERS: User[] = [
  {
    id: "admin-001",
    role: "admin",
    name: "Nguyễn Admin",
    email: "admin@easyaccomod.vn",
    phone: "0901234567",
    avatar: "https://images.unsplash.com/photo-1738566061505-556830f8b8f5?w=200&h=200&fit=crop",
    verified: true,
    createdAt: "2024-01-01",
  },
  {
    id: "owner-001",
    role: "owner",
    name: "Trần Văn Minh",
    email: "owner@test.vn",
    phone: "0912345678",
    avatar: "https://images.unsplash.com/photo-1738566061505-556830f8b8f5?w=200&h=200&fit=crop",
    address: "123 Lê Văn Việt, Q9, TP.HCM",
    cccd: "012345678901",
    verified: true,
    createdAt: "2024-02-10",
  },
  {
    id: "owner-002",
    role: "owner",
    name: "Lê Thị Hương",
    email: "huong.owner@test.vn",
    phone: "0923456789",
    avatar: "https://images.unsplash.com/photo-1765648763932-43a3e2f8f35c?w=200&h=200&fit=crop",
    address: "45 Nguyễn Trãi, Q5, TP.HCM",
    cccd: "012345678902",
    verified: false,
    createdAt: "2024-03-15",
  },
  {
    id: "owner-003",
    role: "owner",
    name: "Phạm Quốc Tuấn",
    email: "tuan.owner@test.vn",
    phone: "0934567890",
    avatar: "https://images.unsplash.com/photo-1738566061505-556830f8b8f5?w=200&h=200&fit=crop",
    address: "78 Hoàng Diệu, Q4, TP.HCM",
    cccd: "012345678903",
    verified: true,
    createdAt: "2024-01-20",
  },
  {
    id: "renter-001",
    role: "renter",
    name: "Nguyễn Thị Lan",
    email: "renter@test.vn",
    phone: "0945678901",
    avatar: "https://images.unsplash.com/photo-1765648763932-43a3e2f8f35c?w=200&h=200&fit=crop",
    createdAt: "2024-03-01",
  },
  {
    id: "renter-002",
    role: "renter",
    name: "Hoàng Minh Khoa",
    email: "khoa.renter@test.vn",
    phone: "0956789012",
    avatar: "https://images.unsplash.com/photo-1738566061505-556830f8b8f5?w=200&h=200&fit=crop",
    createdAt: "2024-03-05",
  },
];

/**
 * Thông tin xác thực tách biệt khỏi User profile.
 * Production: thay passwordHash = bcrypt.hashSync(password, 10)
 */
export const USER_CREDENTIALS: UserCredential[] = [
  { userId: "admin-001", email: "admin@easyaccomod.vn", passwordHash: "admin123" },
  { userId: "owner-001", email: "owner@test.vn",        passwordHash: "owner123" },
  { userId: "owner-002", email: "huong.owner@test.vn",  passwordHash: "owner123" },
  { userId: "owner-003", email: "tuan.owner@test.vn",   passwordHash: "owner123" },
  { userId: "renter-001", email: "renter@test.vn",      passwordHash: "renter123" },
  { userId: "renter-002", email: "khoa.renter@test.vn", passwordHash: "renter123" },
];

// ============================================================
// ROOMS
// ============================================================
export const ROOMS: Room[] = [
  {
    id: "room-001",
    ownerId: "owner-001",
    ownerName: "Trần Văn Minh",
    ownerPhone: "0912345678",
    title: "Phòng trọ đầy đủ nội thất, gần ĐH Bách Khoa",
    description:
      "Phòng trọ mới xây, thoáng mát, có đầy đủ nội thất cơ bản. Khu vực an ninh, gần trường đại học Bách Khoa, thuận tiện đi lại.",
    address: {
      street: "120/5 Đinh Tiên Hoàng",
      ward: "Phường 3",
      district: "Quận Bình Thạnh",
      city: "TP. Hồ Chí Minh",
      full: "120/5 Đinh Tiên Hoàng, Phường 3, Quận Bình Thạnh, TP. Hồ Chí Minh",
    },
    nearBy: ["ĐH Bách Khoa TP.HCM", "Công viên Gia Định", "UBND Quận Bình Thạnh"],
    roomType: "phong_tro",
    roomCount: 1,
    price: 3500000,
    priceUnit: "month",
    area: 25,
    sharedOwner: false,
    bathroom: { type: "private", hasHotWater: true },
    kitchen: "shared",
    hasAC: true,
    hasBalcony: false,
    electricityPrice: "rental",
    electricityRate: 3500,
    waterRate: 80000,
    amenities: ["Tủ lạnh", "Máy giặt chung"],
    images: [
      "https://images.unsplash.com/photo-1759691555010-7f3f8674d2f2?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1774311237295-a65a4c1ff38a?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1765464184843-105e144bd54b?w=800&h=600&fit=crop",
    ],
    status: "available",
    postStatus: "approved",
    displayDuration: 1,
    displayDurationUnit: "month",
    postFee: 200000,
    views: 342,
    favorites: 28,
    createdAt: "2024-03-01",
    approvedAt: "2024-03-02",
    expiresAt: "2026-04-30",
  },
  {
    id: "room-002",
    ownerId: "owner-001",
    ownerName: "Trần Văn Minh",
    ownerPhone: "0912345678",
    title: "Chung cư mini cao cấp, trung tâm Quận 1",
    description:
      "Căn hộ chung cư mini hiện đại, full nội thất, view đẹp, an ninh 24/7. Vị trí trung tâm, gần tất cả tiện ích.",
    address: {
      street: "15 Nguyễn Huệ",
      ward: "Phường Bến Nghé",
      district: "Quận 1",
      city: "TP. Hồ Chí Minh",
      full: "15 Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh",
    },
    nearBy: ["Nhà hát Thành phố", "Công viên 30/4", "UBND Quận 1"],
    roomType: "chung_cu_mini",
    roomCount: 1,
    price: 8000000,
    priceUnit: "month",
    area: 40,
    sharedOwner: false,
    bathroom: { type: "private", hasHotWater: true },
    kitchen: "private",
    hasAC: true,
    hasBalcony: true,
    electricityPrice: "standard",
    amenities: ["Tủ lạnh", "Máy giặt", "Giường tủ"],
    images: [
      "https://images.unsplash.com/photo-1761123141836-3b3221dac3e5?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1759691555010-7f3f8674d2f2?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1774311237295-a65a4c1ff38a?w=800&h=600&fit=crop",
    ],
    status: "available",
    postStatus: "approved",
    displayDuration: 3,
    displayDurationUnit: "month",
    postFee: 600000,
    views: 521,
    favorites: 67,
    createdAt: "2024-02-15",
    approvedAt: "2024-02-16",
    expiresAt: "2026-05-30",
  },
  {
    id: "room-003",
    ownerId: "owner-003",
    ownerName: "Phạm Quốc Tuấn",
    ownerPhone: "0934567890",
    title: "Nhà nguyên căn 3 phòng ngủ, sân vườn rộng",
    description:
      "Nhà nguyên căn 3 tầng, 3 phòng ngủ, 2 nhà vệ sinh, sân vườn. Thích hợp cho gia đình hoặc nhóm sinh viên.",
    address: {
      street: "56 Lê Văn Việt",
      ward: "Phường Hiệp Phú",
      district: "Quận 9",
      city: "TP. Hồ Chí Minh",
      full: "56 Lê Văn Việt, Phường Hiệp Phú, Quận 9, TP. Hồ Chí Minh",
    },
    nearBy: ["ĐH Công Nghệ Thông Tin", "Trung tâm thể thao Phú Hữu", "UBND Quận 9"],
    roomType: "nha_nguyen_can",
    roomCount: 3,
    price: 15000000,
    priceUnit: "month",
    area: 120,
    sharedOwner: false,
    bathroom: { type: "private", hasHotWater: true },
    kitchen: "private",
    hasAC: true,
    hasBalcony: true,
    electricityPrice: "standard",
    amenities: ["Tủ lạnh", "Máy giặt", "Giường tủ"],
    images: [
      "https://images.unsplash.com/photo-1770462573891-ef8559618921?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1761123141836-3b3221dac3e5?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1765464184843-105e144bd54b?w=800&h=600&fit=crop",
    ],
    status: "available",
    postStatus: "approved",
    displayDuration: 1,
    displayDurationUnit: "quarter",
    postFee: 450000,
    views: 189,
    favorites: 15,
    createdAt: "2024-03-05",
    approvedAt: "2024-03-06",
    expiresAt: "2026-06-05",
  },
  {
    id: "room-004",
    ownerId: "owner-003",
    ownerName: "Phạm Quốc Tuấn",
    ownerPhone: "0934567890",
    title: "Phòng trọ giá rẻ, gần ĐH Sư Phạm",
    description:
      "Phòng trọ nhỏ, giá rẻ, phù hợp sinh viên. Có wifi miễn phí, gần chợ và các tiện ích sinh hoạt.",
    address: {
      street: "234 Tô Hiến Thành",
      ward: "Phường 13",
      district: "Quận 10",
      city: "TP. Hồ Chí Minh",
      full: "234 Tô Hiến Thành, Phường 13, Quận 10, TP. Hồ Chí Minh",
    },
    nearBy: ["ĐH Sư Phạm TP.HCM", "Công viên Lê Thị Riêng"],
    roomType: "phong_tro",
    roomCount: 1,
    price: 2200000,
    priceUnit: "month",
    area: 18,
    sharedOwner: true,
    bathroom: { type: "shared", hasHotWater: false },
    kitchen: "shared",
    hasAC: false,
    hasBalcony: false,
    electricityPrice: "rental",
    electricityRate: 3800,
    waterRate: 60000,
    amenities: [],
    images: [
      "https://images.unsplash.com/photo-1765464184843-105e144bd54b?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1759691555010-7f3f8674d2f2?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1774311237295-a65a4c1ff38a?w=800&h=600&fit=crop",
    ],
    status: "rented",
    postStatus: "approved",
    displayDuration: 2,
    displayDurationUnit: "week",
    postFee: 100000,
    views: 87,
    favorites: 5,
    createdAt: "2024-02-20",
    approvedAt: "2024-02-21",
    expiresAt: "2026-04-15",
  },
  {
    id: "room-005",
    ownerId: "owner-002",
    ownerName: "Lê Thị Hương",
    ownerPhone: "0923456789",
    title: "Chung cư nguyên căn 2PN full nội thất, Q7",
    description:
      "Chung cư cao cấp 2 phòng ngủ, đầy đủ nội thất, hồ bơi, gym. Khu vực cao cấp, an ninh tốt.",
    address: {
      street: "89 Phạm Thái Bường",
      ward: "Phường Tân Phong",
      district: "Quận 7",
      city: "TP. Hồ Chí Minh",
      full: "89 Phạm Thái Bường, Phường Tân Phong, Quận 7, TP. Hồ Chí Minh",
    },
    nearBy: ["Trung tâm thể thao Phú Mỹ Hưng", "Công viên Phú Mỹ Hưng"],
    roomType: "chung_cu_nguyen_can",
    roomCount: 2,
    price: 20000000,
    priceUnit: "month",
    area: 80,
    sharedOwner: false,
    bathroom: { type: "private", hasHotWater: true },
    kitchen: "private",
    hasAC: true,
    hasBalcony: true,
    electricityPrice: "standard",
    amenities: ["Tủ lạnh", "Máy giặt", "Giường tủ"],
    images: [
      "https://images.unsplash.com/photo-1713359003488-53609bbd95c7?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1761123141836-3b3221dac3e5?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1770462573891-ef8559618921?w=800&h=600&fit=crop",
    ],
    status: "available",
    postStatus: "pending",
    displayDuration: 1,
    displayDurationUnit: "month",
    postFee: 200000,
    views: 0,
    favorites: 0,
    createdAt: "2024-03-20",
  },
  {
    id: "room-006",
    ownerId: "owner-001",
    ownerName: "Trần Văn Minh",
    ownerPhone: "0912345678",
    title: "Phòng trọ sạch sẽ, thoáng mát, gần chợ Bình Thạnh",
    description:
      "Phòng trọ mới xây, cao cấp, có ban công thoáng. Khu vực dân cư văn minh, sạch sẽ.",
    address: {
      street: "45/2 Bạch Đằng",
      ward: "Phường 2",
      district: "Quận Bình Thạnh",
      city: "TP. Hồ Chí Minh",
      full: "45/2 Bạch Đằng, Phường 2, Quận Bình Thạnh, TP. Hồ Chí Minh",
    },
    nearBy: ["Chợ Bình Thạnh", "ĐH Nông Lâm TP.HCM"],
    roomType: "phong_tro",
    roomCount: 1,
    price: 4200000,
    priceUnit: "month",
    area: 30,
    sharedOwner: false,
    bathroom: { type: "private", hasHotWater: true },
    kitchen: "private",
    hasAC: true,
    hasBalcony: true,
    electricityPrice: "rental",
    electricityRate: 3500,
    waterRate: 70000,
    amenities: ["Giường tủ"],
    images: [
      "https://images.unsplash.com/photo-1774311237295-a65a4c1ff38a?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1759691555010-7f3f8674d2f2?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1761123141836-3b3221dac3e5?w=800&h=600&fit=crop",
    ],
    status: "available",
    postStatus: "approved",
    displayDuration: 1,
    displayDurationUnit: "month",
    postFee: 200000,
    views: 156,
    favorites: 19,
    createdAt: "2024-03-10",
    approvedAt: "2024-03-11",
    expiresAt: "2026-04-28",
  },
  {
    id: "room-007",
    ownerId: "owner-003",
    ownerName: "Phạm Quốc Tuấn",
    ownerPhone: "0934567890",
    title: "Chung cư mini view thành phố, Quận 3",
    description:
      "Căn hộ studio view đẹp tầng cao, đầy đủ tiện nghi. Gần trung tâm thương mại.",
    address: {
      street: "12 Nam Kỳ Khởi Nghĩa",
      ward: "Phường 7",
      district: "Quận 3",
      city: "TP. Hồ Chí Minh",
      full: "12 Nam Kỳ Khởi Nghĩa, Phường 7, Quận 3, TP. Hồ Chí Minh",
    },
    nearBy: ["Vincom Đồng Khởi", "Công viên Tao Đàn", "UBND Quận 3"],
    roomType: "chung_cu_mini",
    roomCount: 1,
    price: 7500000,
    priceUnit: "month",
    area: 35,
    sharedOwner: false,
    bathroom: { type: "private", hasHotWater: true },
    kitchen: "private",
    hasAC: true,
    hasBalcony: true,
    electricityPrice: "standard",
    amenities: ["Tủ lạnh", "Giường tủ"],
    images: [
      "https://images.unsplash.com/photo-1592982349567-c2d4873cfce9?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1761123141836-3b3221dac3e5?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1765464184843-105e144bd54b?w=800&h=600&fit=crop",
    ],
    status: "available",
    postStatus: "rejected",
    displayDuration: 2,
    displayDurationUnit: "month",
    postFee: 400000,
    views: 0,
    favorites: 0,
    createdAt: "2024-03-18",
    rejectedReason: "Thông tin địa chỉ không chính xác, cần bổ sung ảnh thực tế.",
  },
];

// ============================================================
// REVIEWS
// ============================================================
export const REVIEWS: Review[] = [
  {
    id: "rev-001",
    roomId: "room-001",
    userId: "renter-001",
    userName: "Nguyễn Thị Lan",
    userAvatar: "https://images.unsplash.com/photo-1765648763932-43a3e2f8f35c?w=80&h=80&fit=crop",
    rating: 5,
    comment: "Phòng rất sạch sẽ, chủ nhà thân thiện. Khu vực yên tĩnh, gần trường học. Rất hài lòng!",
    status: "approved",
    createdAt: "2024-03-10",
  },
  {
    id: "rev-002",
    roomId: "room-001",
    userId: "renter-002",
    userName: "Hoàng Minh Khoa",
    userAvatar: "https://images.unsplash.com/photo-1738566061505-556830f8b8f5?w=80&h=80&fit=crop",
    rating: 4,
    comment: "Phòng đẹp, giá hợp lý. Điện nước bình thường. Hơi ồn một chút vào buổi tối.",
    status: "approved",
    createdAt: "2024-03-12",
  },
  {
    id: "rev-003",
    roomId: "room-002",
    userId: "renter-001",
    userName: "Nguyễn Thị Lan",
    userAvatar: "https://images.unsplash.com/photo-1765648763932-43a3e2f8f35c?w=80&h=80&fit=crop",
    rating: 5,
    comment: "Căn hộ rất cao cấp, vị trí thuận tiện. Chủ nhà nhiệt tình. Xứng đáng 5 sao!",
    status: "approved",
    createdAt: "2024-03-08",
  },
  {
    id: "rev-004",
    roomId: "room-003",
    userId: "renter-002",
    userName: "Hoàng Minh Khoa",
    userAvatar: "https://images.unsplash.com/photo-1738566061505-556830f8b8f5?w=80&h=80&fit=crop",
    rating: 4,
    comment: "Nhà rộng rãi, có sân vườn. Phù hợp cho gia đình. Hơi xa trung tâm một chút.",
    status: "pending",
    createdAt: "2024-03-19",
  },
];

// ============================================================
// NOTIFICATIONS
// ============================================================
export const NOTIFICATIONS: Notification[] = [
  {
    id: "notif-001",
    userId: "owner-001",
    title: "Bài đăng được duyệt",
    message: 'Bài đăng "Phòng trọ đầy đủ nội thất, gần ĐH Bách Khoa" đã được phê duyệt. Thời hạn hiển thị: 1 tháng. Phí: 200.000đ.',
    read: false,
    type: "approval",
    createdAt: "2024-03-02",
  },
  {
    id: "notif-002",
    userId: "owner-001",
    title: "Bài đăng được duyệt",
    message: 'Bài đăng "Chung cư mini cao cấp, trung tâm Quận 1" đã được phê duyệt. Thời hạn hiển thị: 3 tháng. Phí: 600.000đ.',
    read: true,
    type: "approval",
    createdAt: "2024-02-16",
  },
  {
    id: "notif-003",
    userId: "owner-003",
    title: "Bài đăng bị từ chối",
    message: 'Bài đăng "Chung cư mini view thành phố, Quận 3" bị từ chối. Lý do: Thông tin địa chỉ không chính xác.',
    read: false,
    type: "rejection",
    createdAt: "2024-03-19",
  },
  {
    id: "notif-004",
    userId: "admin-001",
    title: "Phòng trọ đã có người thuê",
    message: 'Chủ nhà Phạm Quốc Tuấn đã cập nhật trạng thái "Phòng trọ giá rẻ, gần ĐH Sư Phạm" sang đã cho thuê.',
    read: false,
    type: "status",
    createdAt: "2024-03-15",
  },
  {
    id: "notif-005",
    userId: "admin-001",
    title: "Bài đăng mới chờ duyệt",
    message: 'Chủ nhà Lê Thị Hương vừa đăng bài "Chung cư nguyên căn 2PN full nội thất, Q7". Đang chờ phê duyệt.',
    read: false,
    type: "system",
    createdAt: "2024-03-20",
  },
];

// ============================================================
// CHAT MESSAGES
// ============================================================
export const CHAT_MESSAGES: ChatMessage[] = [
  {
    id: "chat-001",
    fromId: "owner-001",
    fromName: "Trần Văn Minh",
    toId: "admin-001",
    message: "Xin chào Admin, tôi muốn hỏi về quy trình gia hạn bài đăng?",
    timestamp: "2024-03-10T09:00:00",
  },
  {
    id: "chat-002",
    fromId: "admin-001",
    fromName: "Nguyễn Admin",
    toId: "owner-001",
    message: "Chào anh Minh! Để gia hạn bài đăng, anh vào mục quản lý bài đăng, chọn bài muốn gia hạn và nhấn nút 'Gia hạn'. Hệ thống sẽ tính phí tự động.",
    timestamp: "2024-03-10T09:05:00",
  },
  {
    id: "chat-003",
    fromId: "owner-001",
    fromName: "Trần Văn Minh",
    toId: "admin-001",
    message: "Cảm ơn Admin! Vậy phí gia hạn tính như thế nào ạ?",
    timestamp: "2024-03-10T09:08:00",
  },
  {
    id: "chat-004",
    fromId: "admin-001",
    fromName: "Nguyễn Admin",
    toId: "owner-001",
    message: "Phí gia hạn tính theo thời gian anh chọn: 1 tuần = 50.000đ, 1 tháng = 200.000đ, 3 tháng = 450.000đ, 1 năm = 1.500.000đ.",
    timestamp: "2024-03-10T09:10:00",
  },
  {
    id: "chat-005",
    fromId: "owner-003",
    fromName: "Phạm Quốc Tuấn",
    toId: "admin-001",
    message: "Admin ơi, bài đăng của tôi bị từ chối với lý do địa chỉ không chính xác. Tôi cần làm gì để được chấp thuận lại?",
    timestamp: "2024-03-19T14:00:00",
  },
  {
    id: "chat-006",
    fromId: "admin-001",
    fromName: "Nguyễn Admin",
    toId: "owner-003",
    message: "Chào anh Tuấn! Anh cần cập nhật địa chỉ chính xác và bổ sung thêm ảnh thực tế của phòng. Sau đó đăng lại bài và chúng tôi sẽ xét duyệt lại.",
    timestamp: "2024-03-19T14:30:00",
  },
];

// ============================================================
// REPORTS
// ============================================================
export const REPORTS: Report[] = [
  {
    id: "report-001",
    roomId: "room-004",
    userId: "renter-001",
    reason: "Thông tin không chính xác",
    description: "Đến xem phòng thực tế thì phòng nhỏ hơn nhiều so với mô tả (18m2 nhưng thực tế chỉ khoảng 12m2).",
    status: "pending",
    createdAt: "2024-03-14",
  },
];

// ============================================================
// HELPER FUNCTIONS
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

export function formatPrice(price: number): string {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);
}

export function calcPostFee(duration: number, unit: string): number {
  const rates: Record<string, number> = {
    week: 50000,
    month: 200000,
    quarter: 450000,
    year: 1500000,
  };
  return duration * (rates[unit] || 200000);
}
