# EasyAccomod Frontend

Giao diện người dùng cho nền tảng tìm nhà trọ **EasyAccomod** – kết nối người thuê và chủ nhà uy tín tại Việt Nam.

## Công nghệ

- **React 18** + **TypeScript**
- **Vite 6** (build tool)
- **TailwindCSS v4** (styling)
- **React Router v7** (routing)
- **Radix UI** + **shadcn/ui** (UI components)
- **Lucide React** (icons)

## Cài đặt & Chạy

```bash
# Cài phụ thuộc
npm install

# Chạy môi trường dev
npm run dev

# Build production
npm run build

# Preview bản build
npm run preview

# Kiểm tra TypeScript
npm run lint
```

## Cấu trúc thư mục

```
src/
├── app/
│   ├── components/        # Component dùng chung (Navbar, Footer, RoomCard, ...)
│   │   ├── figma/         # Components từ Figma
│   │   └── ui/            # shadcn/ui components
│   ├── context/           # React Context (AuthContext, AppContext)
│   ├── data/              # Mock data & TypeScript types
│   └── pages/             # Các trang (HomePage, SearchPage, ...)
└── styles/                # CSS global (fonts, tailwind, theme)
```

## Tài khoản demo

| Vai trò | Email | Mật khẩu |
|---------|-------|-----------|
| Admin | `admin@easyaccomod.vn` | `admin123` |
| Chủ nhà | `owner@test.vn` | `owner123` |
| Người thuê | `renter@test.vn` | `renter123` |

> **Lưu ý:** Dự án hiện dùng mock data. Để tích hợp backend, thay thế `mockData.ts` bằng API calls thực, và chuyển `passwordHash` sang `bcrypt`.

## Tính năng

- 🔍 Tìm kiếm & lọc phòng theo khu vực, loại phòng, giá
- 🏠 Trang chi tiết phòng với ảnh, đánh giá, bản đồ
- ❤️ Yêu thích & so sánh phòng
- 👤 Quản lý tài khoản (3 vai trò: Admin / Chủ nhà / Người thuê)
- 📊 Dashboard chủ nhà: đăng bài, quản lý bài đăng
- 🛡️ Dashboard admin: duyệt bài, quản lý người dùng, báo cáo
- 💬 Chat nội bộ (Admin ↔ Chủ nhà)
- 🔔 Hệ thống thông báo real-time (trong session)