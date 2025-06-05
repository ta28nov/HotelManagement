/*
==========================================================================
    HỆ THỐNG QUẢN LÝ KHÁCH SẠN - DATABASE SCRIPT
==========================================================================
    Script này tạo cơ sở dữ liệu HotelManagement với đầy đủ các bảng,
    ràng buộc và dữ liệu mẫu cho hệ thống quản lý khách sạn.
    
    Các bảng chính:
    - Users: Lưu thông tin người dùng hệ thống
    - RoomTypes: Lưu thông tin loại phòng
    - Rooms: Lưu thông tin phòng
    - RoomFeatures: Lưu thông tin tính năng và tiện nghi của loại phòng
    - Customers: Lưu thông tin khách hàng
    - CustomerAddresses: Lưu thông tin địa chỉ của khách hàng
    - Bookings: Lưu thông tin đặt phòng
    - BookingHistory: Lưu lịch sử thay đổi trạng thái đặt phòng
    - ServiceCategories: Lưu thông tin danh mục dịch vụ
    - Services: Lưu thông tin dịch vụ
    - BookingServices: Lưu thông tin dịch vụ đã sử dụng trong đặt phòng
    - Invoices: Lưu thông tin hóa đơn
    - InvoiceItems: Lưu thông tin chi tiết hóa đơn
    - Reviews: Lưu thông tin đánh giá của khách hàng
    
    Hướng dẫn lưu trữ hình ảnh:
    - Hệ thống sử dụng phương pháp lưu trữ đường dẫn hình ảnh (URL path)
    - Hình ảnh được lưu trong thư mục wwwroot/images của ứng dụng
    - Đường dẫn tương đối được lưu trong cơ sở dữ liệu (ví dụ: /images/rooms/room1.jpg)
    - Trong bảng RoomFeatures, các hình ảnh được lưu với FeatureType = 'image'
    - Trong bảng Services, hình ảnh được lưu trong trường ImageUrl
    
    Cách truy xuất hình ảnh:
    - Backend: Sử dụng đường dẫn tương đối để tạo URL đầy đủ
    - Frontend: Kết hợp URL cơ sở của API với đường dẫn tương đối
    - Ví dụ: https://your-api.com/images/rooms/room1.jpg
*/

-- Tạo cơ sở dữ liệu
USE master;
GO

-- Kiểm tra và xóa cơ sở dữ liệu nếu đã tồn tại
IF EXISTS (SELECT name FROM sys.databases WHERE name = 'HotelManagement')
BEGIN
    ALTER DATABASE HotelManagement SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
    DROP DATABASE HotelManagement;
END
GO

CREATE DATABASE HotelManagement;
GO

USE HotelManagement;
GO

-- Tạo bảng Users
CREATE TABLE Users (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Name NVARCHAR(100) NOT NULL,
    Email NVARCHAR(100) NOT NULL UNIQUE,
    PasswordHash NVARCHAR(255) NOT NULL,
    PhoneNumber NVARCHAR(20) NULL,
    Role NVARCHAR(20) NOT NULL,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 NULL,
    CONSTRAINT CK_Users_Role CHECK (Role IN ('admin', 'employee', 'customer'))
);
GO

-- Tạo bảng RoomTypes
CREATE TABLE RoomTypes (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Name NVARCHAR(50) NOT NULL,
    Description NVARCHAR(MAX) NULL,
    BasePrice DECIMAL(10, 2) NOT NULL,
    Capacity INT NOT NULL,
    CONSTRAINT CK_RoomTypes_BasePrice CHECK (BasePrice >= 0),
    CONSTRAINT CK_RoomTypes_Capacity CHECK (Capacity > 0)
);
GO

-- Tạo bảng Rooms
CREATE TABLE Rooms (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    RoomNumber NVARCHAR(10) NOT NULL UNIQUE,
    RoomTypeId INT NOT NULL,
    Status NVARCHAR(20) NOT NULL,
    Floor INT NOT NULL,
    CONSTRAINT FK_Rooms_RoomTypes FOREIGN KEY (RoomTypeId) REFERENCES RoomTypes(Id) ON DELETE NO ACTION,
    CONSTRAINT CK_Rooms_Status CHECK (Status IN ('available', 'occupied', 'maintenance', 'cleaning', 'reserved'))
);
GO

-- Tạo bảng RoomFeatures
CREATE TABLE RoomFeatures (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    RoomTypeId INT NOT NULL,
    FeatureType NVARCHAR(20) NOT NULL,
    Name NVARCHAR(100) NOT NULL,
    Value NVARCHAR(255) NULL,
    IsPrimary BIT NOT NULL DEFAULT 0,
    CONSTRAINT FK_RoomFeatures_RoomTypes FOREIGN KEY (RoomTypeId) REFERENCES RoomTypes(Id) ON DELETE CASCADE,
    CONSTRAINT CK_RoomFeatures_FeatureType CHECK (FeatureType IN ('amenity', 'image', 'specification'))
);
GO

-- Tạo bảng Customers
CREATE TABLE Customers (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    FirstName NVARCHAR(50) NOT NULL,
    LastName NVARCHAR(50) NOT NULL,
    Email NVARCHAR(100) NULL,
    PhoneNumber NVARCHAR(20) NOT NULL,
    IdNumber NVARCHAR(50) NULL,
    Nationality NVARCHAR(50) NULL,
    UserId INT NULL,
    CONSTRAINT FK_Customers_Users FOREIGN KEY (UserId) REFERENCES Users(Id) ON DELETE SET NULL
);
GO

-- Tạo bảng CustomerAddresses
CREATE TABLE CustomerAddresses (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    CustomerId INT NOT NULL,
    AddressType NVARCHAR(20) NOT NULL,
    Address NVARCHAR(255) NOT NULL,
    City NVARCHAR(100) NOT NULL,
    State NVARCHAR(100) NULL,
    PostalCode NVARCHAR(20) NULL,
    Country NVARCHAR(100) NOT NULL,
    IsDefault BIT NOT NULL DEFAULT 0,
    CONSTRAINT FK_CustomerAddresses_Customers FOREIGN KEY (CustomerId) REFERENCES Customers(Id) ON DELETE CASCADE,
    CONSTRAINT CK_CustomerAddresses_AddressType CHECK (AddressType IN ('home', 'work', 'billing', 'shipping', 'other'))
);
GO

-- Tạo bảng Bookings
CREATE TABLE Bookings (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    CustomerId INT NOT NULL,
    RoomId INT NOT NULL,
    CheckInDate DATETIME2 NOT NULL,
    CheckOutDate DATETIME2 NOT NULL,
    Adults INT NOT NULL DEFAULT 1,
    Children INT NOT NULL DEFAULT 0,
    TotalAmount DECIMAL(10, 2) NOT NULL,
    Status NVARCHAR(20) NOT NULL,
    PaymentStatus NVARCHAR(20) NOT NULL,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    CONSTRAINT FK_Bookings_Customers FOREIGN KEY (CustomerId) REFERENCES Customers(Id) ON DELETE NO ACTION,
    CONSTRAINT FK_Bookings_Rooms FOREIGN KEY (RoomId) REFERENCES Rooms(Id) ON DELETE NO ACTION,
    CONSTRAINT CK_Bookings_CheckOutDate CHECK (CheckOutDate > CheckInDate),
    CONSTRAINT CK_Bookings_Adults CHECK (Adults > 0),
    CONSTRAINT CK_Bookings_Children CHECK (Children >= 0),
    CONSTRAINT CK_Bookings_TotalAmount CHECK (TotalAmount >= 0),
    CONSTRAINT CK_Bookings_Status CHECK (Status IN ('pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled', 'no_show')),
    CONSTRAINT CK_Bookings_PaymentStatus CHECK (PaymentStatus IN ('pending', 'partial', 'paid', 'refunded', 'failed'))
);
GO

-- Tạo bảng BookingHistory
CREATE TABLE BookingHistory (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    BookingId INT NOT NULL,
    Status NVARCHAR(20) NOT NULL,
    PaymentStatus NVARCHAR(20) NULL,
    ChangedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    ChangedBy INT NULL,
    Notes NVARCHAR(255) NULL,
    CONSTRAINT FK_BookingHistory_Bookings FOREIGN KEY (BookingId) REFERENCES Bookings(Id) ON DELETE CASCADE,
    CONSTRAINT FK_BookingHistory_Users FOREIGN KEY (ChangedBy) REFERENCES Users(Id) ON DELETE SET NULL,
    CONSTRAINT CK_BookingHistory_Status CHECK (Status IN ('pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled', 'no_show')),
    CONSTRAINT CK_BookingHistory_PaymentStatus CHECK (PaymentStatus IS NULL OR PaymentStatus IN ('pending', 'partial', 'paid', 'refunded', 'failed'))
);
GO

-- Tạo bảng ServiceCategories
CREATE TABLE ServiceCategories (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Name NVARCHAR(50) NOT NULL,
    Description NVARCHAR(255) NULL
);
GO

-- Tạo bảng Services
CREATE TABLE Services (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Name NVARCHAR(100) NOT NULL,
    CategoryId INT NOT NULL,
    Description NVARCHAR(MAX) NULL,
    Price DECIMAL(10, 2) NOT NULL,
    IsAvailable BIT NOT NULL DEFAULT 1,
    ImageUrl NVARCHAR(255) NULL,
    CONSTRAINT FK_Services_ServiceCategories FOREIGN KEY (CategoryId) REFERENCES ServiceCategories(Id) ON DELETE NO ACTION,
    CONSTRAINT CK_Services_Price CHECK (Price >= 0)
);
GO

-- Tạo bảng BookingServices
CREATE TABLE BookingServices (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    BookingId INT NOT NULL,
    ServiceId INT NOT NULL,
    Quantity INT NOT NULL DEFAULT 1,
    Price DECIMAL(10, 2) NOT NULL,
    ServiceDate DATETIME2 NOT NULL DEFAULT GETDATE(),
    CONSTRAINT FK_BookingServices_Bookings FOREIGN KEY (BookingId) REFERENCES Bookings(Id) ON DELETE CASCADE,
    CONSTRAINT FK_BookingServices_Services FOREIGN KEY (ServiceId) REFERENCES Services(Id) ON DELETE NO ACTION,
    CONSTRAINT CK_BookingServices_Quantity CHECK (Quantity > 0),
    CONSTRAINT CK_BookingServices_Price CHECK (Price >= 0)
);
GO

-- Tạo bảng Invoices
CREATE TABLE Invoices (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    BookingId INT NOT NULL,
    InvoiceNumber NVARCHAR(50) NOT NULL UNIQUE,
    IssuedDate DATETIME2 NOT NULL DEFAULT GETDATE(),
    TotalAmount DECIMAL(10, 2) NOT NULL,
    Tax DECIMAL(10, 2) NOT NULL DEFAULT 0,
    Status NVARCHAR(20) NOT NULL,
    CONSTRAINT FK_Invoices_Bookings FOREIGN KEY (BookingId) REFERENCES Bookings(Id) ON DELETE NO ACTION,
    CONSTRAINT CK_Invoices_TotalAmount CHECK (TotalAmount >= 0),
    CONSTRAINT CK_Invoices_Tax CHECK (Tax >= 0),
    CONSTRAINT CK_Invoices_Status CHECK (Status IN ('draft', 'issued', 'paid', 'cancelled', 'refunded'))
);
GO

