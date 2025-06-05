using System.ComponentModel.DataAnnotations;

namespace HotelManagement.API.Models;

/// <summary>
/// Mô hình dữ liệu cho đánh giá
/// </summary>
public class ReviewDto
{
    public int Id { get; set; }
    public int BookingId { get; set; }
    public int CustomerId { get; set; }
    public string CustomerName { get; set; } = string.Empty;
    public int RoomId { get; set; }
    public string RoomNumber { get; set; } = string.Empty;
    public int Rating { get; set; }
    public string Comment { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}

/// <summary>
/// Mô hình dữ liệu cho yêu cầu tạo đánh giá mới
/// </summary>
public class CreateReviewRequest
{
    [Required(ErrorMessage = "ID đặt phòng là bắt buộc")]
    public int BookingId { get; set; }
    
    [Required(ErrorMessage = "Đánh giá sao là bắt buộc")]
    [Range(1, 5, ErrorMessage = "Đánh giá sao phải từ 1 đến 5")]
    public int Rating { get; set; }
    
    [Required(ErrorMessage = "Nội dung đánh giá là bắt buộc")]
    [StringLength(1000, ErrorMessage = "Nội dung đánh giá không được vượt quá 1000 ký tự")]
    public string Comment { get; set; } = string.Empty;
}

/// <summary>
/// Mô hình dữ liệu cho yêu cầu cập nhật đánh giá
/// </summary>
public class UpdateReviewRequest
{
    [Range(1, 5, ErrorMessage = "Đánh giá sao phải từ 1 đến 5")]
    public int? Rating { get; set; }
    
    [StringLength(1000, ErrorMessage = "Nội dung đánh giá không được vượt quá 1000 ký tự")]
    public string? Comment { get; set; }
} 