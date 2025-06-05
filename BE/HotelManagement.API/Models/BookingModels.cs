using System.ComponentModel.DataAnnotations;

namespace HotelManagement.API.Models;

/// <summary>
/// Mô hình dữ liệu cho thông tin đặt phòng
/// </summary>
public class BookingDto
{
    public int Id { get; set; }
    public int CustomerId { get; set; }
    public string CustomerName { get; set; } = string.Empty;
    public string CustomerEmail { get; set; } = string.Empty;
    public string CustomerPhone { get; set; } = string.Empty;
    public int RoomId { get; set; }
    public string RoomNumber { get; set; } = string.Empty;
    public string RoomTypeName { get; set; } = string.Empty;
    public DateTime CheckInDate { get; set; }
    public DateTime CheckOutDate { get; set; }
    public int Adults { get; set; }
    public int Children { get; set; }
    public decimal TotalAmount { get; set; }
    public string Status { get; set; } = string.Empty;
    public string PaymentStatus { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public IEnumerable<BookingServiceDto>? Services { get; set; }
    public IEnumerable<BookingHistoryDto>? History { get; set; }
}

/// <summary>
/// Mô hình dữ liệu cho dịch vụ sử dụng trong đặt phòng
/// </summary>
public class BookingServiceDto
{
    public int Id { get; set; }
    public int ServiceId { get; set; }
    public string ServiceName { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public decimal Price { get; set; }
    public decimal TotalPrice { get; set; }
    public DateTime ServiceDate { get; set; }
}

/// <summary>
/// Mô hình dữ liệu cho lịch sử đặt phòng
/// </summary>
public class BookingHistoryDto
{
    public int Id { get; set; }
    public string Status { get; set; } = string.Empty;
    public string? PaymentStatus { get; set; }
    public DateTime ChangedAt { get; set; }
    public int? ChangedBy { get; set; }
    public string? ChangedByName { get; set; }
    public string? Notes { get; set; }
}

/// <summary>
/// Mô hình dữ liệu cho yêu cầu tạo đặt phòng mới
/// </summary>
public class CreateBookingRequest
{
    [Required(ErrorMessage = "ID khách hàng là bắt buộc")]
    public int CustomerId { get; set; }
    
    [Required(ErrorMessage = "ID phòng là bắt buộc")]
    public int RoomId { get; set; }
    
    [Required(ErrorMessage = "Ngày check-in là bắt buộc")]
    public DateTime CheckInDate { get; set; }
    
    [Required(ErrorMessage = "Ngày check-out là bắt buộc")]
    public DateTime CheckOutDate { get; set; }
    
    [Required(ErrorMessage = "Số lượng người lớn là bắt buộc")]
    [Range(1, 10, ErrorMessage = "Số lượng người lớn phải từ 1 đến 10")]
    public int Adults { get; set; }
    
    [Range(0, 10, ErrorMessage = "Số lượng trẻ em phải từ 0 đến 10")]
    public int Children { get; set; } = 0;
    
    [Required(ErrorMessage = "Tổng tiền là bắt buộc")]
    [Range(0, 100000000, ErrorMessage = "Tổng tiền phải từ 0 đến 100000000")]
    public decimal TotalAmount { get; set; }
    
    public string? Notes { get; set; }
}

/// <summary>
/// Mô hình dữ liệu cho yêu cầu cập nhật trạng thái đặt phòng
/// </summary>
public class UpdateBookingStatusRequest
{
    [Required(ErrorMessage = "Trạng thái là bắt buộc")]
    public string Status { get; set; } = string.Empty;
    
    public string? PaymentStatus { get; set; }
    
    public string? Notes { get; set; }
}

/// <summary>
/// Mô hình dữ liệu cho yêu cầu cập nhật đặt phòng
/// </summary>
public class UpdateBookingRequest
{
    public int? CustomerId { get; set; }
    public int? RoomId { get; set; }
    public DateTime? CheckInDate { get; set; }
    public DateTime? CheckOutDate { get; set; }
    public int? Adults { get; set; }
    public int? Children { get; set; }
    public decimal? TotalAmount { get; set; }
    public string? Status { get; set; }
    public string? PaymentStatus { get; set; }
    public string? Notes { get; set; }
}

/// <summary>
/// Mô hình dữ liệu cho yêu cầu check-in
/// </summary>
public class CheckInRequest
{
    public bool UpdateCustomerInfo { get; set; } = false;
    public CustomerInfoRequest? CustomerInfo { get; set; }
    public string? Notes { get; set; }
}

/// <summary>
/// Mô hình dữ liệu cho yêu cầu check-out
/// </summary>
public class CheckOutRequest
{
    public string? PaymentStatus { get; set; }
    public bool GenerateInvoice { get; set; } = true;
    public string? Notes { get; set; }
}

/// <summary>
/// Mô hình dữ liệu cho yêu cầu cập nhật thanh toán
/// </summary>
public class UpdatePaymentRequest
{
    [Required(ErrorMessage = "Trạng thái thanh toán là bắt buộc")]
    public string PaymentStatus { get; set; } = string.Empty;
    public string? Notes { get; set; }
}

/// <summary>
/// Mô hình dữ liệu cho yêu cầu xử lý thanh toán
/// </summary>
public class ProcessPaymentRequest
{
    [Required(ErrorMessage = "Phương thức thanh toán là bắt buộc")]
    public string PaymentMethod { get; set; } = string.Empty;
    
    public string? CardNumber { get; set; }
    public string? CardHolderName { get; set; }
    public string? ExpiryDate { get; set; }
    public string? CVV { get; set; }
}

/// <summary>
/// Mô hình dữ liệu cho yêu cầu thêm dịch vụ đặt phòng
/// </summary>
public class AddBookingServiceRequest
{
    [Required(ErrorMessage = "ID dịch vụ là bắt buộc")]
    public int ServiceId { get; set; }
    
    [Required(ErrorMessage = "Số lượng là bắt buộc")]
    [Range(1, 100, ErrorMessage = "Số lượng phải từ 1 đến 100")]
    public int Quantity { get; set; } = 1;
    
    public DateTime? ServiceDate { get; set; }
}

/// <summary>
/// Mô hình dữ liệu cho thông tin hóa đơn
/// </summary>
public class InvoiceDto
{
    public int Id { get; set; }
    public int BookingId { get; set; }
    public string InvoiceNumber { get; set; } = string.Empty;
    public DateTime IssuedDate { get; set; }
    public decimal TotalAmount { get; set; }
    public decimal Tax { get; set; }
    public string Status { get; set; } = string.Empty;
    public IEnumerable<InvoiceItemDto>? InvoiceItems { get; set; }
}

/// <summary>
/// Mô hình dữ liệu cho mục hóa đơn
/// </summary>
public class InvoiceItemDto
{
    public int Id { get; set; }
    public string ItemType { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal TotalPrice { get; set; }
}
