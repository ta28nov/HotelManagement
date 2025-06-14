# Hotel Management System - Frontend

## 📝 Giới thiệu

Hệ thống quản lý khách sạn hiện đại với giao diện người dùng mượt mà, hiệu ứng cuộn trang đẹp mắt. Xây dựng bằng ReactJS + Vite, sử dụng CSS thuần, hỗ trợ quản lý phòng, đặt phòng, dịch vụ, tài khoản và nhiều tính năng mở rộng.

## 🚀 Công nghệ sử dụng chính

- **React 18**: Xây dựng giao diện người dùng dạng SPA
- **Vite**: Công cụ build hiện đại, hỗ trợ hot reload
- **React Router v6**: Routing động
- **React Context + Hooks**: Quản lý state toàn cục
- **Axios**: Giao tiếp API
- **React Hook Form**: Quản lý form và validate
- **Date-fns**: Xử lý ngày tháng
- **React Icons, Toastify, Framer Motion**: UI/UX nâng cao
- **Pure CSS + CSS Modules**: Styling linh hoạt, dễ bảo trì

## 📁 Cấu trúc thư mục chi tiết

```
hotel-management (1)/
├── index.html
├── package.json
├── vite.config.js
├── README.md
└── src/
    ├── api/                # Định nghĩa endpoints, axios config
    │   ├── axiosClient.js
    │   ├── authAPI.js
    │   ├── bookingAPI.js
    │   ├── roomAPI.js
    │   └── serviceAPI.js
    ├── assets/
    │   ├── images/         # Ảnh giao diện
    │   └── styles/         # CSS global
    ├── components/
    │   ├── common/         # Button, Input, Modal, ...
    │   ├── layout/         # Header, Footer, Sidebar
    │   └── booking/        # Các component đặt phòng
    ├── config/
    │   └── constants.js    # Hằng số cấu hình
    ├── context/
    │   ├── AuthContext.js
    │   └── BookingContext.js
    ├── hooks/
    │   ├── useAuth.js
    │   └── useBooking.js
    ├── pages/
    │   ├── Home/
    │   ├── RoomList/
    │   ├── RoomDetail/
    │   ├── BookingPage/
    │   ├── Profile/
    │   └── Auth/
    ├── services/
    │   ├── authService.js
    │   └── bookingService.js
    ├── utils/
    │   ├── dateUtils.js
    │   ├── formatUtils.js
    │   └── validationUtils.js
    ├── App.jsx
    └── main.jsx
```

## 📝 Quy ước code

- **Component:** Đặt tên PascalCase, mỗi component một file, tách CSS riêng nếu cần
- **Hook:** Prefix `use`, mỗi hook cho một chức năng
- **Context:** Suffix `Context`, export provider/hook riêng
- **Utils:** Tách hàm tiện ích vào `utils/`
- **Biến môi trường:** Đặt trong file `.env` ở gốc dự án
- **Commit message:** Theo chuẩn `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

## 🔑 Biến môi trường mẫu

```env
VITE_API_URL=http://localhost:5000/api
VITE_IMAGE_URL=http://localhost:5000
VITE_TOKEN_KEY=hotel_token
VITE_USER_KEY=hotel_user
VITE_APP_TITLE=Hotel Management System
VITE_DEFAULT_LANGUAGE=vi
```

## 💻 Hướng dẫn chạy dự án

1. **Clone code về máy**
2. **Cài đặt dependencies**
```bash
npm install
```
3. **Tạo file .env** (có thể copy từ .env.example)
4. **Chạy ứng dụng ở chế độ phát triển**
```bash
npm run dev
```
5. **Build production**
```bash
npm run build
```
6. **Xem thử bản build**
```bash
npm run preview
```

## 👤 Tác giả

- **Tuấn Anh**

## 📜 License

MIT License. Copyright © 2024 Tuấn Anh.

## 🙏 Cảm ơn

Dự án sử dụng các thư viện open source:
- React + Vite
- React Router
- Axios
- Date-fns
- React Icons
- React Toastify
- Framer Motion