-- Tạo bảng InvoiceItems
CREATE TABLE InvoiceItems (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    InvoiceId INT NOT NULL,
    ItemType NVARCHAR(20) NOT NULL,
    Description NVARCHAR(255) NOT NULL,
    Quantity INT NOT NULL DEFAULT 1,
    UnitPrice DECIMAL(10, 2) NOT NULL,
    TotalPrice DECIMAL(10, 2) NOT NULL,
    CONSTRAINT FK_InvoiceItems_Invoices FOREIGN KEY (InvoiceId) REFERENCES Invoices(Id) ON DELETE CASCADE,
    CONSTRAINT CK_InvoiceItems_ItemType CHECK (ItemType IN ('room', 'service', 'tax', 'discount', 'other')),
    CONSTRAINT CK_InvoiceItems_Quantity CHECK (Quantity > 0),
    CONSTRAINT CK_InvoiceItems_UnitPrice CHECK (UnitPrice >= 0),
    CONSTRAINT CK_InvoiceItems_TotalPrice CHECK (TotalPrice >= 0)
);
GO

-- Tạo bảng Reviews
CREATE TABLE Reviews (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    BookingId INT NOT NULL,
    Rating INT NOT NULL,
    Comment NVARCHAR(MAX) NULL,
    ReviewDate DATETIME2 NOT NULL DEFAULT GETDATE(),
    CONSTRAINT FK_Reviews_Bookings FOREIGN KEY (BookingId) REFERENCES Bookings(Id) ON DELETE CASCADE,
    CONSTRAINT CK_Reviews_Rating CHECK (Rating BETWEEN 1 AND 5)
);
GO

-- Tạo Stored Procedure cho báo cáo doanh thu theo tháng (Đã sửa để nhận StartDate, EndDate)
CREATE PROCEDURE GetMonthlyRevenueReport -- Changed back to CREATE
    @StartDate DATETIME2,
    @EndDate DATETIME2
AS
BEGIN
    SET NOCOUNT ON;

    -- Logic mới dựa trên StartDate và EndDate
    SELECT
        MONTH(b.CreatedAt) AS Month,
        YEAR(b.CreatedAt) AS Year,
        SUM(b.TotalAmount) AS TotalRevenue
    FROM
        Bookings b
    WHERE
        b.Status NOT IN ('cancelled', 'pending')
        AND b.PaymentStatus IN ('paid', 'partial')
        AND b.CreatedAt >= @StartDate -- Lọc theo ngày bắt đầu
        AND b.CreatedAt <= @EndDate   -- Lọc theo ngày kết thúc
    GROUP BY
        YEAR(b.CreatedAt),
        MONTH(b.CreatedAt)
    ORDER BY
        Year,
        Month;
END;
GO

-- Tạo Stored Procedure cho báo cáo công suất phòng
CREATE PROCEDURE GetOccupancyReport
    @StartDate DATE = NULL,
    @EndDate DATE = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    IF @StartDate IS NULL
        SET @StartDate = DATEADD(DAY, -30, GETDATE());
    
    IF @EndDate IS NULL
        SET @EndDate = GETDATE();
    
    -- Tạo bảng tạm chứa tất cả các ngày trong khoảng
    DECLARE @AllDates TABLE (Date DATE);
    
    DECLARE @CurrentDate DATE = @StartDate;
    WHILE @CurrentDate <= @EndDate
    BEGIN
        INSERT INTO @AllDates (Date) VALUES (@CurrentDate);
        SET @CurrentDate = DATEADD(DAY, 1, @CurrentDate);
    END;
    
    -- Khai báo và tính toán số phòng có sẵn (Thêm dòng này)
    DECLARE @TotalAvailableRooms INT;
    SELECT @TotalAvailableRooms = COUNT(*) FROM Rooms WHERE Status <> 'maintenance';
    
    -- Tính toán công suất phòng theo ngày
    SELECT 
        d.Date,
        COUNT(DISTINCT b.RoomId) AS OccupiedRooms,
        (SELECT COUNT(*) FROM Rooms) AS TotalRooms,
        -- Tính tỷ lệ lấp đầy, tránh chia cho 0
        CASE
            WHEN @TotalAvailableRooms > 0 THEN
                -- Ép kiểu kết quả sang DECIMAL(5, 4) để khớp DTO
                CAST((COUNT(b.Id) * 1.0 / @TotalAvailableRooms) AS DECIMAL(5, 4))
            ELSE 0
        END AS OccupancyRate
    FROM 
        @AllDates d
    LEFT JOIN 
        Bookings b ON d.Date >= CAST(b.CheckInDate AS DATE) 
                   AND d.Date < CAST(b.CheckOutDate AS DATE)
                   AND b.Status IN ('confirmed', 'checked_in', 'checked_out')
    GROUP BY 
        d.Date
    ORDER BY 
        d.Date;
END;
GO

-- Tạo Stored Procedure cho báo cáo doanh thu theo loại phòng
CREATE PROCEDURE GetRevenueByRoomType
    @Year INT = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    IF @Year IS NULL
        SET @Year = YEAR(GETDATE());
    
    SELECT 
        rt.Name AS RoomType,
        COUNT(b.Id) AS BookingsCount,
        SUM(b.TotalAmount) AS Revenue
    FROM 
        Bookings b
    INNER JOIN 
        Rooms r ON b.RoomId = r.Id
    INNER JOIN 
        RoomTypes rt ON r.RoomTypeId = rt.Id
    WHERE 
        YEAR(b.CheckOutDate) = @Year
        AND b.Status = 'checked_out'
    GROUP BY 
        rt.Name
    ORDER BY 
        Revenue DESC;
END;
GO

-- Tạo Stored Procedure cho báo cáo doanh thu theo dịch vụ
CREATE PROCEDURE GetRevenueByService
    @Year INT = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    IF @Year IS NULL
        SET @Year = YEAR(GETDATE());
    
    SELECT 
        s.Name AS ServiceName,
        sc.Name AS CategoryName,
        SUM(bs.Quantity) AS TotalQuantity,
        SUM(bs.Price * bs.Quantity) AS Revenue
    FROM 
        BookingServices bs
    INNER JOIN 
        Services s ON bs.ServiceId = s.Id
    INNER JOIN 
        ServiceCategories sc ON s.CategoryId = sc.Id
    INNER JOIN 
        Bookings b ON bs.BookingId = b.Id
    WHERE 
        YEAR(b.CheckOutDate) = @Year
        AND b.Status = 'checked_out'
    GROUP BY 
        s.Name, sc.Name
    ORDER BY 
        Revenue DESC;
END;
GO

-- Tạo Stored Procedure cho báo cáo khách hàng thân thiết
CREATE PROCEDURE GetTopCustomers
    @Year INT = NULL,
    @Top INT = 10
AS
BEGIN
    SET NOCOUNT ON;
    
    IF @Year IS NULL
        SET @Year = YEAR(GETDATE());
    
    SELECT TOP (@Top)
        c.Id AS CustomerId,
        c.FirstName + ' ' + c.LastName AS CustomerName,
        COUNT(b.Id) AS BookingsCount,
        SUM(b.TotalAmount) AS TotalSpent
    FROM 
        Customers c
    INNER JOIN 
        Bookings b ON c.Id = b.CustomerId
    WHERE 
        YEAR(b.CheckOutDate) = @Year
        AND b.Status = 'checked_out'
    GROUP BY 
        c.Id, c.FirstName, c.LastName
    ORDER BY 
        TotalSpent DESC;
END;
GO

-- Tạo Stored Procedure để kiểm tra phòng có sẵn
CREATE PROCEDURE CheckRoomAvailability
    @CheckInDate DATE,
    @CheckOutDate DATE,
    @RoomTypeId INT = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Lấy danh sách phòng đã được đặt trong khoảng thời gian
    WITH BookedRooms AS (
        SELECT DISTINCT r.Id
        FROM Rooms r
        INNER JOIN Bookings b ON r.Id = b.RoomId
        WHERE 
            b.Status IN ('pending', 'confirmed', 'checked_in')
            AND (
                (@CheckInDate >= b.CheckInDate AND @CheckInDate < b.CheckOutDate)
                OR (@CheckOutDate > b.CheckInDate AND @CheckOutDate <= b.CheckOutDate)
                OR (@CheckInDate <= b.CheckInDate AND @CheckOutDate >= b.CheckOutDate)
            )
    )
    
    -- Lấy danh sách phòng có sẵn
    SELECT 
        r.Id,
        r.RoomNumber,
        rt.Name AS RoomTypeName,
        rt.BasePrice,
        rt.Capacity,
        r.Floor,
        r.Status
    FROM 
        Rooms r
    INNER JOIN 
        RoomTypes rt ON r.RoomTypeId = rt.Id
    WHERE 
        r.Id NOT IN (SELECT Id FROM BookedRooms)
        AND r.Status = 'available'
        AND (@RoomTypeId IS NULL OR r.RoomTypeId = @RoomTypeId)
    ORDER BY 
        rt.BasePrice;
END;
GO

-- Chèn dữ liệu mẫu cho Users
INSERT INTO Users (Name, Email, PasswordHash, PhoneNumber, Role, CreatedAt)
VALUES 
-- Admin users
('Admin User', 'admin@hotel.com', '$2a$12$1InE4/AkF4P4Kf8Zx7yZ8.TLcC6Y.57BmgRJkEP4Ly0/2wNF0N9Hy', '0123456789', 'admin', DATEADD(MONTH, -12, GETUTCDATE())),
('Nguyễn Quản Lý', 'manager@hotel.com', '$2a$12$1InE4/AkF4P4Kf8Zx7yZ8.TLcC6Y.57BmgRJkEP4Ly0/2wNF0N9Hy', '0123456780', 'admin', DATEADD(MONTH, -11, GETUTCDATE())),

-- Employee users
('Employee User', 'employee@hotel.com', '$2a$12$1InE4/AkF4P4Kf8Zx7yZ8.TLcC6Y.57BmgRJkEP4Ly0/2wNF0N9Hy', '0123456788', 'employee', DATEADD(MONTH, -10, GETUTCDATE())),
('Trần Nhân Viên', 'staff1@hotel.com', '$2a$12$1InE4/AkF4P4Kf8Zx7yZ8.TLcC6Y.57BmgRJkEP4Ly0/2wNF0N9Hy', '0123456781', 'employee', DATEADD(MONTH, -9, GETUTCDATE())),
('Lê Thị Lễ Tân', 'receptionist@hotel.com', '$2a$12$1InE4/AkF4P4Kf8Zx7yZ8.TLcC6Y.57BmgRJkEP4Ly0/2wNF0N9Hy', '0123456782', 'employee', DATEADD(MONTH, -8, GETUTCDATE())),
('Phạm Văn Phục Vụ', 'service@hotel.com', '$2a$12$1InE4/AkF4P4Kf8Zx7yZ8.TLcC6Y.57BmgRJkEP4Ly0/2wNF0N9Hy', '0123456783', 'employee', DATEADD(MONTH, -7, GETUTCDATE())),

