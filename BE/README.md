# Hệ thống quản lý khách sạn (Hotel Management System)

Hệ thống quản lý khách sạn là một ứng dụng backend được xây dựng bằng ASP.NET Core Web API, cung cấp các API để quản lý khách sạn, bao gồm quản lý phòng, đặt phòng, khách hàng, dịch vụ và báo cáo.

## Yêu cầu hệ thống

- .NET 7.0 SDK hoặc cao hơn
- SQL Server 2019 hoặc cao hơn
- Visual Studio 2022 hoặc Visual Studio Code

## Cài đặt và chạy ứng dụng

### 1. Clone repository

\`\`\`bash
git clone https://github.com/ta28nov/hotel-management-system.git
cd hotel-management-system
\`\`\`

### 2. Cấu hình cơ sở dữ liệu

1. Mở SQL Server Management Studio
2. Chạy script SQL trong file `HotelManagement.SQL/HotelManagement_Database.sql` để tạo cơ sở dữ liệu và dữ liệu mẫu

### 3. Cấu hình kết nối cơ sở dữ liệu

Mở file `appsettings.json` trong thư mục `HotelManagement.API` và cập nhật chuỗi kết nối:

\`\`\`json
"ConnectionStrings": {
"DefaultConnection": "Server=YOUR_SERVER;Database=HotelManagement;Trusted_Connection=True;MultipleActiveResultSets=true;TrustServerCertificate=True"
}
\`\`\`

Thay `YOUR_SERVER` bằng tên server SQL Server của bạn.

### 4. Xây dựng và chạy ứng dụng

#### Sử dụng Visual Studio:

1. Mở file solution `HotelManagement.sln`
2. Nhấn F5 để build và chạy ứng dụng

#### Sử dụng .NET CLI:

\`\`\`bash
dotnet build
cd HotelManagement.API
dotnet run
\`\`\`

### 5. Truy cập Swagger UI

Mở trình duyệt và truy cập: `Localhost:5225/swagger`

## Cấu trúc dự án

Dự án được tổ chức theo kiến trúc Clean Architecture với các layer:

- **HotelManagement.Domain**: Chứa các entity và business logic
- **HotelManagement.Application**: Chứa các interface và logic ứng dụng
- **HotelManagement.Infrastructure**: Chứa các implementation của interface và kết nối cơ sở dữ liệu
- **HotelManagement.API**: Chứa các controller và endpoint API

API Endpoints
Authentication
POST /api/auth/login: Đăng nhập và lấy JWT token
POST /api/auth/register: Đăng ký người dùng mới
GET /api/auth/me: Lấy thông tin người dùng hiện tại
POST /api/auth/logout: Đăng xuất người dùng
POST /api/auth/forgot-password: Gửi email đặt lại mật khẩu
POST /api/auth/reset-password: Đặt lại mật khẩu
PUT /api/auth/change-password: Thay đổi mật khẩu
Users
GET /api/users: Lấy danh sách người dùng
GET /api/users/{id}: Lấy thông tin người dùng theo ID
POST /api/users: Tạo người dùng mới
PUT /api/users/{id}: Cập nhật thông tin người dùng
DELETE /api/users/{id}: Xóa người dùng
PUT /api/users/profile: Cập nhật thông tin cá nhân
Rooms
GET /api/rooms: Lấy danh sách phòng
GET /api/rooms/{id}: Lấy thông tin phòng theo ID
GET /api/rooms/available: Lấy danh sách phòng có sẵn trong khoảng thời gian
POST /api/rooms: Tạo phòng mới
PUT /api/rooms/{id}: Cập nhật thông tin phòng
DELETE /api/rooms/{id}: Xóa phòng
POST /api/rooms/image: Tải lên hình ảnh phòng
DELETE /api/rooms/{roomId}/image/{imageId}: Xóa hình ảnh phòng
GET /api/rooms/amenities: Lấy danh sách tiện nghi phòng
Room Types
GET /api/roomtypes: Lấy danh sách loại phòng
GET /api/roomtypes/{id}: Lấy thông tin loại phòng theo ID
POST /api/roomtypes: Tạo loại phòng mới
PUT /api/roomtypes/{id}: Cập nhật thông tin loại phòng
DELETE /api/roomtypes/{id}: Xóa loại phòng
Bookings
GET /api/bookings: Lấy danh sách đặt phòng
GET /api/bookings/{id}: Lấy thông tin đặt phòng theo ID
GET /api/bookings/my-bookings: Lấy danh sách đặt phòng của người dùng hiện tại
GET /api/bookings/filter: Lọc và tìm kiếm đặt phòng
POST /api/bookings: Tạo đặt phòng mới
PUT /api/bookings/{id}: Cập nhật thông tin đặt phòng
DELETE /api/bookings/{id}: Xóa đặt phòng
PUT /api/bookings/{id}/status: Cập nhật trạng thái đặt phòng
PUT /api/bookings/{id}/check-in: Check-in cho đặt phòng
PUT /api/bookings/{id}/check-out: Check-out cho đặt phòng
PUT /api/bookings/{id}/cancel: Hủy đặt phòng
PUT /api/bookings/{id}/payment: Cập nhật thanh toán
POST /api/bookings/{id}/payment/process: Xử lý thanh toán
GET /api/bookings/{id}/services: Lấy danh sách dịch vụ của đặt phòng
POST /api/bookings/{id}/services: Thêm dịch vụ cho đặt phòng
DELETE /api/bookings/{id}/services/{serviceId}: Xóa dịch vụ của đặt phòng
GET /api/bookings/{id}/invoice: Lấy hóa đơn của đặt phòng
POST /api/bookings/{id}/invoice: Tạo hóa đơn cho đặt phòng
Services
GET /api/services: Lấy danh sách dịch vụ
GET /api/services/{id}: Lấy thông tin dịch vụ theo ID
GET /api/services/category/{categoryId}: Lấy dịch vụ theo danh mục
GET /api/services/search: Tìm kiếm dịch vụ
GET /api/services/categories: Lấy danh sách danh mục dịch vụ
POST /api/services: Tạo dịch vụ mới
PUT /api/services/{id}: Cập nhật dịch vụ
DELETE /api/services/{id}: Xóa dịch vụ
POST /api/services/categories: Tạo danh mục dịch vụ mới
POST /api/services/image: Tải lên hình ảnh dịch vụ
Reports
GET /api/reports/monthly-revenue: Lấy báo cáo doanh thu theo tháng
GET /api/reports/occupancy: Lấy báo cáo công suất phòng


Lưu ý: Một số chức năng như cập nhật trạng thái, hủy đặt phòng, và quản lý hóa đơn được tích hợp vào các API hiện có thay vì có API riêng biệt.

## Cấu trúc cơ sở dữ liệu

Hệ thống sử dụng SQL Server với các bảng chính sau:

1. **Users**: Lưu thông tin người dùng hệ thống
2. **RoomTypes**: Lưu thông tin loại phòng
3. **Rooms**: Lưu thông tin phòng
4. **RoomFeatures**: Lưu thông tin tính năng và tiện nghi của loại phòng
5. **Customers**: Lưu thông tin khách hàng
6. **CustomerAddresses**: Lưu thông tin địa chỉ của khách hàng
7. **Bookings**: Lưu thông tin đặt phòng
8. **BookingHistory**: Lưu lịch sử thay đổi trạng thái đặt phòng
9. **ServiceCategories**: Lưu thông tin danh mục dịch vụ
10. **Services**: Lưu thông tin dịch vụ
11. **BookingServices**: Lưu thông tin dịch vụ đã sử dụng trong đặt phòng
12. **Invoices**: Lưu thông tin hóa đơn
13. **InvoiceItems**: Lưu thông tin chi tiết hóa đơn
14. **Reviews**: Lưu thông tin đánh giá của khách hàng

## Xác thực và phân quyền

Hệ thống sử dụng JWT (JSON Web Token) để xác thực người dùng. Các quyền được phân chia như sau:

- **Admin**: Có quyền truy cập tất cả các API
- **Employee**: Có quyền truy cập hầu hết các API, trừ một số API quản lý người dùng
- **Customer**: Chỉ có quyền truy cập các API liên quan đến đặt phòng và thông tin cá nhân

## Kiểm thử

## Các câu lệnh cấu hình :

# Cài đặt các package Entity Framework Core

dotnet add package Microsoft.EntityFrameworkCore.SqlServer
dotnet add package Microsoft.EntityFrameworkCore.Tools
dotnet add package Microsoft.EntityFrameworkCore.Design

# Cài đặt các package xác thực và phân quyền

dotnet add package Microsoft.AspNetCore.Authentication.JwtBearer
dotnet add package Microsoft.AspNetCore.Identity.EntityFrameworkCore

# Cài đặt các package tiện ích

dotnet add package AutoMapper.Extensions.Microsoft.DependencyInjection
dotnet add package FluentValidation.AspNetCore
dotnet add package Swashbuckle.AspNetCore

# Kiểm tra kết nối và cập nhật cơ sở dữ liệu (nếu cần)

dotnet ef database update

# Tạo migration mới (nếu có thay đổi trong model)

dotnet ef migrations add InitialCreate

# Tạo script SQL từ migration (để kiểm tra)

dotnet ef migrations script

Để chạy các bài kiểm thử:

\`\`\`bash
dotnet test
\`\`\`

## Tài liệu API

Tài liệu API đầy đủ có sẵn thông qua Swagger UI khi chạy ứng dụng.

## Liên hệ : 0345543986 . Thầy SẸO

**Tài khoản mẫu**: Sử dụng tài khoản mẫu sau để đăng nhập: không đăng nhập được thì tự tạo nhé các em -\_- <333

tiphong05@gmail.com // Zzz2811@

## Về cách lưu trữ và truy xuất hình ảnh

### 1. Lưu trữ hình ảnh

bạn cần lưu hình ảnh trong thư mục `wwwroot/images/`. Đây là cách hoạt động:

- Khi người dùng upload hình ảnh từ frontend, hình ảnh sẽ được gửi đến API backend
- API sẽ lưu file hình ảnh vào thư mục `wwwroot/images/` (hoặc thư mục con tương ứng)
- Đường dẫn tương đối của hình ảnh (ví dụ: `/images/rooms/room1.jpg`) sẽ được lưu vào database

### 2. Truy xuất hình ảnh

Đúng vậy, frontend sẽ sử dụng đường dẫn API để hiển thị hình ảnh. Có hai cách:

1. **Truy cập trực tiếp**: Frontend có thể truy cập hình ảnh trực tiếp thông qua URL:

```plaintext
https://your-api.com/images/rooms/room1.jpg
```

Điều này hoạt động vì bạn đã cấu hình `app.UseStaticFiles()` trong `Program.cs`, cho phép truy cập trực tiếp đến các file trong thư mục `wwwroot`.

2. **Thông qua API**: Frontend có thể lấy danh sách đường dẫn hình ảnh thông qua API:

```plaintext
GET /api/Images/RoomType/1
```

API sẽ trả về danh sách các đường dẫn hình ảnh, và frontend sẽ sử dụng các đường dẫn này để hiển thị hình ảnh.

Tóm lại, quy trình hoạt động như sau:

1. Frontend upload hình ảnh → Backend lưu vào `wwwroot/images/` và database
2. Frontend lấy đường dẫn hình ảnh từ API → Hiển thị hình ảnh bằng cách kết hợp URL cơ sở với đường dẫn tương đối

HotelManagement.API

File cấu hình chính:
appsettings.json: Chứa cấu hình kết nối database, JWT settings và logging
Program.cs: Điểm khởi đầu của ứng dụng, cấu hình dịch vụ, middleware, swagger và database
Controllers/ - Chứa các controller xử lý API:
AuthController.cs: Xử lý đăng nhập, đăng ký, quên mật khẩu
BookingsController.cs: Quản lý đặt phòng
ImagesController.cs: Quản lý hình ảnh
ReportsController.cs: Tạo báo cáo
RoomsController.cs: Quản lý phòng
RoomTypesController.cs: Quản lý loại phòng
ServicesController.cs: Quản lý dịch vụ
UsersController.cs: Quản lý người dùng
Mapping/ - Chứa cấu hình AutoMapper:
MappingProfile.cs: Định nghĩa các mapping giữa entities và DTOs
Middleware/ - Chứa các middleware tùy chỉnh:
ExceptionHandlingMiddleware.cs: Xử lý ngoại lệ toàn cục
JwtBlacklistMiddleware.cs: Kiểm tra token JWT có trong blacklist không
Models/ - Chứa các model cho request/response:
AuthModels.cs: Mô hình cho login, register, đặt lại mật khẩu
BookingModels.cs: Mô hình cho đặt phòng
ImageModels.cs: Mô hình cho upload ảnh
RoomModels.cs: Mô hình cho phòng
RoomTypeModels.cs: Mô hình cho loại phòng
ServiceModels.cs: Mô hình cho dịch vụ
UserModels.cs: Mô hình cho quản lý người dùng

HotelManagement.Application/

DependencyInjection.cs: File cấu hình dependency injection cho tầng Application, đăng ký dịch vụ AutoMapper.
Common/ - Chứa các thành phần dùng chung:
Exceptions/ - Các lớp ngoại lệ tùy chỉnh:
ForbiddenAccessException.cs: Ngoại lệ về truy cập bị cấm
NotFoundException.cs: Ngoại lệ khi không tìm thấy dữ liệu
ValidationException.cs: Ngoại lệ khi dữ liệu không hợp lệ
Interfaces/ - Các interface định nghĩa khả năng của hệ thống:
IBookingRepository.cs: Interface cho repository quản lý đặt phòng
ICustomerRepository.cs: Interface cho repository quản lý khách hàng
IIdentityService.cs: Interface cho dịch vụ xác thực và quản lý người dùng
IInvoiceRepository.cs: Interface cho repository quản lý hóa đơn
IReportService.cs: Interface cho dịch vụ báo cáo
IReviewRepository.cs: Interface cho repository quản lý đánh giá
IRoomRepository.cs: Interface cho repository quản lý phòng
IRoomTypeRepository.cs: Interface cho repository quản lý loại phòng
IServiceRepository.cs: Interface cho repository quản lý dịch vụ
ITokenService.cs: Interface cho dịch vụ quản lý token
IUserRepository.cs: Interface cho repository quản lý người dùng
Models/ - Các data transfer objects (DTOs):
AuthenticationResult.cs: Kết quả xác thực
MonthlyRevenueReportDto.cs: DTO báo cáo doanh thu theo tháng
OccupancyReportDto.cs: DTO báo cáo tỷ lệ lấp đầy
PasswordChangeResult.cs: Kết quả thay đổi mật khẩu
PasswordResetResult.cs: Kết quả đặt lại mật khẩu
RegistrationResult.cs: Kết quả đăng ký

HotelManagement.Domain
Thư mục này chỉ chứa một thư mục con là Entities, nơi định nghĩa các entity (thực thể) chính của hệ thống quản lý khách sạn. Đây là tầng Domain trong kiến trúc Clean Architecture, chứa các lớp thực thể core của ứng dụng.

Entities/
Thư mục này chứa tất cả các lớp thực thể của ứng dụng:
Booking.cs - Thực thể đặt phòng:
Thuộc tính: Id, CustomerId, RoomId, CheckInDate, CheckOutDate, Adults, Children, TotalAmount, Status, PaymentStatus, CreatedAt
Quan hệ: Liên kết với Customer, Room, Invoice, BookingHistories, BookingServices, Reviews
BookingHistory.cs - Thực thể lịch sử đặt phòng:
Theo dõi các thay đổi trong đặt phòng
BookingService.cs - Thực thể dịch vụ đặt phòng:
Quan hệ nhiều-nhiều giữa Booking và Service
Customer.cs - Thực thể khách hàng:
Thuộc tính: Id, FirstName, LastName, Email, PhoneNumber, IdNumber, Nationality, UserId
Quan hệ: Liên kết với User, Addresses, Bookings
CustomerAddress.cs - Thực thể địa chỉ khách hàng:
Lưu trữ thông tin địa chỉ của khách hàng
Invoice.cs - Thực thể hóa đơn:
Thuộc tính: Id, BookingId, InvoiceNumber, IssuedDate, TotalAmount, Tax, Status
Quan hệ: Liên kết với Booking, InvoiceItems
InvoiceItem.cs - Thực thể mục hóa đơn:
Chi tiết từng mục trong hóa đơn
Review.cs - Thực thể đánh giá:
Lưu trữ đánh giá của khách hàng về phòng/dịch vụ
Room.cs - Thực thể phòng:
Thuộc tính: Id, RoomNumber, RoomTypeId, Status, Floor
Quan hệ: Liên kết với RoomType, Bookings
RoomFeature.cs - Thực thể tính năng phòng:
Lưu trữ các tính năng đặc biệt của phòng
RoomType.cs - Thực thể loại phòng:
Thuộc tính: Id, Name, Description, BasePrice, Capacity
Quan hệ: Liên kết với Rooms, RoomFeatures
Service.cs - Thực thể dịch vụ:
Thuộc tính: Id, Name, CategoryId, Description, Price, IsAvailable, ImageUrl
Quan hệ: Liên kết với Category, BookingServices
ServiceCategory.cs - Thực thể danh mục dịch vụ:
Phân loại các dịch vụ khách sạn
User.cs - Thực thể người dùng:
Thuộc tính: Id, Name, Email, PasswordHash, PhoneNumber, Role, CreatedAt, UpdatedAt
Quan hệ: Liên kết với Customers, BookingHistories

HotelManagement.Infrastructure
Thư mục này triển khai tầng Infrastructure của ứng dụng, bao gồm các Repository, Services, Data Access và Identity. Đây là tầng ngoài cùng trong kiến trúc Clean Architecture, triển khai các interface đã định nghĩa trong tầng Application.
DependencyInjection.cs
Cấu hình đăng ký các dịch vụ (repositories và services) cho Dependency Injection container.
Đăng ký các repository, service và cấu hình JWT settings.
Data/
HotelDbContext.cs: DbContext của Entity Framework Core, định nghĩa các DbSet và cấu hình database mapping cho các entity.
Cấu hình chi tiết mối quan hệ giữa các entity
Định nghĩa các ràng buộc, khóa ngoại và các thuộc tính của bảng
Identity/
IdentityService.cs: Triển khai IIdentityService, xử lý xác thực và quản lý người dùng.
Xác thực người dùng (login)
Đăng ký người dùng mới
Quản lý mật khẩu (đặt lại, thay đổi)
TokenService.cs: Triển khai ITokenService, xử lý tạo và quản lý JWT token.
Repositories/
Thư mục chứa các repository triển khai các interface từ tầng Application:
BookingRepository.cs: Triển khai IBookingRepository, quản lý các thao tác với đặt phòng.
CustomerRepository.cs: Triển khai ICustomerRepository, quản lý thông tin khách hàng.
InvoiceRepository.cs: Triển khai IInvoiceRepository, quản lý hóa đơn.
ReviewRepository.cs: Triển khai IReviewRepository, quản lý đánh giá.
RoomRepository.cs: Triển khai IRoomRepository, quản lý thông tin phòng.
Tìm kiếm phòng
Kiểm tra phòng có sẵn trong khoảng thời gian
Tạo, cập nhật, xóa phòng
RoomTypeRepository.cs: Triển khai IRoomTypeRepository, quản lý loại phòng.
ServiceRepository.cs: Triển khai IServiceRepository, quản lý dịch vụ.
UserRepository.cs: Triển khai IUserRepository, quản lý người dùng.
Services/
ReportService.cs: Triển khai IReportService, tạo các báo cáo từ stored procedures.
Báo cáo doanh thu theo tháng
Báo cáo công suất phòng



###Đây là chi tiết về cách thức hoạt động của backend ///// NÊN ĐỌC 

1. Kiến trúc theo Clean Architecture
Hệ thống được chia thành 4 tầng chính:

HotelManagement.API (Presentation Layer): Giao diện tiếp nhận request từ phía client và trả về response.

HotelManagement.Application (Application Layer): Chứa logic xử lý nghiệp vụ, định nghĩa các interface, DTO và đăng ký dependency injection.

HotelManagement.Domain (Domain Layer): Chứa các entity cốt lõi của hệ thống (như Booking, Room, Service, User, …) thể hiện dữ liệu và quy tắc nghiệp vụ.

HotelManagement.Infrastructure (Infrastructure Layer): Triển khai các interface từ tầng Application, bao gồm Repository, Service, Data Access và các dịch vụ xác thực.

2. Chi tiết tương tác giữa các thành phần
2.1. HotelManagement.API
File cấu hình chính:

appsettings.json: Định nghĩa kết nối cơ sở dữ liệu, JWT settings và cấu hình logging.

Program.cs: Điểm khởi đầu của ứng dụng, nơi cấu hình các service cần thiết, middleware (như ExceptionHandlingMiddleware và JwtBlacklistMiddleware), Swagger và khởi tạo kết nối database.

Controllers:
Mỗi controller chịu trách nhiệm xử lý một nhóm chức năng cụ thể. Ví dụ:

AuthController.cs: Xử lý login, đăng ký, quên mật khẩu.

BookingsController.cs, RoomsController.cs, RoomTypesController.cs,…: Xử lý các thao tác CRUD và nghiệp vụ liên quan đến đặt phòng, phòng, loại phòng, dịch vụ, người dùng, hình ảnh và báo cáo.

Mapping:

MappingProfile.cs: Định nghĩa cấu hình AutoMapper chuyển đổi giữa entity và DTO, giúp giảm thiểu việc lặp lại code khi chuyển đổi dữ liệu giữa các tầng.

Middleware:

ExceptionHandlingMiddleware.cs: Bắt và xử lý ngoại lệ toàn cục, đảm bảo trả về thông tin lỗi thống nhất.

JwtBlacklistMiddleware.cs: Kiểm tra các token đã bị thu hồi (blacklist) trước khi xử lý request.

2.2. HotelManagement.Application
DependencyInjection.cs:
Cấu hình đăng ký các service, bao gồm các repository và AutoMapper, cho container của DI, giúp liên kết các tầng với nhau.

Common/Exceptions:
Chứa các lớp ngoại lệ tùy chỉnh như ForbiddenAccessException, NotFoundException, ValidationException, được sử dụng để báo lỗi trong các thao tác nghiệp vụ.

Interfaces và Models:

Các interface định nghĩa khả năng của các module như IBookingRepository, IIdentityService, ITokenService,…

Các DTO (Data Transfer Objects) được định nghĩa trong Models nhằm truyền tải dữ liệu giữa các tầng một cách rõ ràng (ví dụ: AuthenticationResult, MonthlyRevenueReportDto,…).

2.3. HotelManagement.Domain
Entities:
Đây là tầng cốt lõi chứa các lớp entity thể hiện dữ liệu chính của hệ thống, ví dụ:

Booking, BookingHistory, BookingService: Quản lý các thông tin và lịch sử đặt phòng.

Customer, CustomerAddress: Thông tin khách hàng và địa chỉ.

Room, RoomType, RoomFeature: Quản lý thông tin phòng, loại phòng và các tính năng liên quan.

Service, ServiceCategory: Quản lý dịch vụ và phân loại.

Invoice, InvoiceItem: Thông tin hóa đơn thanh toán.

User: Quản lý người dùng và liên kết với các entity khác như Customer, BookingHistory.

2.4. HotelManagement.Infrastructure
DependencyInjection.cs:
Đăng ký các dịch vụ repository và service cụ thể với DI container, khớp với các interface ở tầng Application.

Data Access:

HotelDbContext.cs: Định nghĩa DbContext của Entity Framework Core với các DbSet tương ứng với các entity trong hệ thống. Cấu hình mối quan hệ, khóa ngoại và các ràng buộc dữ liệu.

Identity:

IdentityService.cs: Triển khai IIdentityService, đảm nhận việc xác thực, đăng ký người dùng và quản lý mật khẩu (đặt lại, thay đổi).

TokenService.cs: Triển khai ITokenService, xử lý tạo và quản lý JWT token.

Repositories:
Cung cấp các lớp triển khai cho các interface như IBookingRepository, IRoomRepository, IServiceRepository,… Thực hiện các thao tác truy cập dữ liệu:

Tìm kiếm, tạo, cập nhật, xóa các entity liên quan đến đặt phòng, phòng, loại phòng, dịch vụ và người dùng.

Services:

ReportService.cs: Triển khai IReportService, xây dựng các báo cáo như doanh thu theo tháng và tỉ lệ lấp đầy phòng, có thể sử dụng stored procedures để thực hiện truy vấn trên cơ sở dữ liệu.

3. Luồng hoạt động từ client đến database
Client gửi request:
Các request (đăng nhập, đặt phòng, cập nhật thông tin, …) được gửi đến API thông qua các endpoint được định nghĩa trong các controller.

API nhận và xử lý request:

Middleware (như ExceptionHandling và JwtBlacklist) chạy đầu tiên để kiểm tra và xử lý các lỗi toàn cục hoặc xác thực token.

Controller nhận request, gọi các service ở tầng Application.

Xử lý nghiệp vụ ở tầng Application:

Controller chuyển request thành các DTO và gọi đến các interface (vd: IBookingRepository, IIdentityService,…).

Các nghiệp vụ và quy tắc kiểm tra hợp lệ được thực hiện tại đây, sử dụng các lớp ngoại lệ tùy chỉnh nếu cần.

Tương tác với cơ sở dữ liệu ở tầng Infrastructure:

Các repository đã đăng ký sẽ được gọi để thực hiện các thao tác CRUD lên database thông qua HotelDbContext.

Các service (như IdentityService, TokenService) đảm nhận các tác vụ liên quan đến xác thực và tạo token.

Chuyển đổi dữ liệu:

AutoMapper được sử dụng để chuyển đổi giữa entity và DTO, đảm bảo rằng dữ liệu trả về client được định dạng đúng.

Trả về kết quả:

Sau khi xử lý xong, controller nhận kết quả từ tầng Application, chuyển đổi lại thành response JSON và trả về client.

