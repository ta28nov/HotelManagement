using System.ComponentModel.DataAnnotations;

namespace HotelManagement.API.Models;

/// <summary>
/// Mô hình dữ liệu cho thông tin khách hàng trong yêu cầu
/// </summary>
public class CustomerInfoRequest
{
    [Required(ErrorMessage = "Họ là bắt buộc")]
    public string FirstName { get; set; } = string.Empty;

    [Required(ErrorMessage = "Tên là bắt buộc")]
    public string LastName { get; set; } = string.Empty;

    [Required(ErrorMessage = "Email là bắt buộc")]
    [EmailAddress(ErrorMessage = "Email không hợp lệ")]
    public string Email { get; set; } = string.Empty;

    [Required(ErrorMessage = "Số điện thoại là bắt buộc")]
    [Phone(ErrorMessage = "Số điện thoại không hợp lệ")]
    public string PhoneNumber { get; set; } = string.Empty;

    [Required(ErrorMessage = "Số CMND/CCCD là bắt buộc")]
    public string IdNumber { get; set; } = string.Empty;

    [Required(ErrorMessage = "Quốc tịch là bắt buộc")]
    public string Nationality { get; set; } = string.Empty;
    
    public string? Address { get; set; }
    public string? City { get; set; }
    public string? State { get; set; }
    public string? PostalCode { get; set; }
    public string? Country { get; set; }
} 