-- Customer users
('Customer User', 'customer@example.com', '$2a$12$1InE4/AkF4P4Kf8Zx7yZ8.TLcC6Y.57BmgRJkEP4Ly0/2wNF0N9Hy', '0123456787', 'customer', DATEADD(MONTH, -6, GETUTCDATE())),
('John Smith', 'john.smith@example.com', '$2a$12$1InE4/AkF4P4Kf8Zx7yZ8.TLcC6Y.57BmgRJkEP4Ly0/2wNF0N9Hy', '0123456784', 'customer', DATEADD(MONTH, -5, GETUTCDATE())),
('Maria Garcia', 'maria.garcia@example.com', '$2a$12$1InE4/AkF4P4Kf8Zx7yZ8.TLcC6Y.57BmgRJkEP4Ly0/2wNF0N9Hy', '0123456785', 'customer', DATEADD(MONTH, -4, GETUTCDATE())),
('Nguyễn Văn Khách', 'nguyen.khach@example.com', '$2a$12$1InE4/AkF4P4Kf8Zx7yZ8.TLcC6Y.57BmgRJkEP4Ly0/2wNF0N9Hy', '0123456786', 'customer', DATEADD(MONTH, -3, GETUTCDATE())),
('Trần Thị Hàng', 'tran.hang@example.com', '$2a$12$1InE4/AkF4P4Kf8Zx7yZ8.TLcC6Y.57BmgRJkEP4Ly0/2wNF0N9Hy', '0123456790', 'customer', DATEADD(MONTH, -2, GETUTCDATE())),
('David Johnson', 'david.johnson@example.com', '$2a$12$1InE4/AkF4P4Kf8Zx7yZ8.TLcC6Y.57BmgRJkEP4Ly0/2wNF0N9Hy', '0123456791', 'customer', DATEADD(MONTH, -1, GETUTCDATE()));
GO

-- Chèn dữ liệu mẫu cho RoomTypes
INSERT INTO RoomTypes (Name, Description, BasePrice, Capacity)
VALUES 
('Standard', 'Phòng tiêu chuẩn với đầy đủ tiện nghi cơ bản', 500000, 2),
('Deluxe', 'Phòng cao cấp với không gian rộng rãi và view đẹp', 800000, 2),
('Suite', 'Phòng hạng sang với phòng khách riêng biệt', 1200000, 4),
('Family', 'Phòng gia đình rộng rãi phù hợp cho 4-6 người', 1500000, 6),
('Executive', 'Phòng hạng sang với dịch vụ đặc biệt và view panorama', 2000000, 2),
('Presidential', 'Phòng tổng thống với không gian sang trọng và dịch vụ VIP', 5000000, 4),
('Single', 'Phòng đơn nhỏ gọn dành cho 1 người', 350000, 1),
('Twin', 'Phòng với 2 giường đơn', 600000, 2);
GO

-- Chèn dữ liệu mẫu cho Rooms
INSERT INTO Rooms (RoomNumber, RoomTypeId, Status, Floor)
VALUES 
-- Standard Rooms (Floor 1)
('101', 1, 'available', 1),
('102', 1, 'available', 1),
('103', 1, 'maintenance', 1),
('104', 1, 'available', 1),
('105', 1, 'available', 1),
('106', 1, 'available', 1),
('107', 1, 'available', 1),
('108', 1, 'cleaning', 1),
('109', 1, 'available', 1),
('110', 1, 'available', 1),

-- Deluxe Rooms (Floor 2)
('201', 2, 'available', 2),
('202', 2, 'available', 2),
('203', 2, 'available', 2),
('204', 2, 'cleaning', 2),
('205', 2, 'available', 2),
('206', 2, 'available', 2),
('207', 2, 'available', 2),
('208', 2, 'available', 2),
('209', 2, 'maintenance', 2),
('210', 2, 'available', 2),

-- Suite Rooms (Floor 3)
('301', 3, 'available', 3),
('302', 3, 'available', 3),
('303', 3, 'available', 3),
('304', 3, 'available', 3),
('305', 3, 'available', 3),
('306', 3, 'maintenance', 3),

-- Family Rooms (Floor 4)
('401', 4, 'available', 4),
('402', 4, 'available', 4),
('403', 4, 'available', 4),
('404', 4, 'available', 4),

-- Executive Rooms (Floor 5)
('501', 5, 'available', 5),
('502', 5, 'available', 5),
('503', 5, 'available', 5),
('504', 5, 'available', 5),

-- Presidential Suites (Floor 6)
('601', 6, 'available', 6),
('602', 6, 'available', 6),

-- Single Rooms (Floor 7)
('701', 7, 'available', 7),
('702', 7, 'available', 7),
('703', 7, 'available', 7),
('704', 7, 'available', 7),
('705', 7, 'available', 7),

-- Twin Rooms (Floor 8)
('801', 8, 'available', 8),
('802', 8, 'available', 8),
('803', 8, 'available', 8),
('804', 8, 'available', 8),
('805', 8, 'available', 8);
GO

-- Chèn dữ liệu mẫu cho RoomFeatures
INSERT INTO RoomFeatures (RoomTypeId, FeatureType, Name, Value, IsPrimary)
VALUES 
-- Standard Room Features
(1, 'amenity', 'WiFi', 'Free', 0),
(1, 'amenity', 'TV', '32 inch', 0),
(1, 'amenity', 'Air Conditioner', 'Yes', 0),
(1, 'amenity', 'Mini Fridge', 'Yes', 0),
(1, 'specification', 'Area', '25 m²', 0),
(1, 'specification', 'Bed', 'Queen Size', 0),
(1, 'image', 'RoomImage', '/images/rooms/standard1.jpg', 1),
(1, 'image', 'RoomImage', '/images/rooms/standard2.jpg', 0),
(1, 'image', 'RoomImage', '/images/rooms/standard3.jpg', 0),

-- Deluxe Room Features
(2, 'amenity', 'WiFi', 'Free', 0),
(2, 'amenity', 'TV', '42 inch', 0),
(2, 'amenity', 'Mini Bar', 'Yes', 0),
(2, 'amenity', 'Air Conditioner', 'Yes', 0),
(2, 'amenity', 'Safe', 'Yes', 0),
(2, 'amenity', 'Coffee Maker', 'Yes', 0),
(2, 'specification', 'Area', '35 m²', 0),
(2, 'specification', 'Bed', 'King Size', 0),
(2, 'specification', 'View', 'City View', 0),
(2, 'image', 'RoomImage', '/images/rooms/deluxe1.jpg', 1),
(2, 'image', 'RoomImage', '/images/rooms/deluxe2.jpg', 0),
(2, 'image', 'RoomImage', '/images/rooms/deluxe3.jpg', 0),

-- Suite Room Features
(3, 'amenity', 'WiFi', 'Free', 0),
(3, 'amenity', 'TV', '50 inch', 0),
(3, 'amenity', 'Mini Bar', 'Yes', 0),
(3, 'amenity', 'Jacuzzi', 'Yes', 0),
(3, 'amenity', 'Air Conditioner', 'Yes', 0),
(3, 'amenity', 'Safe', 'Yes', 0),
(3, 'amenity', 'Coffee Maker', 'Yes', 0),
(3, 'amenity', 'Bathrobe', 'Yes', 0),
(3, 'specification', 'Area', '60 m²', 0),
(3, 'specification', 'Bed', 'King Size', 0),
(3, 'specification', 'View', 'Ocean View', 0),
(3, 'specification', 'Living Room', 'Separate', 0),
(3, 'image', 'RoomImage', '/images/rooms/suite1.jpg', 1),
(3, 'image', 'RoomImage', '/images/rooms/suite2.jpg', 0),
(3, 'image', 'RoomImage', '/images/rooms/suite3.jpg', 0),
(3, 'image', 'RoomImage', '/images/rooms/suite4.jpg', 0),

-- Family Room Features
(4, 'amenity', 'WiFi', 'Free', 0),
(4, 'amenity', 'TV', '50 inch', 0),
(4, 'amenity', 'Kitchen', 'Yes', 0),
(4, 'amenity', 'Air Conditioner', 'Yes', 0),
(4, 'amenity', 'Refrigerator', 'Yes', 0),
(4, 'amenity', 'Microwave', 'Yes', 0),
(4, 'amenity', 'Dining Area', 'Yes', 0),
(4, 'specification', 'Area', '80 m²', 0),
(4, 'specification', 'Beds', '1 King + 2 Singles', 0),
(4, 'specification', 'Bathrooms', '2', 0),
(4, 'image', 'RoomImage', '/images/rooms/family1.jpg', 1),
(4, 'image', 'RoomImage', '/images/rooms/family2.jpg', 0),
(4, 'image', 'RoomImage', '/images/rooms/family3.jpg', 0),

-- Executive Room Features
(5, 'amenity', 'WiFi', 'Free Premium', 0),
(5, 'amenity', 'TV', '55 inch OLED', 0),
(5, 'amenity', 'Mini Bar', 'Complimentary', 0),
(5, 'amenity', 'Air Conditioner', 'Smart Control', 0),
(5, 'amenity', 'Safe', 'Digital', 0),
(5, 'amenity', 'Coffee Machine', 'Nespresso', 0),
(5, 'amenity', 'Executive Lounge Access', 'Yes', 0),
(5, 'amenity', 'Bathrobe & Slippers', 'Premium', 0),
(5, 'specification', 'Area', '45 m²', 0),
(5, 'specification', 'Bed', 'Super King Size', 0),
(5, 'specification', 'View', 'Panoramic City View', 0),
(5, 'image', 'RoomImage', '/images/rooms/executive1.jpg', 1),
(5, 'image', 'RoomImage', '/images/rooms/executive2.jpg', 0),
(5, 'image', 'RoomImage', '/images/rooms/executive3.jpg', 0),

