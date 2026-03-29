# 7 Trọ - Nền tảng Kết nối Nhà trọ Thông minh 🏠🚀

Dự án **7 Trọ** là một giải pháp PropTech (Công nghệ Bất động sản) toàn diện, giúp kết nối người đi thuê và chủ nhà trọ một cách minh bạch, an toàn và hiệu quả. Hệ thống hỗ trợ quản lý bài đăng, duyệt tin tự động/thủ công, trò chuyện trực tiếp và thông báo thời gian thực.

---

## ✨ Tính năng nổi bật

### 👤 Đối với Người thuê (Renter)
- **Tìm kiếm thông minh**: Lọc theo khu vực (Tỉnh/Thành, Quận/Huyện), loại phòng, mức giá và tiện ích (Điều hòa, Ban công...).
- **Yêu thích & Lưu trữ**: Lưu lại các phòng ưng ý để xem lại sau.
- **Đánh giá & Phản hồi**: Xem các đánh giá từ người thuê trước để có quyết định đúng đắn.
- **Báo cáo vi phạm**: Gửi báo cáo về các bài đăng không trung thực để bảo vệ cộng đồng.

### 🏠 Đối với Chủ nhà (Owner)
- **Đăng tin nhanh chóng**: Giao diện đăng tin hiện đại với đầy đủ thông tin chi tiết.
- **Dashboard quản lý**: Theo dõi lượt xem, lượt yêu thích và trạng thái các bài đăng.
- **Hỗ trợ trực tiếp**: Chat trực tiếp với Admin để giải quyết các vấn đề về bài đăng.

### 🛡️ Đối với Quản trị viên (Admin)
- **Kiểm duyệt bài đăng**: Hệ thống phê duyệt/từ chối bài đăng trực quan.
- **Quản lý người dùng**: Xác minh danh tính chủ nhà để tăng độ uy tín.
- **Thống kê chuyên sâu**: Biểu đồ phân tích xu hướng thị trường, loại phòng phổ biến.
- **Xử lý vi phạm**: Quản lý báo cáo và xử lý các bài đăng vi phạm.

---

## 🛠️ Công nghệ sử dụng (Tech Stack)

### Backend (API)
- **Node.js & Express.js**: Framework xử lý logic server mạnh mẽ.
- **MongoDB & Mongoose**: Cơ sở dữ liệu NoSQL linh hoạt, hiệu suất cao.
- **JWT (JSON Web Token)**: Xác thực và phân quyền đa cấp.
- **Nodemailer**: Hệ thống gửi email OTP và thông báo.
- **Swagger**: Tài liệu API tự động tại `/api-docs`.

### Frontend (UI/UX)
- **React 18 & Vite**: Framework xây dựng giao diện tốc độ cao.
- **TailwindCSS**: CSS Framework giúp UI hiện đại, responsive hoàn toàn.
- **Lucide React**: Thư viện icon đồng bộ, sắc nét.
- **React Router 7**: Quản lý điều hướng trang chuyên nghiệp.
- **Recharts**: Biểu đồ thống kê trực quan cho Admin.

---

## 🚀 Hướng dẫn Cài đặt & Phát triển

### 1. Yêu cầu hệ thống
- **Node.js** >= 18
- **MongoDB** (Local hoặc Atlas)

### 2. Cấu hình biến môi trường
Tạo file `.env` trong thư mục `/BackEnd`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/easyaccomod
JWT_SECRET=your_secret_key
CLIENT_URL=http://localhost:5173
GMAIL_USER=your_email@gmail.com
GMAIL_APP_PASSWORD=your_app_password
```

### 3. Khởi chạy
Mở 2 terminal song song:

**Terminal 1 (Backend):**
```bash
cd BackEnd
npm install
npm run dev
```

**Terminal 2 (Frontend):**
```bash
cd FrontEnd
npm install
npm run dev
```
Truy cập: `http://localhost:5173`

---

## 🌍 Hướng dẫn Hosting Miễn phí (Free)

Dự án có thể triển khai hoàn toàn miễn phí bằng cách kết hợp các dịch vụ sau:

### Bước 1: Hosting Database (MongoDB Atlas)
1. Truy cập [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) và tạo tài khoản free.
2. Tạo 1 Cluster mới (Shared Tier - FREE).
3. Tại phần **Network Access**, thêm IP `0.0.0.0/0` (Allow Access from Anywhere).
4. Lấy chuỗi **Connection String** để điền vào biến `MONGODB_URI`.

### Bước 2: Hosting Backend (Render.com)
1. Đẩy code Backend lên GitHub (Lưu ý `.gitignore` file `.env`).
2. Truy cập [Render.com](https://render.com/), tạo **Web Service** mới và kết nối repo GitHub.
3. Cấu hình:
   - **Environment**: Node
   - **Build Command**: `cd BackEnd && npm install`
   - **Start Command**: `cd BackEnd && node server.js`
4. Tại tab **Environment Variables**, thêm đầy đủ các biến từ file `.env`.
5. Sau khi Deploy thành công, bạn sẽ nhận được một URL API (Ví dụ: `https://7tro-api.onrender.com`).

### Bước 3: Hosting Frontend (Vercel)
1. Truy cập [Vercel.com](https://vercel.com/) và kết nối repo GitHub.
2. Cấu hình project:
   - **Root Directory**: `FrontEnd`
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Environment Variables**: Thêm `VITE_API_BASE_URL` với giá trị là URL Backend vừa tạo ở Bước 2 (Lưu ý thêm `/api` vào cuối URL).
3. Nhấn **Deploy**. Vercel sẽ cung cấp cho bạn tên miền miễn phí (Ví dụ: `https://7tro.vercel.app`).

**Lưu ý quan trọng:** Sau khi có URL Frontend, hãy quay lại Render cập nhật biến `CLIENT_URL` trong Backend để tránh lỗi CORS.

---

*© 2026 7 Trọ Team. Phát triển với ❤️ vì cộng đồng tìm trọ văn minh.*
