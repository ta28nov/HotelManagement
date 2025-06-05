using System.ComponentModel.DataAnnotations;

namespace HotelManagement.API.Models;

/// <summary>
/// Mô hình dữ liệu cho thông tin người dùng
/// </summary>
public class UserDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? PhoneNumber { get; set; }
    public string Role { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}

/// <summary>
/// Mô hình dữ liệu cho yêu cầu tạo người dùng mới
/// </summary>
public class CreateUserRequest
{
    [Required(ErrorMessage = "Tên là bắt buộc")]
    public string Name { get; set; } = string.Empty;
    
    [Required(ErrorMessage = "Email là bắt buộc")]
    [EmailAddress(ErrorMessage = "Email không hợp lệ")]
    public string Email { get; set; } = string.Empty;
    
    [Required(ErrorMessage = "Mật khẩu là bắt buộc")]
    [MinLength(6, ErrorMessage = "Mật khẩu phải có ít nhất 6 ký tự")]
    public string Password { get; set; } = string.Empty;
    
    [Required(ErrorMessage = "Vai trò là bắt buộc")]
    public string Role { get; set; } = string.Empty;
    
    public string? PhoneNumber { get; set; }
}

/// <summary>
/// Mô hình dữ liệu cho yêu cầu cập nhật người dùng
/// </summary>
public class UpdateUserRequest
{
    public string? Name { get; set; }
    public string? PhoneNumber { get; set; }
    public string? Role { get; set; }
}

/// <summary>
/// Mô hình dữ liệu cho yêu cầu cập nhật thông tin cá nhân
/// </summary>
public class UpdateProfileRequest
{
    public string? Name { get; set; }
    public string? PhoneNumber { get; set; }
}