-- Presidential Suite Features
(6, 'amenity', 'WiFi', 'Free Ultra Premium', 0),
(6, 'amenity', 'TV', '65 inch OLED', 0),
(6, 'amenity', 'Private Bar', 'Fully Stocked', 0),
(6, 'amenity', 'Climate Control', 'Multi-zone', 0),
(6, 'amenity', 'Safe', 'Biometric', 0),
(6, 'amenity', 'Kitchen', 'Full', 0),
(6, 'amenity', 'Dining Room', 'For 8 People', 0),
(6, 'amenity', 'Butler Service', '24/7', 0),
(6, 'amenity', 'Private Terrace', 'Yes', 0),
(6, 'specification', 'Area', '120 m²', 0),
(6, 'specification', 'Bed', 'Emperor Size', 0),
(6, 'specification', 'View', '360° Panoramic View', 0),
(6, 'specification', 'Bathrooms', '2 Marble', 0),
(6, 'image', 'RoomImage', '/images/rooms/presidential1.jpg', 1),
(6, 'image', 'RoomImage', '/images/rooms/presidential2.jpg', 0),
(6, 'image', 'RoomImage', '/images/rooms/presidential3.jpg', 0),
(6, 'image', 'RoomImage', '/images/rooms/presidential4.jpg', 0),
(6, 'image', 'RoomImage', '/images/rooms/presidential5.jpg', 0),

-- Single Room Features
(7, 'amenity', 'WiFi', 'Free', 0),
(7, 'amenity', 'TV', '24 inch', 0),
(7, 'amenity', 'Air Conditioner', 'Yes', 0),
(7, 'specification', 'Area', '18 m²', 0),
(7, 'specification', 'Bed', 'Single', 0),
(7, 'image', 'RoomImage', '/images/rooms/single1.jpg', 1),
(7, 'image', 'RoomImage', '/images/rooms/single2.jpg', 0),

-- Twin Room Features
(8, 'amenity', 'WiFi', 'Free', 0),
(8, 'amenity', 'TV', '32 inch', 0),
(8, 'amenity', 'Air Conditioner', 'Yes', 0),
(8, 'amenity', 'Mini Fridge', 'Yes', 0),
(8, 'specification', 'Area', '28 m²', 0),
(8, 'specification', 'Beds', '2 Singles', 0),
(8, 'image', 'RoomImage', '/images/rooms/twin1.jpg', 1),
(8, 'image', 'RoomImage', '/images/rooms/twin2.jpg', 0);
GO

-- Chèn dữ liệu mẫu cho Customers
INSERT INTO Customers (FirstName, LastName, Email, PhoneNumber, IdNumber, Nationality, UserId)
VALUES 
-- Customers with user accounts
('Nguyễn', 'Văn A', 'customer@example.com', '0987654321', '123456789', 'Việt Nam', 7),
('John', 'Smith', 'john.smith@example.com', '0987654322', 'AB123456', 'USA', 8),
('Maria', 'Garcia', 'maria.garcia@example.com', '0987654323', 'CD789012', 'Spain', 9),
('Nguyễn', 'Văn Khách', 'nguyen.khach@example.com', '0987654324', '123456790', 'Việt Nam', 10),
('Trần', 'Thị Hàng', 'tran.hang@example.com', '0987654325', '123456791', 'Việt Nam', 11),
('David', 'Johnson', 'david.johnson@example.com', '0987654326', 'EF345678', 'UK', 12),

-- Customers without user accounts
('Lê', 'Văn B', 'levb@example.com', '0987654327', '123456792', 'Việt Nam', NULL),
('Phạm', 'Thị C', 'phamtc@example.com', '0987654328', '123456793', 'Việt Nam', NULL),
('Robert', 'Williams', 'robert.williams@example.com', '0987654329', 'GH901234', 'Australia', NULL),
('Emma', 'Brown', 'emma.brown@example.com', '0987654330', 'IJ567890', 'Canada', NULL),
('Trần', 'Văn D', 'tranvd@example.com', '0987654331', '123456794', 'Việt Nam', NULL),
('Nguyễn', 'Thị E', 'nguyente@example.com', '0987654332', '123456795', 'Việt Nam', NULL),
('Michael', 'Davis', 'michael.davis@example.com', '0987654333', 'KL123456', 'USA', NULL),
('Sophie', 'Wilson', 'sophie.wilson@example.com', '0987654334', 'MN789012', 'UK', NULL),
('Hoàng', 'Văn F', 'hoangvf@example.com', '0987654335', '123456796', 'Việt Nam', NULL),
('Vũ', 'Thị G', 'vutg@example.com', '0987654336', '123456797', 'Việt Nam', NULL),
('Carlos', 'Rodriguez', 'carlos.rodriguez@example.com', '0987654337', 'OP345678', 'Mexico', NULL),
('Yuki', 'Tanaka', 'yuki.tanaka@example.com', '0987654338', 'QR901234', 'Japan', NULL),
('Đỗ', 'Văn H', 'dovh@example.com', '0987654339', '123456798', 'Việt Nam', NULL),
('Lý', 'Thị I', 'lyti@example.com', '0987654340', '123456799', 'Việt Nam', NULL);
GO

-- Chèn dữ liệu mẫu cho CustomerAddresses
INSERT INTO CustomerAddresses (CustomerId, AddressType, Address, City, State, PostalCode, Country, IsDefault)
VALUES 
-- Addresses for customers with user accounts
(1, 'home', '123 Nguyễn Huệ', 'Hồ Chí Minh', NULL, '70000', 'Việt Nam', 1),
(1, 'work', '456 Lê Lợi', 'Hồ Chí Minh', NULL, '70000', 'Việt Nam', 0),
(2, 'home', '789 Main St', 'New York', 'NY', '10001', 'USA', 1),
(3, 'home', '123 Calle Mayor', 'Madrid', NULL, '28001', 'Spain', 1),
(4, 'home', '456 Trần Hưng Đạo', 'Hà Nội', NULL, '10000', 'Việt Nam', 1),
(5, 'home', '789 Lê Duẩn', 'Đà Nẵng', NULL, '50000', 'Việt Nam', 1),
(6, 'home', '10 Oxford St', 'London', NULL, 'W1D 1BS', 'UK', 1),

-- Addresses for customers without user accounts
(7, 'home', '123 Nguyễn Trãi', 'Hồ Chí Minh', NULL, '70000', 'Việt Nam', 1),
(8, 'home', '456 Lê Thánh Tôn', 'Hồ Chí Minh', NULL, '70000', 'Việt Nam', 1),
(9, 'home', '789 George St', 'Sydney', 'NSW', '2000', 'Australia', 1),
(10, 'home', '123 Yonge St', 'Toronto', 'ON', 'M5B 2H1', 'Canada', 1),
(11, 'home', '456 Lý Thường Kiệt', 'Hà Nội', NULL, '10000', 'Việt Nam', 1),
(12, 'home', '789 Phan Đình Phùng', 'Hồ Chí Minh', NULL, '70000', 'Việt Nam', 1),
(13, 'home', '123 Broadway', 'New York', 'NY', '10007', 'USA', 1),
(14, 'home', '456 Baker St', 'London', NULL, 'NW1 6XE', 'UK', 1),
(15, 'home', '789 Nguyễn Đình Chiểu', 'Hồ Chí Minh', NULL, '70000', 'Việt Nam', 1),
(16, 'home', '123 Lê Văn Sỹ', 'Hồ Chí Minh', NULL, '70000', 'Việt Nam', 1),
(17, 'home', '456 Paseo de la Reforma', 'Mexico City', NULL, '06500', 'Mexico', 1),
(18, 'home', '789 Ginza', 'Tokyo', NULL, '104-0061', 'Japan', 1),
(19, 'home', '123 Trần Phú', 'Hà Nội', NULL, '10000', 'Việt Nam', 1),
(20, 'home', '456 Nguyễn Công Trứ', 'Hồ Chí Minh', NULL, '70000', 'Việt Nam', 1);
GO

-- Chèn dữ liệu mẫu cho ServiceCategories
INSERT INTO ServiceCategories (Name, Description)
VALUES 
('Ăn uống', 'Các dịch vụ ăn uống trong khách sạn'),
('Giải trí', 'Các dịch vụ giải trí và thư giãn'),
('Vận chuyển', 'Dịch vụ đưa đón và vận chuyển'),
('Làm đẹp', 'Dịch vụ spa, massage và làm đẹp'),
('Hội nghị', 'Dịch vụ phòng họp và hội nghị'),
('Khác', 'Các dịch vụ khác');
GO

-- Chèn dữ liệu mẫu cho Services
INSERT INTO Services (Name, CategoryId, Description, Price, IsAvailable, ImageUrl)
VALUES 
-- Dịch vụ ăn uống
('Bữa sáng', 1, 'Bữa sáng buffet tại nhà hàng', 150000, 1, '/images/services/breakfast.jpg'),
('Bữa trưa', 1, 'Bữa trưa tại nhà hàng', 200000, 1, '/images/services/lunch.jpg'),
('Bữa tối', 1, 'Bữa tối tại nhà hàng', 250000, 1, '/images/services/dinner.jpg'),
('Dịch vụ phòng', 1, 'Đồ ăn và đồ uống được phục vụ tại phòng', 50000, 1, '/images/services/room_service.jpg'),
('Minibar', 1, 'Đồ uống và snack trong minibar', 100000, 1, '/images/services/minibar.jpg'),
('Tiệc riêng', 1, 'Tổ chức tiệc riêng tại nhà hàng', 5000000, 1, '/images/services/private_party.jpg'),
('Đặt bánh', 1, 'Đặt bánh sinh nhật hoặc kỷ niệm', 350000, 1, '/images/services/cake.jpg'),

-- Dịch vụ giải trí
('Spa', 2, 'Dịch vụ massage và spa', 500000, 1, '/images/services/spa.jpg'),
('Hồ bơi', 2, 'Sử dụng hồ bơi', 100000, 1, '/images/services/pool.jpg'),
('Phòng gym', 2, 'Sử dụng phòng tập gym', 100000, 1, '/images/services/gym.jpg'),
('Sân tennis', 2, 'Thuê sân tennis', 200000, 1, '/images/services/tennis.jpg'),
('Karaoke', 2, 'Phòng karaoke', 300000, 1, '/images/services/karaoke.jpg'),
('Trò chơi', 2, 'Khu vực trò chơi', 150000, 1, '/images/services/games.jpg'),
('Yoga', 2, 'Lớp học yoga', 200000, 1, '/images/services/yoga.jpg'),

-- Dịch vụ vận chuyển
('Đưa đón sân bay', 3, 'Dịch vụ đưa đón sân bay', 300000, 1, '/images/services/airport_shuttle.jpg'),
('Thuê xe', 3, 'Dịch vụ thuê xe', 500000, 1, '/images/services/car_rental.jpg'),
('Đặt vé máy bay', 3, 'Dịch vụ đặt vé máy bay', 100000, 1, '/images/services/flight_booking.jpg'),
('Tour du lịch', 3, 'Tổ chức tour du lịch', 1000000, 1, '/images/services/tour.jpg'),
('Xe đạp', 3, 'Thuê xe đạp', 100000, 1, '/images/services/bicycle.jpg'),

