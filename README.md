# Hệ thống quản lý khách sạn (Hotel Management System)

Hệ thống quản lý khách sạn là một ứng dụng backend được xây dựng theo kiến trúc Clean Architecture sử dụng ASP.NET Core Web API, cung cấp các API để quản lý khách sạn, bao gồm quản lý phòng, đặt phòng, khách hàng, dịch vụ và báo cáo.


## 🎥 Demo Video

👉 [Watch Demo Video]    https://www.youtube.com/watch?v=Pe094_87R9I
*A complete walkthrough of the ASP.NET Core Hotel Management System using Clean Architecture*



## Yêu cầu hệ thống

- .NET 7.0 SDK hoặc cao hơn
- SQL Server 2019 hoặc cao hơn
- Visual Studio 2022 hoặc Visual Studio Code

## Cài đặt và chạy ứng dụng

### 1. Clone repository

```bash
git clone https://github.com/ta28nov/HotelManagement.git
cd HotelManagement
```

### 2. Cấu hình cơ sở dữ liệu

1. Mở SQL Server Management Studio
2. Chạy script SQL trong file `HotelManagement.SQL/HotelManagement_Database.sql` để tạo cơ sở dữ liệu và dữ liệu mẫu

### 3. Cấu hình kết nối cơ sở dữ liệu

Mở file `appsettings.json` trong thư mục `HotelManagement.API` và cập nhật chuỗi kết nối:

```json
"ConnectionStrings": {
  "DefaultConnection": "Server=YOUR_SERVER;Database=HotelManagement;Trusted_Connection=True;MultipleActiveResultSets=true;TrustServerCertificate=True"
}
```

Thay `YOUR_SERVER` bằng tên server SQL Server của bạn.

### 4. Xây dựng và chạy ứng dụng

#### Sử dụng Visual Studio:

1. Mở file solution `HotelManagement.sln`
2. Nhấn F5 để build và chạy ứng dụng

#### Sử dụng .NET CLI:

```bash
dotnet build
cd HotelManagement.API
dotnet run
```

### 5. Truy cập Swagger UI

Mở trình duyệt và truy cập: http://localhost:5225/swagger

## Cấu trúc dự án

Dự án được tổ chức theo kiến trúc Clean Architecture với các layer:

- **HotelManagement.Domain**: Chứa các entity và business logic
- **HotelManagement.Application**: Interface, logic ứng dụng, DTO, DI, exception, service
- **HotelManagement.Infrastructure**: Implement interface, Repository, Service, Data Access, Identity
- **HotelManagement.API**: Controllers, cấu hình, middleware, swagger, endpoint API

## Một số API endpoint tiêu biểu

### Authentication

- POST /api/auth/login: Đăng nhập và lấy JWT token
- POST /api/auth/register: Đăng ký người dùng mới
- GET /api/auth/me: Lấy thông tin người dùng hiện tại
- POST /api/auth/logout: Đăng xuất người dùng
- POST /api/auth/forgot-password: Gửi email đặt lại mật khẩu
- POST /api/auth/reset-password: Đặt lại mật khẩu
- PUT /api/auth/change-password: Thay đổi mật khẩu

### Users

- GET /api/users: Lấy danh sách người dùng
- GET /api/users/{id}: Lấy thông tin người dùng theo ID
- POST /api/users: Tạo người dùng mới
- PUT /api/users/{id}: Cập nhật thông tin người dùng
- DELETE /api/users/{id}: Xóa người dùng
- PUT /api/users/profile: Cập nhật thông tin cá nhân

### Rooms

- GET /api/rooms: Lấy danh sách phòng
- GET /api/rooms/{id}: Lấy thông tin phòng theo ID
- GET /api/rooms/available: Lấy danh sách phòng có sẵn
- POST /api/rooms: Tạo phòng mới
- PUT /api/rooms/{id}: Cập nhật thông tin phòng
- DELETE /api/rooms/{id}: Xóa phòng
- POST /api/rooms/image: Upload hình ảnh phòng
- DELETE /api/rooms/{roomId}/image/{imageId}: Xóa hình ảnh phòng
- GET /api/rooms/amenities: Lấy danh sách tiện nghi phòng

### Room Types

- GET /api/roomtypes: Lấy danh sách loại phòng
- GET /api/roomtypes/{id}: Lấy thông tin loại phòng
- POST /api/roomtypes: Tạo loại phòng mới
- PUT /api/roomtypes/{id}: Cập nhật loại phòng
- DELETE /api/roomtypes/{id}: Xóa loại phòng

