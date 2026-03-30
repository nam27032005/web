# 7 Trọ - Nền tảng Kết nối Nhà trọ Thông minh 🏠🚀

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)
[![React Version](https://img.shields.io/badge/react-18.3.1-blue)](https://reactjs.org/)

Dự án **7 Trọ** là một nền tảng PropTech (Công nghệ Bất động sản) hiện đại, giúp kết nối người đi thuê và chủ nhà trọ một cách minh bạch, an toàn và hiệu quả. Hệ thống được thiết kế với trải nghiệm người dùng cao cấp, hỗ trợ quản lý bài đăng, duyệt tin, trò chuyện trực tiếp và thông báo thời gian thực.

---

## ✨ Tính năng chính

### 👤 Cho Người thuê (Renter)
*   **Tìm kiếm & Lọc nâng cao**: Tìm phòng theo Tỉnh/Thành, Quận/Huyện, khoảng giá, diện tích và các tiện ích (Điều hòa, máy giặt, ban công...).
*   **Chi tiết phòng trọ**: Xem thông tin chi tiết, hình ảnh chất lượng cao, bản đồ vị trí và thông tin chủ nhà.
*   **Yêu thích (Favorites)**: Lưu trữ các phòng trọ ưng ý vào danh sách cá nhân.
*   **Đánh giá & Bình luận**: Gửi nhận xét và số sao cho phòng trọ sau khi trải nghiệm.
*   **Báo cáo vi phạm (Report)**: Gửi phản hồi về các bài đăng sai sự thật hoặc lừa đảo.
*   **Quên mật khẩu**: Khôi phục tài khoản qua mã OTP gửi tới Email.

### 🏠 Cho Chủ nhà (Owner)
*   **Đăng tin hiện đại**: Giao diện đăng bài 1 trang (Single Page Form) tích hợp đủ thông tin: địa chỉ, tiện ích, nội thất, giá điện/nước.
*   **Dashboard quản lý**: Theo dõi số lượng lượt xem (Views), lượt yêu thích (Favorites) và trạng thái duyệt tin.
*   **Xác minh danh tính**: Cung cấp CCCD và địa chỉ để được Admin gắn dấu "Xác minh", tăng tin cậy.
*   **Chat trực tiếp**: Trò chuyện với Admin để được hỗ trợ về bài đăng.

### 🛡️ Cho Quản trị viên (Admin)
*   **Kiểm duyệt tin đăng**: Hệ thống phê duyệt hoặc từ chối bài đăng trực quan (với lý do cụ thể).
*   **Thống kê (Analytics)**: Biểu đồ (Recharts) theo dõi số lượng người dùng mới, bài đăng mới và doanh thu (nếu có).
*   **Quản lý người dùng**: Khóa/mở khóa tài khoản, xác minh danh tính chủ nhà.
*   **Xử lý báo cáo**: Xem các báo cáo từ người thuê và ra quyết định ẩn bài đăng vi phạm.

---

## 🛠️ Công nghệ sử dụng (Tech Stack)

### Backend
*   **Node.js & Express**: Xử lý logic và API.
*   **MongoDB & Mongoose**: Cơ sở dữ liệu NoSQL linh hoạt.
*   **JWT & Bcrypt**: Bảo mật xác thực và mã hóa mật khẩu.
*   **Nodemailer**: Gửi email thông báo và OTP (Gmail SMTP).
*   **Swagger**: Tài liệu API tự động (`/api-docs`).

### Frontend
*   **React 18 & Vite**: Hiệu suất cao, tải nhanh.
*   **TailwindCSS & Lucide-react**: Thiết kế hiện đại, responsive hoàn toàn.
*   **Framer Motion**: Các hiệu ứng chuyển cảnh mượt mà.
*   **Recharts**: Hiển thị số liệu thống kê cho Admin.

---

## 🚀 Hướng dẫn Chạy Local (Local Development)

### 1. Yêu cầu hệ thống
*   **Node.js**: Phiên bản 18.x trở lên.
*   **MongoDB**: Local MongoDB Community Server hoặc MongoDB Atlas (Cloud).
*   **Git**: Để quản lý mã nguồn.

### 2. Cài đặt trên các Hệ điều hành

#### 🐧 Linux & 🍎 macOS
```bash
# Clone dự án
git clone https://github.com/nam27032005/web.git
cd web

# Cài đặt Backend
cd BackEnd
npm install
cp .env.example .env # Sau đó sửa file .env

# Cài đặt Frontend
cd ../FrontEnd
npm install
```

#### 🪟 Windows (Powershell)
```powershell
# Clone dự án
git clone https://github.com/nam27032005/web.git
cd web

# Cài đặt Backend
cd BackEnd
npm install
copy .env.example .env # Sau đó sửa file .env

# Cài đặt Frontend
cd ..\FrontEnd
npm install
```

### 3. Cấu hình Biến môi trường (.env)
Tạo file `.env` trong thư mục `BackEnd/` với các biến sau:
| Biến | Ý nghĩa | Ví dụ |
|---|---|---|
| `PORT` | Cổng chạy Server | `5000` |
| `MONGODB_URI` | Chuỗi kết nối DB | `mongodb://localhost:27017/7tro` |
| `JWT_SECRET` | Khóa bảo mật Token | `your_secret_key` |
| `GMAIL_USER` | Email gửi OTP | `example@gmail.com` |
| `GMAIL_APP_PASSWORD` | Mật khẩu ứng dụng Gmail | `xxxx xxxx xxxx xxxx` |
| `CLIENT_URL` | URL của Frontend | `http://localhost:5173` |

### 4. Khởi chạy dự án
Bạn cần mở 2 cửa sổ Terminal:

*   **Terminal 1 (Backend):**
    ```bash
    cd BackEnd
    npm run dev
    ```
*   **Terminal 2 (Frontend):**
    ```bash
    cd FrontEnd
    npm run dev
    ```
*   **Tạo dữ liệu mẫu (Tùy chọn):** Nếu muốn có sẵn hàng trăm phòng trọ để test:
    ```bash
    cd BackEnd
    npm run seed
    ```
    *(Admin mặc định: `admin@7tro.com` / `Admin@2026`)*

---

## 📂 Cấu trúc thư mục (Folder Structure)
```text
.
├── BackEnd/            # Mã nguồn server (Node.js/Express)
│   ├── controllers/    # Xử lý logic API
│   ├── models/         # Định nghĩa Schema MongoDB
│   ├── routes/         # Khai báo các endpoint
│   ├── utils/          # Các tiện ích (Gửi mail, Seeding)
│   └── server.js       # File khởi tạo server
├── FrontEnd/           # Mã nguồn giao diện (React/Vite)
│   ├── src/
│   │   ├── app/        # Pages, Context, Routes
│   │   ├── components/ # Các UI Component dùng chung
│   │   └── lib/        # Cấu hình API (Axios)
└── README.md
```

---