-- Dịch vụ làm đẹp
('Massage', 4, 'Dịch vụ massage toàn thân', 400000, 1, '/images/services/massage.jpg'),
('Facial', 4, 'Dịch vụ chăm sóc da mặt', 350000, 1, '/images/services/facial.jpg'),
('Làm tóc', 4, 'Dịch vụ làm tóc', 300000, 1, '/images/services/hair.jpg'),
('Làm móng', 4, 'Dịch vụ làm móng', 200000, 1, '/images/services/nails.jpg'),
('Tắm trắng', 4, 'Dịch vụ tắm trắng', 500000, 1, '/images/services/whitening.jpg'),

-- Dịch vụ hội nghị
('Phòng họp nhỏ', 5, 'Phòng họp cho 10 người', 1000000, 1, '/images/services/small_meeting.jpg'),
('Phòng họp vừa', 5, 'Phòng họp cho 20 người', 2000000, 1, '/images/services/medium_meeting.jpg'),
('Phòng họp lớn', 5, 'Phòng họp cho 50 người', 5000000, 1, '/images/services/large_meeting.jpg'),
('Hội trường', 5, 'Hội trường cho 100 người', 10000000, 1, '/images/services/conference_hall.jpg'),
('Thiết bị hội nghị', 5, 'Thuê thiết bị hội nghị', 500000, 1, '/images/services/conference_equipment.jpg'),

-- Dịch vụ khác
('Giặt ủi', 6, 'Dịch vụ giặt ủi quần áo', 100000, 1, '/images/services/laundry.jpg'),
('Hướng dẫn viên', 6, 'Dịch vụ hướng dẫn viên du lịch', 1000000, 1, '/images/services/tour_guide.jpg'),
('Giữ trẻ', 6, 'Dịch vụ giữ trẻ', 200000, 1, '/images/services/babysitting.jpg'),
('Bác sĩ', 6, 'Dịch vụ bác sĩ tại chỗ', 500000, 1, '/images/services/doctor.jpg'),
('Đổi tiền', 6, 'Dịch vụ đổi tiền', 0, 1, '/images/services/currency_exchange.jpg'),
('Thuê laptop', 6, 'Dịch vụ thuê laptop', 200000, 1, '/images/services/laptop_rental.jpg');
GO

-- Chèn dữ liệu mẫu cho Bookings
-- Lấy ngày hiện tại để tạo dữ liệu tương đối
DECLARE @Today DATE = GETDATE();
DECLARE @LastYear DATE = DATEADD(YEAR, -1, @Today);
DECLARE @LastMonth DATE = DATEADD(MONTH, -1, @Today);
DECLARE @NextMonth DATE = DATEADD(MONTH, 1, @Today);
DECLARE @NextYear DATE = DATEADD(YEAR, 1, @Today);

INSERT INTO Bookings (CustomerId, RoomId, CheckInDate, CheckOutDate, Adults, Children, TotalAmount, Status, PaymentStatus, CreatedAt)
VALUES 
-- Bookings from last year (completed)
(1, 1, DATEADD(DAY, 10, @LastYear), DATEADD(DAY, 13, @LastYear), 2, 0, 1500000, 'checked_out', 'paid', DATEADD(DAY, 5, @LastYear)),
(2, 6, DATEADD(DAY, 15, @LastYear), DATEADD(DAY, 20, @LastYear), 2, 1, 4000000, 'checked_out', 'paid', DATEADD(DAY, 10, @LastYear)),
(3, 11, DATEADD(DAY, 20, @LastYear), DATEADD(DAY, 25, @LastYear), 2, 0, 6000000, 'checked_out', 'paid', DATEADD(DAY, 15, @LastYear)),
(4, 16, DATEADD(DAY, 25, @LastYear), DATEADD(DAY, 30, @LastYear), 4, 2, 7500000, 'checked_out', 'paid', DATEADD(DAY, 20, @LastYear)),
(5, 21, DATEADD(DAY, 30, @LastYear), DATEADD(DAY, 35, @LastYear), 2, 0, 10000000, 'checked_out', 'paid', DATEADD(DAY, 25, @LastYear)),

-- Bookings from last month (completed)
(6, 2, DATEADD(DAY, 5, @LastMonth), DATEADD(DAY, 8, @LastMonth), 1, 0, 1500000, 'checked_out', 'paid', DATEADD(DAY, 1, @LastMonth)),
(7, 7, DATEADD(DAY, 10, @LastMonth), DATEADD(DAY, 15, @LastMonth), 2, 0, 4000000, 'checked_out', 'paid', DATEADD(DAY, 5, @LastMonth)),
(8, 12, DATEADD(DAY, 15, @LastMonth), DATEADD(DAY, 18, @LastMonth), 2, 1, 3600000, 'checked_out', 'paid', DATEADD(DAY, 10, @LastMonth)),
(9, 17, DATEADD(DAY, 20, @LastMonth), DATEADD(DAY, 25, @LastMonth), 4, 0, 7500000, 'checked_out', 'paid', DATEADD(DAY, 15, @LastMonth)),
(10, 22, DATEADD(DAY, 25, @LastMonth), DATEADD(DAY, 28, @LastMonth), 2, 0, 6000000, 'checked_out', 'paid', DATEADD(DAY, 20, @LastMonth)),

-- Current active bookings (checked in)
(11, 3, DATEADD(DAY, -3, @Today), DATEADD(DAY, 2, @Today), 2, 0, 1500000, 'checked_in', 'paid', DATEADD(DAY, -10, @Today)),
(12, 8, DATEADD(DAY, -2, @Today), DATEADD(DAY, 3, @Today), 2, 0, 4000000, 'checked_in', 'paid', DATEADD(DAY, -7, @Today)),
(13, 13, DATEADD(DAY, -1, @Today), DATEADD(DAY, 4, @Today), 2, 2, 6000000, 'checked_in', 'paid', DATEADD(DAY, -5, @Today)),

-- Upcoming bookings (confirmed)
(14, 4, DATEADD(DAY, 5, @Today), DATEADD(DAY, 10, @Today), 2, 0, 2500000, 'confirmed', 'paid', DATEADD(DAY, -15, @Today)),
(15, 9, DATEADD(DAY, 7, @Today), DATEADD(DAY, 12, @Today), 2, 1, 4000000, 'confirmed', 'partial', DATEADD(DAY, -10, @Today)),
(16, 14, DATEADD(DAY, 10, @Today), DATEADD(DAY, 15, @Today), 4, 2, 7500000, 'confirmed', 'pending', DATEADD(DAY, -5, @Today)),
(17, 18, DATEADD(DAY, 15, @Today), DATEADD(DAY, 20, @Today), 2, 0, 10000000, 'confirmed', 'pending', DATEADD(DAY, -3, @Today)),

-- Pending bookings
(18, 5, DATEADD(DAY, 20, @Today), DATEADD(DAY, 25, @Today), 1, 0, 2500000, 'pending', 'pending', DATEADD(DAY, -2, @Today)),
(19, 10, DATEADD(DAY, 25, @Today), DATEADD(DAY, 30, @Today), 2, 0, 4000000, 'pending', 'pending', DATEADD(DAY, -1, @Today)),
(20, 15, DATEADD(DAY, 30, @Today), DATEADD(DAY, 35, @Today), 2, 2, 7500000, 'pending', 'pending', @Today),

-- Future bookings (next month)
(1, 19, DATEADD(DAY, 5, @NextMonth), DATEADD(DAY, 10, @NextMonth), 2, 0, 10000000, 'confirmed', 'paid', DATEADD(DAY, -20, @Today)),
(2, 20, DATEADD(DAY, 15, @NextMonth), DATEADD(DAY, 20, @NextMonth), 2, 1, 10000000, 'confirmed', 'paid', DATEADD(DAY, -15, @Today)),

-- Cancelled bookings
(3, 23, DATEADD(DAY, -10, @Today), DATEADD(DAY, -5, @Today), 2, 0, 1050000, 'cancelled', 'refunded', DATEADD(DAY, -20, @Today)),
(4, 24, DATEADD(DAY, -5, @Today), DATEADD(DAY, 0, @Today), 1, 0, 1050000, 'cancelled', 'refunded', DATEADD(DAY, -15, @Today)),
(5, 25, DATEADD(DAY, 10, @NextMonth), DATEADD(DAY, 15, @NextMonth), 2, 0, 2000000, 'cancelled', 'refunded', DATEADD(DAY, -10, @Today));
GO

-- Chèn dữ liệu mẫu cho BookingHistory
-- Lấy ngày hiện tại để tạo dữ liệu tương đối
DECLARE @Today DATE = GETDATE();
DECLARE @LastYear DATE = DATEADD(YEAR, -1, @Today);
DECLARE @LastMonth DATE = DATEADD(MONTH, -1, @Today);

INSERT INTO BookingHistory (BookingId, Status, PaymentStatus, ChangedAt, ChangedBy, Notes)
VALUES 
-- Booking 1 history (completed last year)
(1, 'pending', 'pending', DATEADD(DAY, 5, @LastYear), 1, 'Đặt phòng ban đầu'),
(1, 'confirmed', 'pending', DATEADD(DAY, 6, @LastYear), 2, 'Xác nhận đặt phòng'),
(1, 'checked_in', 'pending', DATEADD(DAY, 10, @LastYear), 3, 'Khách đã check-in'),
(1, 'checked_out', 'paid', DATEADD(DAY, 13, @LastYear), 3, 'Khách đã check-out và thanh toán'),

-- Booking 2 history (completed last year)
(2, 'pending', 'pending', DATEADD(DAY, 10, @LastYear), 1, 'Đặt phòng ban đầu'),
(2, 'confirmed', 'partial', DATEADD(DAY, 11, @LastYear), 2, 'Xác nhận đặt phòng và thanh toán một phần'),
(2, 'checked_in', 'partial', DATEADD(DAY, 15, @LastYear), 4, 'Khách đã check-in'),
(2, 'checked_out', 'paid', DATEADD(DAY, 20, @LastYear), 4, 'Khách đã check-out và thanh toán đầy đủ'),

-- Booking 3 history (completed last year)
(3, 'pending', 'pending', DATEADD(DAY, 15, @LastYear), 1, 'Đặt phòng ban đầu'),
(3, 'confirmed', 'paid', DATEADD(DAY, 16, @LastYear), 2, 'Xác nhận đặt phòng và thanh toán trước'),
(3, 'checked_in', 'paid', DATEADD(DAY, 20, @LastYear), 3, 'Khách đã check-in'),
(3, 'checked_out', 'paid', DATEADD(DAY, 25, @LastYear), 3, 'Khách đã check-out'),

-- Booking 4 history (completed last year)
(4, 'pending', 'pending', DATEADD(DAY, 20, @LastYear), 1, 'Đặt phòng ban đầu'),
(4, 'confirmed', 'pending', DATEADD(DAY, 21, @LastYear), 2, 'Xác nhận đặt phòng'),
(4, 'checked_in', 'partial', DATEADD(DAY, 25, @LastYear), 4, 'Khách đã check-in và thanh toán một phần'),
(4, 'checked_out', 'paid', DATEADD(DAY, 30, @LastYear), 4, 'Khách đã check-out và thanh toán đầy đủ'),

