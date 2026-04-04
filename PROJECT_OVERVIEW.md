# 📋 PROJECT OVERVIEW — EasyAccomod

> Tài liệu tổng hợp toàn bộ chức năng của hệ thống EasyAccomod
> Được tạo tự động — cập nhật lại khi có thay đổi lớn.

---

## 🏗️ Tổng quan kiến trúc

| Layer     | Stack                                      |
|-----------|--------------------------------------------|
| Frontend  | React 18 + TypeScript + Vite + Tailwind CSS |
| Backend   | Node.js + Express.js                       |
| Database  | MongoDB (Mongoose)                         |
| Auth      | JWT (JSON Web Token) + bcryptjs            |
| Email     | Nodemailer / Resend                        |
| API Docs  | Swagger (swagger-autogen + swagger-ui-express) |

**Cấu trúc thư mục:**
```
web/
├── BackEnd/          # REST API server
│   ├── models/       # MongoDB schemas
│   ├── routes/       # API endpoints
│   ├── middleware/   # Auth middleware
│   └── server.js     # Entry point (port 5000)
└── FrontEnd/         # React SPA
    └── src/
        ├── app/
        │   ├── pages/      # Các trang chính
        │   ├── components/ # UI components
        │   ├── context/    # Global state (AuthContext, AppContext)
        │   └── data/       # Kiểu dữ liệu, mock types
        └── lib/
            └── api.ts      # Axios instance (base URL: /api)
```

---

## 👤 Phân quyền người dùng (Roles)

| Role    | Mô tả                                                              |
|---------|--------------------------------------------------------------------|
| guest   | Người dùng chưa đăng nhập — chỉ xem danh sách, tìm kiếm phòng    |
| tenant  | Người thuê — xem, tìm kiếm, đánh giá, chat, yêu thích phòng      |
| owner   | Chủ nhà — đăng, quản lý tin phòng; có dashboard riêng             |
| admin   | Quản trị viên — duyệt/từ chối phòng & đánh giá; xử lý báo cáo    |

---

## 🔐 Module 1: Xác thực (Auth)

**File:** `BackEnd/routes/auth.js` | `FrontEnd/pages/LoginPage, RegisterPage, ForgotPasswordPage, ResetPasswordPage`

### Chức năng:
- **Đăng ký tài khoản** `POST /api/auth/register`
  - Tạo user mới (role: tenant/owner)
  - Hash mật khẩu bằng bcryptjs
  - Gửi email xác nhận tài khoản

- **Đăng nhập** `POST /api/auth/login`
  - Trả về JWT token
  - Lưu thông tin user vào AuthContext

- **Lấy thông tin user hiện tại** `GET /api/auth/me`

- **Quên mật khẩu** `POST /api/auth/forgot-password`
  - Gửi email chứa link reset mật khẩu (token có thời hạn)

- **Reset mật khẩu** `POST /api/auth/reset-password`
  - Xác thực token, cập nhật mật khẩu mới

- **Xác thực email** `GET /api/auth/verify-email/:token`

### Model User:
```
name, email, password (hashed), role, phone, avatar,
isEmailVerified, resetPasswordToken, resetPasswordExpires,
favorites (ref Room[]), createdAt
```

---

## 🏠 Module 2: Quản lý Phòng (Rooms)

**File:** `BackEnd/routes/rooms.js` | `FrontEnd/pages/HomePage, SearchPage, RoomDetailPage, CreateListingModal, OwnerDashboard`

### Chức năng:

#### Public:
- **Lấy danh sách phòng** `GET /api/rooms`
  - Filter: city, district, type, priceMin, priceMax, status, q (search)
  - Phân trang: page, limit
  - Chỉ hiển thị phòng đã được duyệt (approved) với người dùng thường

- **Xem chi tiết phòng** `GET /api/rooms/:id`
  - Trả đủ thông tin + tăng view count

- **Tăng lượt xem** `PUT /api/rooms/:id/views`

#### Chủ nhà (owner):
- **Đăng tin phòng mới** `POST /api/rooms`
  - Trạng thái ban đầu: `pending` (chờ admin duyệt)
  - Upload ảnh dạng URL

- **Cập nhật tin phòng** `PUT /api/rooms/:id`

- **Xem phòng của mình** `GET /api/rooms/my-rooms`

