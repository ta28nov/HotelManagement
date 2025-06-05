using System.ComponentModel.DataAnnotations;

namespace HotelManagement.API.Models;

/// <summary>
/// Mô hình dữ liệu cho yêu cầu đăng nhập
/// </summary>
public class LoginRequest
{
    [Required(ErrorMessage = "Email là bắt buộc")]
    [EmailAddress(ErrorMessage = "Email không hợp lệ")]
    public string Email { get; set; } = string.Empty;
    
    [Required(ErrorMessage = "Mật khẩu là bắt buộc")]
    public string Password { get; set; } = string.Empty;
}

/// <summary>
/// Mô hình dữ liệu cho yêu cầu đăng ký
/// </summary>
public class RegisterRequest
{
    [Required(ErrorMessage = "Tên là bắt buộc")]
    public string Name { get; set; } = string.Empty;
    
    [Required(ErrorMessage = "Email là bắt buộc")]
    [EmailAddress(ErrorMessage = "Email không hợp lệ")]
    public string Email { get; set; } = string.Empty;
    
    [Required(ErrorMessage = "Mật khẩu là bắt buộc")]
    [MinLength(6, ErrorMessage = "Mật khẩu phải có ít nhất 6 ký tự")]
    public string Password { get; set; } = string.Empty;
    
    public string? Role { get; set; }
}

/// <summary>
/// Mô hình dữ liệu cho yêu cầu quên mật khẩu
/// </summary>
public class ForgotPasswordRequest
{
    [Required(ErrorMessage = "Email là bắt buộc")]
    [EmailAddress(ErrorMessage = "Email không hợp lệ")]
    public string Email { get; set; } = string.Empty;
}

/// <summary>
/// Mô hình dữ liệu cho yêu cầu đặt lại mật khẩu
/// </summary>
public class ResetPasswordRequest
{
    [Required(ErrorMessage = "Token là bắt buộc")]
    public string Token { get; set; } = string.Empty;
    
    [Required(ErrorMessage = "Mật khẩu mới là bắt buộc")]
    [MinLength(6, ErrorMessage = "Mật khẩu phải có ít nhất 6 ký tự")]
    public string NewPassword { get; set; } = string.Empty;
}

/// <summary>
/// Mô hình dữ liệu cho yêu cầu thay đổi mật khẩu
/// </summary>
public class ChangePasswordRequest
{
    [Required(ErrorMessage = "Mật khẩu hiện tại là bắt buộc")]
    public string CurrentPassword { get; set; } = string.Empty;
    
    [Required(ErrorMessage = "Mật khẩu mới là bắt buộc")]
    [MinLength(6, ErrorMessage = "Mật khẩu phải có ít nhất 6 ký tự")]
    public string NewPassword { get; set; } = string.Empty;
}