-- Booking 5 history (completed last year)
(5, 'pending', 'pending', DATEADD(DAY, 25, @LastYear), 1, 'Đặt phòng ban đầu'),
(5, 'confirmed', 'paid', DATEADD(DAY, 26, @LastYear), 2, 'Xác nhận đặt phòng và thanh toán trước'),
(5, 'checked_in', 'paid', DATEADD(DAY, 30, @LastYear), 3, 'Khách đã check-in'),
(5, 'checked_out', 'paid', DATEADD(DAY, 35, @LastYear), 3, 'Khách đã check-out'),

-- Booking 6 history (completed last month)
(6, 'pending', 'pending', DATEADD(DAY, 1, @LastMonth), 1, 'Đặt phòng ban đầu'),
(6, 'confirmed', 'pending', DATEADD(DAY, 2, @LastMonth), 2, 'Xác nhận đặt phòng'),
(6, 'checked_in', 'pending', DATEADD(DAY, 5, @LastMonth), 3, 'Khách đã check-in'),
(6, 'checked_out', 'paid', DATEADD(DAY, 8, @LastMonth), 3, 'Khách đã check-out và thanh toán'),

-- Booking 7 history (completed last month)
(7, 'pending', 'pending', DATEADD(DAY, 5, @LastMonth), 1, 'Đặt phòng ban đầu'),
(7, 'confirmed', 'partial', DATEADD(DAY, 6, @LastMonth), 2, 'Xác nhận đặt phòng và thanh toán một phần'),
(7, 'checked_in', 'partial', DATEADD(DAY, 10, @LastMonth), 4, 'Khách đã check-in'),
(7, 'checked_out', 'paid', DATEADD(DAY, 15, @LastMonth), 4, 'Khách đã check-out và thanh toán đầy đủ'),

-- Booking 8 history (completed last month)
(8, 'pending', 'pending', DATEADD(DAY, 10, @LastMonth), 1, 'Đặt phòng ban đầu'),
(8, 'confirmed', 'paid', DATEADD(DAY, 11, @LastMonth), 2, 'Xác nhận đặt phòng và thanh toán trước'),
(8, 'checked_in', 'paid', DATEADD(DAY, 15, @LastMonth), 3, 'Khách đã check-in'),
(8, 'checked_out', 'paid', DATEADD(DAY, 18, @LastMonth), 3, 'Khách đã check-out'),

-- Booking 9 history (completed last month)
(9, 'pending', 'pending', DATEADD(DAY, 15, @LastMonth), 1, 'Đặt phòng ban đầu'),
(9, 'confirmed', 'pending', DATEADD(DAY, 16, @LastMonth), 2, 'Xác nhận đặt phòng'),
(9, 'checked_in', 'partial', DATEADD(DAY, 20, @LastMonth), 4, 'Khách đã check-in và thanh toán một phần'),
(9, 'checked_out', 'paid', DATEADD(DAY, 25, @LastMonth), 4, 'Khách đã check-out và thanh toán đầy đủ'),

-- Booking 10 history (completed last month)
(10, 'pending', 'pending', DATEADD(DAY, 20, @LastMonth), 1, 'Đặt phòng ban đầu'),
(10, 'confirmed', 'paid', DATEADD(DAY, 21, @LastMonth), 2, 'Xác nhận đặt phòng và thanh toán trước'),
(10, 'checked_in', 'paid', DATEADD(DAY, 25, @LastMonth), 3, 'Khách đã check-in'),
(10, 'checked_out', 'paid', DATEADD(DAY, 28, @LastMonth), 3, 'Khách đã check-out'),

-- Booking 11 history (current active - checked in)
(11, 'pending', 'pending', DATEADD(DAY, -10, @Today), 1, 'Đặt phòng ban đầu'),
(11, 'confirmed', 'paid', DATEADD(DAY, -9, @Today), 2, 'Xác nhận đặt phòng và thanh toán trước'),
(11, 'checked_in', 'paid', DATEADD(DAY, -3, @Today), 3, 'Khách đã check-in'),

-- Booking 12 history (current active - checked in)
(12, 'pending', 'pending', DATEADD(DAY, -7, @Today), 1, 'Đặt phòng ban đầu'),
(12, 'confirmed', 'partial', DATEADD(DAY, -6, @Today), 2, 'Xác nhận đặt phòng và thanh toán một phần'),
(12, 'checked_in', 'paid', DATEADD(DAY, -2, @Today), 4, 'Khách đã check-in và thanh toán đầy đủ'),

-- Booking 13 history (current active - checked in)
(13, 'pending', 'pending', DATEADD(DAY, -5, @Today), 1, 'Đặt phòng ban đầu'),
(13, 'confirmed', 'pending', DATEADD(DAY, -4, @Today), 2, 'Xác nhận đặt phòng'),
(13, 'checked_in', 'paid', DATEADD(DAY, -1, @Today), 3, 'Khách đã check-in và thanh toán'),

-- Booking 14 history (upcoming - confirmed)
(14, 'pending', 'pending', DATEADD(DAY, -15, @Today), 1, 'Đặt phòng ban đầu'),
(14, 'confirmed', 'paid', DATEADD(DAY, -14, @Today), 2, 'Xác nhận đặt phòng và thanh toán trước'),

-- Booking 15 history (upcoming - confirmed)
(15, 'pending', 'pending', DATEADD(DAY, -10, @Today), 1, 'Đặt phòng ban đầu'),
(15, 'confirmed', 'partial', DATEADD(DAY, -9, @Today), 2, 'Xác nhận đặt phòng và thanh toán một phần'),

-- Booking 16 history (upcoming - confirmed)
(16, 'pending', 'pending', DATEADD(DAY, -5, @Today), 1, 'Đặt phòng ban đầu'),
(16, 'confirmed', 'pending', DATEADD(DAY, -4, @Today), 2, 'Xác nhận đặt phòng'),

-- Booking 17 history (upcoming - confirmed)
(17, 'pending', 'pending', DATEADD(DAY, -3, @Today), 1, 'Đặt phòng ban đầu'),
(17, 'confirmed', 'pending', DATEADD(DAY, -2, @Today), 2, 'Xác nhận đặt phòng'),

-- Booking 18 history (pending)
(18, 'pending', 'pending', DATEADD(DAY, -2, @Today), 1, 'Đặt phòng ban đầu'),

-- Booking 19 history (pending)
(19, 'pending', 'pending', DATEADD(DAY, -1, @Today), 1, 'Đặt phòng ban đầu'),

-- Booking 20 history (pending)
(20, 'pending', 'pending', @Today, 1, 'Đặt phòng ban đầu'),

-- Booking 21 history (future - confirmed)
(21, 'pending', 'pending', DATEADD(DAY, -20, @Today), 1, 'Đặt phòng ban đầu'),
(21, 'confirmed', 'paid', DATEADD(DAY, -19, @Today), 2, 'Xác nhận đặt phòng và thanh toán trước'),

-- Booking 22 history (future - confirmed)
(22, 'pending', 'pending', DATEADD(DAY, -15, @Today), 1, 'Đặt phòng ban đầu'),
(22, 'confirmed', 'paid', DATEADD(DAY, -14, @Today), 2, 'Xác nhận đặt phòng và thanh toán trước'),

-- Booking 23 history (cancelled)
(23, 'pending', 'pending', DATEADD(DAY, -20, @Today), 1, 'Đặt phòng ban đầu'),
(23, 'confirmed', 'paid', DATEADD(DAY, -19, @Today), 2, 'Xác nhận đặt phòng và thanh toán trước'),
(23, 'cancelled', 'refunded', DATEADD(DAY, -15, @Today), 3, 'Hủy đặt phòng và hoàn tiền'),

-- Booking 24 history (cancelled)
(24, 'pending', 'pending', DATEADD(DAY, -15, @Today), 1, 'Đặt phòng ban đầu'),
(24, 'confirmed', 'paid', DATEADD(DAY, -14, @Today), 2, 'Xác nhận đặt phòng và thanh toán trước'),
(24, 'cancelled', 'refunded', DATEADD(DAY, -10, @Today), 3, 'Hủy đặt phòng và hoàn tiền'),

-- Booking 25 history (cancelled)
(25, 'pending', 'pending', DATEADD(DAY, -10, @Today), 1, 'Đặt phòng ban đầu'),
(25, 'confirmed', 'paid', DATEADD(DAY, -9, @Today), 2, 'Xác nhận đặt phòng và thanh toán trước'),
(25, 'cancelled', 'refunded', DATEADD(DAY, -5, @Today), 3, 'Hủy đặt phòng và hoàn tiền');
GO

-- Chèn dữ liệu mẫu cho BookingServices
-- Lấy ngày hiện tại để tạo dữ liệu tương đối
DECLARE @Today DATE = GETDATE();
DECLARE @LastYear DATE = DATEADD(YEAR, -1, @Today);
DECLARE @LastMonth DATE = DATEADD(MONTH, -1, @Today);

INSERT INTO BookingServices (BookingId, ServiceId, Quantity, Price, ServiceDate)
VALUES 
-- Booking 1 services (completed last year)
(1, 1, 4, 150000, DATEADD(DAY, 11, @LastYear)), -- Bữa sáng
(1, 8, 1, 500000, DATEADD(DAY, 12, @LastYear)), -- Spa

-- Booking 2 services (completed last year)
(2, 1, 10, 150000, DATEADD(DAY, 16, @LastYear)), -- Bữa sáng
(2, 3, 2, 250000, DATEADD(DAY, 17, @LastYear)), -- Bữa tối
(2, 9, 2, 100000, DATEADD(DAY, 18, @LastYear)), -- Hồ bơi
(2, 31, 1, 100000, DATEADD(DAY, 19, @LastYear)), -- Giặt ủi

-- Booking 3 services (completed last year)
(3, 1, 10, 150000, DATEADD(DAY, 21, @LastYear)), -- Bữa sáng
(3, 3, 5, 250000, DATEADD(DAY, 22, @LastYear)), -- Bữa tối
(3, 8, 2, 500000, DATEADD(DAY, 23, @LastYear)), -- Spa
(3, 15, 1, 300000, DATEADD(DAY, 24, @LastYear)), -- Đưa đón sân bay

-- Booking 4 services (completed last year)
(4, 1, 20, 150000, DATEADD(DAY, 26, @LastYear)), -- Bữa sáng
(4, 2, 5, 200000, DATEADD(DAY, 27, @LastYear)), -- Bữa trưa
(4, 3, 5, 250000, DATEADD(DAY, 28, @LastYear)), -- Bữa tối
(4, 9, 5, 100000, DATEADD(DAY, 29, @LastYear)), -- Hồ bơi
(4, 31, 2, 100000, DATEADD(DAY, 29, @LastYear)), -- Giặt ủi