### Bookings

- GET /api/bookings: Lấy danh sách đặt phòng
- GET /api/bookings/{id}: Lấy thông tin đặt phòng
- GET /api/bookings/my-bookings: Lấy danh sách đặt phòng của người dùng hiện tại
- POST /api/bookings: Tạo đặt phòng mới
- PUT /api/bookings/{id}: Cập nhật thông tin đặt phòng
- DELETE /api/bookings/{id}: Xóa đặt phòng
- PUT /api/bookings/{id}/status: Cập nhật trạng thái đặt phòng
- PUT /api/bookings/{id}/check-in: Check-in
- PUT /api/bookings/{id}/check-out: Check-out
- PUT /api/bookings/{id}/cancel: Hủy đặt phòng
- PUT /api/bookings/{id}/payment: Cập nhật thanh toán

### Services

- GET /api/services: Lấy danh sách dịch vụ
- GET /api/services/{id}: Lấy thông tin dịch vụ
- POST /api/services: Tạo dịch vụ mới
- PUT /api/services/{id}: Cập nhật dịch vụ
- DELETE /api/services/{id}: Xóa dịch vụ

### Reports

- GET /api/reports/monthly-revenue: Báo cáo doanh thu theo tháng
- GET /api/reports/occupancy: Báo cáo công suất phòng

## Cấu trúc cơ sở dữ liệu

Hệ thống sử dụng SQL Server với các bảng chính sau:

- Users, RoomTypes, Rooms, RoomFeatures, Customers, CustomerAddresses, Bookings, BookingHistory, ServiceCategories, Services, BookingServices, Invoices, InvoiceItems, Reviews

## Xác thực & Phân quyền

- Sử dụng JWT (JSON Web Token)
- Quyền truy cập: Admin, Employee, Customer

## Các câu lệnh cấu hình thường dùng

### Cài đặt Entity Framework Core

```bash
dotnet add package Microsoft.EntityFrameworkCore.SqlServer
dotnet add package Microsoft.EntityFrameworkCore.Tools
dotnet add package Microsoft.EntityFrameworkCore.Design
```

### Cài đặt xác thực và phân quyền

```bash
dotnet add package Microsoft.AspNetCore.Authentication.JwtBearer
dotnet add package Microsoft.AspNetCore.Identity.EntityFrameworkCore
```

### Cài đặt tiện ích

```bash
dotnet add package AutoMapper.Extensions.Microsoft.DependencyInjection
dotnet add package FluentValidation.AspNetCore
dotnet add package Swashbuckle.AspNetCore
```

### Cập nhật database

```bash
dotnet ef database update
```

### Tạo migration mới

```bash
dotnet ef migrations add InitialCreate
```

### Tạo script SQL từ migration

```bash
dotnet ef migrations script
```

### Chạy kiểm thử

```bash
dotnet test
```

## Tài liệu API

Tài liệu API đầy đủ có sẵn qua Swagger UI khi chạy ứng dụng.

## Liên hệ

Thầy SẸO - 0345543986

**Tài khoản mẫu:**  
tiphong05@gmail.com / Zzz2811@  
(Nếu không đăng nhập được thì tự tạo tài khoản mới)

## Hướng dẫn lưu trữ và truy xuất hình ảnh

- Ảnh upload lên API sẽ được lưu vào thư mục `wwwroot/images/`.
- Đường dẫn ảnh (ví dụ `/images/rooms/room1.jpg`) sẽ được lưu trong database.
- Frontend lấy đường dẫn qua API hoặc truy cập trực tiếp với URL:  
  `https://your-api.com/images/rooms/room1.jpg`
- API ví dụ lấy ảnh:  
  `GET /api/Images/RoomType/1`

## Kiến trúc hệ thống (Clean Architecture)

1. **API Layer (HotelManagement.API):** Controllers, cấu hình, xử lý request/response
2. **Application Layer (HotelManagement.Application):** Logic nghiệp vụ, interface, DTO, DI, exception, mapping
3. **Domain Layer (HotelManagement.Domain):** Entity cốt lõi (Booking, Room, Service, User, ...)
4. **Infrastructure Layer (HotelManagement.Infrastructure):** Repository, service, data access, identity, DB context

Luồng hoạt động:  
Client gửi request → API kiểm tra/middleware → Controller gọi Application Service → Repository thao tác DB → Response trả về client (có mapping dữ liệu bằng AutoMapper)

---

> **Đọc kỹ README này để hiểu cách setup, cấu trúc & vận hành dự án!**