- **Cập nhật trạng thái phòng** `PUT /api/rooms/:id/status`
  - Các trạng thái: available | occupied | maintenance

#### Admin:
- **Duyệt phòng** `PUT /api/rooms/:id/approve`
  - Chuyển status → approved; gửi thông báo cho owner

- **Từ chối phòng** `PUT /api/rooms/:id/reject`
  - Kèm lý do từ chối; gửi thông báo cho owner

#### Người dùng đăng nhập:
- **Toggle yêu thích** `POST /api/rooms/:id/favorite`
  - action: "add" | "remove"

### Trạng thái phòng (RoomStatus):
- `pending` — Chờ admin duyệt
- `approved` — Đã duyệt, hiển thị công khai
- `rejected` — Bị từ chối
- `available` — Còn phòng trống
- `occupied` — Đã có người thuê
- `maintenance` — Đang bảo trì

### Model Room:
```
title, description, price, area, type, address, city, district,
images[], amenities[], status, owner (ref User),
views, favorites (ref User[]), rejectionReason, createdAt, updatedAt
```

---

## ⭐ Module 3: Đánh giá (Reviews)

**File:** `BackEnd/routes/reviews.js`

### Chức năng:
- **Gửi đánh giá** `POST /api/reviews`
  - Người thuê đánh giá phòng (1-5 sao + comment)
  - Trạng thái ban đầu: pending

- **Lấy danh sách đánh giá** `GET /api/reviews`

- **Lấy đánh giá theo phòng** `GET /api/reviews/room/:roomId`
  - Chỉ trả đánh giá đã được duyệt

- **Admin duyệt đánh giá** `PUT /api/reviews/:id/approve`

- **Admin từ chối đánh giá** `PUT /api/reviews/:id/reject`

### Model Review:
```
room (ref Room), user (ref User), rating (1-5),
comment, status (pending|approved|rejected), createdAt
```

---

## 💬 Module 4: Chat (Nhắn tin)

**File:** `BackEnd/routes/chat.js` | `BackEnd/models/Chat.js` + `ChatMessage.js`

### Chức năng:
- **Lấy danh sách cuộc trò chuyện** `GET /api/chat/conversations`
  - Trả về các cuộc trò chuyện của user hiện tại

- **Lấy tin nhắn của cuộc trò chuyện** `GET /api/chat/conversations/:id/messages`

- **Gửi tin nhắn** `POST /api/chat/conversations/:id/messages`

- **Tạo/lấy cuộc trò chuyện** `POST /api/chat/conversations`
  - Tạo mới hoặc lấy cuộc trò chuyện hiện có giữa 2 user (tenant ↔ owner)

- **Đánh dấu đã đọc** `PUT /api/chat/conversations/:id/read`

### Model:
```
Chat: participants (ref User[]), room (ref Room), lastMessage, updatedAt
ChatMessage: conversation (ref Chat), sender (ref User), content, read, createdAt
```

---

## 🔔 Module 5: Thông báo (Notifications)

**File:** `BackEnd/routes/notifications.js`

### Chức năng:
- **Lấy danh sách thông báo** `GET /api/notifications`

- **Đánh dấu đã đọc** `PUT /api/notifications/:id/read`

- **Đánh dấu tất cả đã đọc** `PUT /api/notifications/read-all`

- **Xóa thông báo** `DELETE /api/notifications/:id`

### Tự động tạo thông báo khi:
- Admin duyệt/từ chối phòng → notify owner
- Có đánh giá mới trên phòng → notify owner
- Có báo cáo mới → notify admin

### Model Notification:
```
user (ref User), title, message, type, read, link, createdAt
```

---

## 🚩 Module 6: Báo cáo vi phạm (Reports)

**File:** `BackEnd/routes/reports.js`

### Chức năng:
- **Tạo báo cáo** `POST /api/reports`
  - User báo cáo phòng có nội dung vi phạm

- **Lấy danh sách báo cáo** `GET /api/reports` _(Admin only)_

- **Xử lý báo cáo** `PUT /api/reports/:id/resolve` _(Admin only)_

### Model Report:
```
room (ref Room), reporter (ref User), reason, description,
status (pending|resolved), createdAt
```

---

## 👥 Module 7: Quản lý người dùng (Users)

**File:** `BackEnd/routes/users.js` | `FrontEnd/pages/ProfilePage, AdminDashboard`