-- Booking 5 services (completed last year)
(5, 1, 10, 150000, DATEADD(DAY, 31, @LastYear)), -- Bữa sáng
(5, 3, 5, 250000, DATEADD(DAY, 32, @LastYear)), -- Bữa tối
(5, 8, 2, 500000, DATEADD(DAY, 33, @LastYear)), -- Spa
(5, 16, 1, 500000, DATEADD(DAY, 34, @LastYear)), -- Thuê xe

-- Booking 6 services (completed last month)
(6, 1, 3, 150000, DATEADD(DAY, 6, @LastMonth)), -- Bữa sáng
(6, 8, 1, 500000, DATEADD(DAY, 7, @LastMonth)), -- Spa

-- Booking 7 services (completed last month)
(7, 1, 10, 150000, DATEADD(DAY, 11, @LastMonth)), -- Bữa sáng
(7, 3, 2, 250000, DATEADD(DAY, 12, @LastMonth)), -- Bữa tối
(7, 9, 2, 100000, DATEADD(DAY, 13, @LastMonth)), -- Hồ bơi
(7, 31, 1, 100000, DATEADD(DAY, 14, @LastMonth)), -- Giặt ủi

-- Booking 8 services (completed last month)
(8, 1, 6, 150000, DATEADD(DAY, 16, @LastMonth)), -- Bữa sáng
(8, 3, 3, 250000, DATEADD(DAY, 17, @LastMonth)), -- Bữa tối

-- Booking 9 services (completed last month)
(9, 1, 20, 150000, DATEADD(DAY, 21, @LastMonth)), -- Bữa sáng
(9, 2, 5, 200000, DATEADD(DAY, 22, @LastMonth)), -- Bữa trưa
(9, 3, 5, 250000, DATEADD(DAY, 23, @LastMonth)), -- Bữa tối
(9, 9, 5, 100000, DATEADD(DAY, 24, @LastMonth)), -- Hồ bơi

-- Booking 10 services (completed last month)
(10, 1, 6, 150000, DATEADD(DAY, 26, @LastMonth)), -- Bữa sáng
(10, 3, 3, 250000, DATEADD(DAY, 27, @LastMonth)), -- Bữa tối

-- Booking 11 services (current active - checked in)
(11, 1, 4, 150000, DATEADD(DAY, -2, @Today)), -- Bữa sáng
(11, 9, 2, 100000, DATEADD(DAY, -1, @Today)), -- Hồ bơi

-- Booking 12 services (current active - checked in)
(12, 1, 4, 150000, DATEADD(DAY, -1, @Today)), -- Bữa sáng
(12, 3, 2, 250000, DATEADD(DAY, -1, @Today)), -- Bữa tối

-- Booking 13 services (current active - checked in)
(13, 1, 8, 150000, @Today), -- Bữa sáng
(13, 9, 4, 100000, @Today); -- Hồ bơi
GO

-- Chèn dữ liệu mẫu cho Invoices
-- Lấy ngày hiện tại để tạo dữ liệu tương đối
DECLARE @Today DATE = GETDATE();
DECLARE @LastYear DATE = DATEADD(YEAR, -1, @Today);
DECLARE @LastMonth DATE = DATEADD(MONTH, -1, @Today);

INSERT INTO Invoices (BookingId, InvoiceNumber, IssuedDate, TotalAmount, Tax, Status)
VALUES 
-- Invoices for completed bookings last year
(1, 'INV-202201-00001', DATEADD(DAY, 13, @LastYear), 2200000, 200000, 'paid'),
(2, 'INV-202201-00002', DATEADD(DAY, 20, @LastYear), 5500000, 500000, 'paid'),
(3, 'INV-202201-00003', DATEADD(DAY, 25, @LastYear), 9000000, 800000, 'paid'),
(4, 'INV-202201-00004', DATEADD(DAY, 30, @LastYear), 12500000, 1100000, 'paid'),
(5, 'INV-202201-00005', DATEADD(DAY, 35, @LastYear), 14000000, 1200000, 'paid'),

-- Invoices for completed bookings last month
(6, 'INV-202301-00001', DATEADD(DAY, 8, @LastMonth), 2150000, 200000, 'paid'),
(7, 'INV-202301-00002', DATEADD(DAY, 15, @LastMonth), 5500000, 500000, 'paid'),
(8, 'INV-202301-00003', DATEADD(DAY, 18, @LastMonth), 4950000, 450000, 'paid'),
(9, 'INV-202301-00004', DATEADD(DAY, 25, @LastMonth), 12000000, 1100000, 'paid'),
(10, 'INV-202301-00005', DATEADD(DAY, 28, @LastMonth), 7650000, 700000, 'paid');
GO

-- Chèn dữ liệu mẫu cho InvoiceItems
INSERT INTO InvoiceItems (InvoiceId, ItemType, Description, Quantity, UnitPrice, TotalPrice)
VALUES 
-- Invoice 1 items
(1, 'room', 'Standard Room - 3 đêm', 3, 500000, 1500000),
(1, 'service', 'Bữa sáng', 4, 150000, 600000),
(1, 'service', 'Spa', 1, 500000, 500000),
(1, 'tax', 'Thuế VAT 10%', 1, 200000, 200000),

-- Invoice 2 items
(2, 'room', 'Deluxe Room - 5 đêm', 5, 800000, 4000000),
(2, 'service', 'Bữa sáng', 10, 150000, 1500000),
(2, 'service', 'Bữa tối', 2, 250000, 500000),
(2, 'service', 'Hồ bơi', 2, 100000, 200000),
(2, 'service', 'Giặt ủi', 1, 100000, 100000),
(2, 'tax', 'Thuế VAT 10%', 1, 500000, 500000),

-- Invoice 3 items
(3, 'room', 'Suite Room - 5 đêm', 5, 1200000, 6000000),
(3, 'service', 'Bữa sáng', 10, 150000, 1500000),
(3, 'service', 'Bữa tối', 5, 250000, 1250000),
(3, 'service', 'Spa', 2, 500000, 1000000),
(3, 'service', 'Đưa đón sân bay', 1, 300000, 300000),
(3, 'tax', 'Thuế VAT 10%', 1, 800000, 800000),

-- Invoice 4 items
(4, 'room', 'Family Room - 5 đêm', 5, 1500000, 7500000),
(4, 'service', 'Bữa sáng', 20, 150000, 3000000),
(4, 'service', 'Bữa trưa', 5, 200000, 1000000),
(4, 'service', 'Bữa tối', 5, 250000, 1250000),
(4, 'service', 'Hồ bơi', 5, 100000, 500000),
(4, 'service', 'Giặt ủi', 2, 100000, 200000),
(4, 'tax', 'Thuế VAT 10%', 1, 1100000, 1100000),

-- Invoice 5 items
(5, 'room', 'Executive Room - 5 đêm', 5, 2000000, 10000000),
(5, 'service', 'Bữa sáng', 10, 150000, 1500000),
(5, 'service', 'Bữa tối', 5, 250000, 1250000),
(5, 'service', 'Spa', 2, 500000, 1000000),
(5, 'service', 'Thuê xe', 1, 500000, 500000),
(5, 'tax', 'Thuế VAT 10%', 1, 1200000, 1200000),

-- Invoice 6 items
(6, 'room', 'Standard Room - 3 đêm', 3, 500000, 1500000),
(6, 'service', 'Bữa sáng', 3, 150000, 450000),
(6, 'service', 'Spa', 1, 500000, 500000),
(6, 'tax', 'Thuế VAT 10%', 1, 200000, 200000),

-- Invoice 7 items
(7, 'room', 'Deluxe Room - 5 đêm', 5, 800000, 4000000),
(7, 'service', 'Bữa sáng', 10, 150000, 1500000),
(7, 'service', 'Bữa tối', 2, 250000, 500000),
(7, 'service', 'Hồ bơi', 2, 100000, 200000),
(7, 'service', 'Giặt ủi', 1, 100000, 100000),
(7, 'tax', 'Thuế VAT 10%', 1, 500000, 500000),

-- Invoice 8 items
(8, 'room', 'Suite Room - 3 đêm', 3, 1200000, 3600000),
(8, 'service', 'Bữa sáng', 6, 150000, 900000),
(8, 'service', 'Bữa tối', 3, 250000, 750000),
(8, 'tax', 'Thuế VAT 10%', 1, 450000, 450000),

-- Invoice 9 items
(9, 'room', 'Family Room - 5 đêm', 5, 1500000, 7500000),
(9, 'service', 'Bữa sáng', 20, 150000, 3000000),
(9, 'service', 'Bữa trưa', 5, 200000, 1000000),
(9, 'service', 'Bữa tối', 5, 250000, 1250000),
(9, 'service', 'Hồ bơi', 5, 100000, 500000),
(9, 'tax', 'Thuế VAT 10%', 1, 1100000, 1100000),

-- Invoice 10 items
(10, 'room', 'Executive Room - 3 đêm', 3, 2000000, 6000000),
(10, 'service', 'Bữa sáng', 6, 150000, 900000),
(10, 'service', 'Bữa tối', 3, 250000, 750000),
(10, 'tax', 'Thuế VAT 10%', 1, 700000, 700000);
GO

-- Chèn dữ liệu mẫu cho Reviews
-- Lấy ngày hiện tại để tạo dữ liệu tương đối
DECLARE @Today DATE = GETDATE();
DECLARE @LastYear DATE = DATEADD(YEAR, -1, @Today);
DECLARE @LastMonth DATE = DATEADD(MONTH, -1, @Today);

INSERT INTO Reviews (BookingId, Rating, Comment, ReviewDate)
VALUES 
-- Reviews for completed bookings last year
(1, 5, 'Dịch vụ tuyệt vời, phòng sạch sẽ và nhân viên thân thiện', DATEADD(DAY, 15, @LastYear)),
(2, 4, 'Phòng đẹp, dịch vụ tốt nhưng giá hơi cao', DATEADD(DAY, 22, @LastYear)),
(3, 5, 'Phòng suite rất sang trọng, đáng giá từng đồng', DATEADD(DAY, 27, @LastYear)),
(4, 4, 'Phòng gia đình rộng rãi, tiện nghi đầy đủ, thích hợp cho gia đình đông người', DATEADD(DAY, 32, @LastYear)),
(5, 5, 'Phòng executive tuyệt vời, view đẹp, dịch vụ chuyên nghiệp', DATEADD(DAY, 37, @LastYear)),

-- Reviews for completed bookings last month
(6, 4, 'Phòng sạch sẽ, nhân viên nhiệt tình', DATEADD(DAY, 10, @LastMonth)),
(7, 5, 'Dịch vụ tốt, vị trí thuận tiện', DATEADD(DAY, 17, @LastMonth)),
(8, 3, 'Phòng ổn nhưng hơi ồn từ đường phố', DATEADD(DAY, 20, @LastMonth)),
(9, 5, 'Kỳ nghỉ tuyệt vời với gia đình, sẽ quay lại lần sau', DATEADD(DAY, 27, @LastMonth)),
(10, 4, 'Phòng đẹp, nhân viên thân thiện, chỉ có điều điều hòa hơi yếu', DATEADD(DAY, 30, @LastMonth));
GO

