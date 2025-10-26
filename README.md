# 🧠 HCMUTE Student Consulting System – Backend API

License: MIT  
Build Status: ✅ Stable  
Database: MongoDB  
Framework: Express.js  

Một hệ thống **API backend** phục vụ cho **nền tảng tư vấn sinh viên HCMUTE**, được xây dựng với **Node.js**, **Express.js**, và **MongoDB (Mongoose)**.  
Cung cấp các RESTful endpoint để quản lý người dùng, tư vấn viên, phòng ban, lĩnh vực, câu hỏi, câu trả lời, bài viết và trò chuyện.

---

## 📑 Table of Contents
- [Overview](#-overview)
- [Core Features](#-core-features)
- [System Roles](#-system-roles)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Installation Guide](#️-installation-guide)
- [Environment Variables](#-environment-variables)
- [API Overview](#-api-overview)
- [Authors](#-authors)
- [License](#-license)

---

## 📌 Overview
Dự án backend được phát triển nhằm **xây dựng nền tảng tư vấn sinh viên trực tuyến cho HCMUTE**.  
Hệ thống hỗ trợ:
- Quản lý người dùng (Admin, Tư vấn viên, Sinh viên)
- Câu hỏi, câu trả lời, và bài viết chia sẻ kiến thức
- Trò chuyện và thông báo theo thời gian thực
- Quản lý phòng ban và lĩnh vực tư vấn

---

## ✨ Core Features
- 🔐 **Xác thực người dùng:** Đăng ký, đăng nhập, JWT access/refresh token  
- 👨‍🎓 **Sinh viên:** Gửi câu hỏi, xem phản hồi, trò chuyện, đánh giá tư vấn viên  
- 👩‍🏫 **Tư vấn viên:** Quản lý hồ sơ, trả lời câu hỏi, viết bài, xem lịch tư vấn  
- 📨 **Thông báo:** Gửi thông báo khi có phản hồi mới hoặc tin nhắn mới  
- ☁️ **Upload:** Quản lý hình ảnh qua Cloudinary  
- 💬 **Chat:** Giao tiếp thời gian thực bằng Socket.IO

---

## 🧩 System Roles

| Vai trò | Quyền hạn chính |
|----------|----------------|
| **Sinh viên (User)** | Đặt câu hỏi, trò chuyện, nhận tư vấn |
| **Tư vấn viên (Consultant)** | Trả lời câu hỏi, tạo bài viết, quản lý lịch tư vấn |
| **Quản trị viên (Admin)** | Quản lý người dùng, bài viết, lĩnh vực, phòng ban |

---

## 🧰 Tech Stack

| Mảng | Công nghệ |
|------|------------|
| **Ngôn ngữ** | Node.js (TypeScript) |
| **Framework** | Express.js |
| **Cơ sở dữ liệu** | MongoDB + Mongoose |
| **Xác thực** | JWT |
| **Gửi Email** | Nodemailer (SMTP Gmail) |
| **Upload File** | Cloudinary SDK |
| **Bảo mật** | bcrypt, helmet, cors |
| **Realtime Chat** | Socket.IO |
| **Môi trường** | dotenv |
| **Triển khai** | Docker / Render / Railway |

---

## 🧱 Project Structure

backend/
├── src/
│ ├── config/ # Cấu hình database, email, cloud
│ ├── controllers/ # Xử lý logic API
│ ├── middlewares/ # Middleware xác thực, lỗi
│ ├── models/ # Định nghĩa schema (Mongoose)
│ ├── routes/ # Định tuyến API
│ ├── services/ # Xử lý nghiệp vụ
│ ├── utils/ # Hàm tiện ích
│ └── app.js # Entry point chính
├── .env.example
├── package.json
└── README.md

## ⚙️ Installation Guide

### 1️⃣ Clone repository
```bash
git clone https://github.com/yourusername/hcmute-consulting-backend.git
cd hcmute-consulting-backend

### 2️⃣ Install dependencies
npm install
# hoặc
yarn install

### 3️⃣ Configure environment variables

Tạo file .env trong thư mục gốc:

PORT=5001
MONGODB_URI=mongodb://127.0.0.1:27017/hcmute_consulting

JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_jwt_refresh_secret

EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret


⚠️ Không commit file .env lên GitHub!
Đây là file nhạy cảm chứa thông tin đăng nhập và khóa bảo mật.

### 4️⃣ Run development server
npm run dev


Server sẽ khởi chạy tại:
👉 http://localhost:5001

### 🌐 API Overview
Nhóm chức năng	Mô tả
/api/auth	Đăng ký, đăng nhập, xác thực người dùng
/api/users	Quản lý hồ sơ người dùng
/api/questions	Quản lý câu hỏi & trả lời
/api/conversations	Trò chuyện giữa sinh viên & tư vấn viên
/api/posts	Quản lý bài viết tư vấn
/api/notifications	Gửi và nhận thông báo
/api/departments	Quản lý phòng ban & lĩnh vực
### 👨‍💻 Authors

Nhóm phát triển Backend:

🧑‍💻 Châu Văn Thân

👩‍💻 Trần Mai Di

👨‍💻 Võ Văn Nam

🎓 Trường Đại học Sư phạm Kỹ thuật TP.HCM