### Chức năng:
- **Lấy profile cá nhân** `GET /api/users/me`

- **Cập nhật profile** `PUT /api/users/me`
  - Cập nhật name, phone, avatar

- **Lấy/cập nhật danh sách yêu thích** `GET /api/users/me/favorites`

- **Đổi mật khẩu** `PUT /api/users/me/password`

- **Admin: lấy danh sách tất cả users** `GET /api/users`

- **Admin: cập nhật role user** `PUT /api/users/:id/role`

---

## 📱 Các trang giao diện (Pages)

| Trang                  | Route                  | Mô tả                                                      |
|------------------------|------------------------|------------------------------------------------------------|
| HomePage               | `/`                    | Trang chủ: banner, danh sách phòng nổi bật, tìm kiếm nhanh |
| SearchPage             | `/search`              | Tìm kiếm nâng cao với filter giá, loại, địa điểm          |
| RoomDetailPage         | `/rooms/:id`           | Chi tiết phòng: ảnh, mô tả, bản đồ, đánh giá, chat        |
| LoginPage              | `/login`               | Đăng nhập                                                   |
| RegisterPage           | `/register`            | Đăng ký tài khoản (tenant/owner)                           |
| ForgotPasswordPage     | `/forgot-password`     | Quên mật khẩu                                              |
| ResetPasswordPage      | `/reset-password`      | Đặt lại mật khẩu                                           |
| ProfilePage            | `/profile`             | Hồ sơ cá nhân, đổi mật khẩu, danh sách yêu thích          |
| FavoritesPage          | `/favorites`           | Danh sách phòng đã yêu thích                               |
| OwnerDashboard         | `/owner`               | Dashboard chủ nhà: quản lý tin đăng, xem thống kê          |
| AdminDashboard         | `/admin`               | Dashboard admin: duyệt phòng, đánh giá, xử lý báo cáo      |
| InfoPage               | `/info`                | Thông tin về dự án / trang giới thiệu                      |
| CreateListingModal     | _(modal)_              | Form đăng tin phòng mới                                    |
| NotFoundPage           | `*`                    | Trang 404                                                  |

---

## 🌐 Global State Management

### AuthContext
- Quản lý trạng thái đăng nhập (currentUser, isAuthenticated)
- Lưu JWT token vào localStorage
- Cung cấp hàm: login, logout, register, updateUser

### AppContext
- Quản lý dữ liệu toàn cục: rooms, reviews, notifications, reports, favorites
- Auto-refresh notifications mỗi 5 giây (polling)
- Admin: auto-refresh reports mỗi 5 giây

---

## 🛠️ Tech & Libraries đáng chú ý

| Thư viện           | Dùng cho                                  |
|--------------------|-------------------------------------------|
| Radix UI           | Headless UI components (Dialog, Tabs...) |
| MUI (Material UI)  | Một số component bổ sung                 |
| Recharts           | Biểu đồ thống kê trong dashboard         |
| react-hook-form    | Quản lý form & validation                |
| Axios              | HTTP client gọi API                      |
| lucide-react       | Icon library                             |
| sonner             | Toast notifications                      |
| motion             | Animation (Framer Motion)                |
| react-slick        | Carousel/slider ảnh                      |
| date-fns           | Xử lý ngày tháng                         |
| canvas-confetti    | Hiệu ứng confetti (UX)                   |

---

## 🔑 Middleware

- **authMiddleware** — Xác thực JWT, gán `req.user`
- **adminMiddleware** — Kiểm tra role === 'admin'
- **ownerMiddleware** — Kiểm tra role === 'owner'

---

## 📡 API Base

- Backend: `http://localhost:5000`
- Frontend gọi API qua: `http://localhost:5000/api`
- Swagger UI: `http://localhost:5000/api-docs`

---

- **API Base port:** `6200` (từ `.env PORT=6200`; Overview cũ ghi sai `5000`)

- **Chat module** `routes/chat.js` — đã implement đầy đủ 5 endpoints

- **Favorite** — lưu vào bảng `user_favorites (userId, roomId)` thay vì column JSON trong users

- **`GET /api/rooms/my-rooms`** — đã fix route conflict (đặt trước `/:id`)

- **`GET /api/users/me/favorites`** — đã implement, trả về danh sách phòng yêu thích đầy đủ

---

*Cập nhật: 02/04/2026 — AI Assistant*