-- Tạo các chỉ mục để tối ưu hiệu suất truy vấn
CREATE INDEX IX_Rooms_RoomTypeId ON Rooms(RoomTypeId);
CREATE INDEX IX_Rooms_Status ON Rooms(Status);
CREATE INDEX IX_Bookings_CustomerId ON Bookings(CustomerId);
CREATE INDEX IX_Bookings_RoomId ON Bookings(RoomId);
CREATE INDEX IX_Bookings_Status ON Bookings(Status);
CREATE INDEX IX_Bookings_CheckInDate ON Bookings(CheckInDate);
CREATE INDEX IX_Bookings_CheckOutDate ON Bookings(CheckOutDate);
CREATE INDEX IX_BookingServices_BookingId ON BookingServices(BookingId);
CREATE INDEX IX_BookingServices_ServiceId ON BookingServices(ServiceId);
CREATE INDEX IX_Services_CategoryId ON Services(CategoryId);
CREATE INDEX IX_Customers_UserId ON Customers(UserId);
CREATE INDEX IX_Customers_Email ON Customers(Email);
CREATE INDEX IX_Users_Email ON Users(Email);
CREATE INDEX IX_Users_Role ON Users(Role);
GO

-- Tạo trigger để cập nhật trạng thái phòng khi đặt phòng thay đổi
CREATE TRIGGER TR_Bookings_UpdateRoomStatus
ON Bookings
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Khi booking chuyển sang trạng thái checked_in, cập nhật phòng thành occupied
    UPDATE r
    SET r.Status = 'occupied'
    FROM Rooms r
    INNER JOIN inserted i ON r.Id = i.RoomId
    INNER JOIN deleted d ON d.Id = i.Id
    WHERE i.Status = 'checked_in' AND d.Status <> 'checked_in';
    
    -- Khi booking chuyển sang trạng thái checked_out, cập nhật phòng thành cleaning
    UPDATE r
    SET r.Status = 'cleaning'
    FROM Rooms r
    INNER JOIN inserted i ON r.Id = i.RoomId
    INNER JOIN deleted d ON d.Id = i.Id
    WHERE i.Status = 'checked_out' AND d.Status <> 'checked_out';
    
    -- Khi booking chuyển sang trạng thái cancelled, cập nhật phòng thành available nếu phòng đang ở trạng thái reserved
    UPDATE r
    SET r.Status = 'available'
    FROM Rooms r
    INNER JOIN inserted i ON r.Id = i.RoomId
    INNER JOIN deleted d ON d.Id = i.Id
    WHERE i.Status = 'cancelled' AND d.Status <> 'cancelled' AND r.Status = 'reserved';
END;
GO

-- Tạo trigger để cập nhật tổng tiền khi thêm dịch vụ
CREATE TRIGGER TR_BookingServices_UpdateTotalAmount
ON BookingServices
AFTER INSERT
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Cập nhật tổng tiền của booking khi thêm dịch vụ
    UPDATE b
    SET b.TotalAmount = b.TotalAmount + (i.Price * i.Quantity)
    FROM Bookings b
    INNER JOIN inserted i ON b.Id = i.BookingId;
END;
GO

-- Tạo trigger để cập nhật tổng tiền khi xóa dịch vụ
CREATE TRIGGER TR_BookingServices_UpdateTotalAmountOnDelete
ON BookingServices
AFTER DELETE
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Cập nhật tổng tiền của booking khi xóa dịch vụ
    UPDATE b
    SET b.TotalAmount = b.TotalAmount - (d.Price * d.Quantity)
    FROM Bookings b
    INNER JOIN deleted d ON b.Id = d.BookingId;
END;
GO

-- Tạo view để xem thông tin đặt phòng đầy đủ
CREATE VIEW vw_BookingDetails
AS
SELECT 
    b.Id AS BookingId,
    b.CheckInDate,
    b.CheckOutDate,
    b.Adults,
    b.Children,
    b.TotalAmount,
    b.Status AS BookingStatus,
    b.PaymentStatus,
    b.CreatedAt,
    c.Id AS CustomerId,
    c.FirstName + ' ' + c.LastName AS CustomerName,
    c.Email AS CustomerEmail,
    c.PhoneNumber AS CustomerPhone,
    r.Id AS RoomId,
    r.RoomNumber,
    rt.Id AS RoomTypeId,
    rt.Name AS RoomTypeName,
    rt.BasePrice,
    rt.Capacity,
    (SELECT COUNT(*) FROM BookingServices bs WHERE bs.BookingId = b.Id) AS ServiceCount,
    (SELECT SUM(bs.Price * bs.Quantity) FROM BookingServices bs WHERE bs.BookingId = b.Id) AS ServiceTotal,
    (SELECT COUNT(*) FROM Reviews rv WHERE rv.BookingId = b.Id) AS HasReview,
    (SELECT TOP 1 i.Id FROM Invoices i WHERE i.BookingId = b.Id) AS InvoiceId
FROM 
    Bookings b
INNER JOIN 
    Customers c ON b.CustomerId = c.Id
INNER JOIN 
    Rooms r ON b.RoomId = r.Id
INNER JOIN 
    RoomTypes rt ON r.RoomTypeId = rt.Id;
GO

-- Tạo view để xem thông tin phòng đầy đủ
CREATE VIEW vw_RoomDetails
AS
SELECT 
    r.Id AS RoomId,
    r.RoomNumber,
    r.Status,
    r.Floor,
    rt.Id AS RoomTypeId,
    rt.Name AS RoomTypeName,
    rt.Description,
    rt.BasePrice,
    rt.Capacity,
    (SELECT COUNT(*) FROM RoomFeatures rf WHERE rf.RoomTypeId = rt.Id AND rf.FeatureType = 'amenity') AS AmenityCount,
    (SELECT COUNT(*) FROM RoomFeatures rf WHERE rf.RoomTypeId = rt.Id AND rf.FeatureType = 'image') AS ImageCount,
    (SELECT TOP 1 rf.Value FROM RoomFeatures rf WHERE rf.RoomTypeId = rt.Id AND rf.FeatureType = 'image' AND rf.IsPrimary = 1) AS PrimaryImage,
    (SELECT COUNT(*) FROM Bookings b WHERE b.RoomId = r.Id AND b.Status IN ('confirmed', 'checked_in')) AS ActiveBookingsCount
FROM 
    Rooms r
INNER JOIN 
    RoomTypes rt ON r.RoomTypeId = rt.Id;
GO

-- Tạo view để xem thông tin dịch vụ đầy đủ
CREATE VIEW vw_ServiceDetails
AS
SELECT 
    s.Id AS ServiceId,
    s.Name AS ServiceName,
    s.Description,
    s.Price,
    s.IsAvailable,
    s.ImageUrl,
    sc.Id AS CategoryId,
    sc.Name AS CategoryName,
    sc.Description AS CategoryDescription,
    (SELECT COUNT(*) FROM BookingServices bs WHERE bs.ServiceId = s.Id) AS UsageCount,
    (SELECT SUM(bs.Quantity) FROM BookingServices bs WHERE bs.ServiceId = s.Id) AS TotalQuantity,
    (SELECT SUM(bs.Price * bs.Quantity) FROM BookingServices bs WHERE bs.ServiceId = s.Id) AS TotalRevenue
FROM 
    Services s
INNER JOIN 
    ServiceCategories sc ON s.CategoryId = sc.Id;
GO

-- Tạo view để xem thông tin khách hàng đầy đủ
CREATE VIEW vw_CustomerDetails
AS
SELECT 
    c.Id AS CustomerId,
    c.FirstName,
    c.LastName,
    c.FirstName + ' ' + c.LastName AS FullName,
    c.Email,
    c.PhoneNumber,
    c.IdNumber,
    c.Nationality,
    c.UserId,
    u.Email AS UserEmail,
    u.Role AS UserRole,
    (SELECT COUNT(*) FROM Bookings b WHERE b.CustomerId = c.Id) AS BookingsCount,
    (SELECT COUNT(*) FROM Bookings b WHERE b.CustomerId = c.Id AND b.Status = 'checked_out') AS CompletedBookingsCount,
    (SELECT SUM(b.TotalAmount) FROM Bookings b WHERE b.CustomerId = c.Id AND b.Status = 'checked_out') AS TotalSpent,
    (SELECT TOP 1 ca.Address FROM CustomerAddresses ca WHERE ca.CustomerId = c.Id AND ca.IsDefault = 1) AS DefaultAddress,
    (SELECT TOP 1 ca.City FROM CustomerAddresses ca WHERE ca.CustomerId = c.Id AND ca.IsDefault = 1) AS DefaultCity,
    (SELECT TOP 1 ca.Country FROM CustomerAddresses ca WHERE ca.CustomerId = c.Id AND ca.IsDefault = 1) AS DefaultCountry
FROM 
    Customers c
LEFT JOIN 
    Users u ON c.UserId = u.Id;
GO

-- Tạo view để xem thông tin hóa đơn đầy đủ
CREATE VIEW vw_InvoiceDetails
AS
SELECT 
    i.Id AS InvoiceId,
    i.InvoiceNumber,
    i.IssuedDate,
    i.TotalAmount,
    i.Tax,
    i.Status AS InvoiceStatus,
    b.Id AS BookingId,
    b.CheckInDate,
    b.CheckOutDate,
    b.Status AS BookingStatus,
    b.PaymentStatus,
    c.Id AS CustomerId,
    c.FirstName + ' ' + c.LastName AS CustomerName,
    c.Email AS CustomerEmail,
    r.RoomNumber,
    rt.Name AS RoomTypeName,
    (SELECT COUNT(*) FROM InvoiceItems ii WHERE ii.InvoiceId = i.Id) AS ItemCount,
    (SELECT SUM(ii.TotalPrice) FROM InvoiceItems ii WHERE ii.InvoiceId = i.Id AND ii.ItemType = 'room') AS RoomTotal,
    (SELECT SUM(ii.TotalPrice) FROM InvoiceItems ii WHERE ii.InvoiceId = i.Id AND ii.ItemType = 'service') AS ServiceTotal
FROM 
    Invoices i
INNER JOIN 
    Bookings b ON i.BookingId = b.Id
INNER JOIN 
    Customers c ON b.CustomerId = c.Id
INNER JOIN 
    Rooms r ON b.RoomId = r.Id
INNER JOIN 
    RoomTypes rt ON r.RoomTypeId = rt.Id;
GO

PRINT 'Thấy dòng này là SQL OK rồi =)) '
GO

-- Vô hiệu hóa trigger TR_Bookings_UpdateRoomStatus
ALTER TABLE Bookings DISABLE TRIGGER TR_Bookings_UpdateRoomStatus;
GO

-- Vô hiệu hóa trigger TR_BookingServices_UpdateTotalAmount
ALTER TABLE BookingServices DISABLE TRIGGER TR_BookingServices_UpdateTotalAmount;
GO
