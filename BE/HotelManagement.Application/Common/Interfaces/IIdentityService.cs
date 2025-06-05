using HotelManagement.Application.Common.Models;

namespace HotelManagement.Application.Common.Interfaces;

/// <summary>
/// Interface cho dịch vụ xác thực và quản lý người dùng
/// </summary>
public interface IIdentityService
{
    /// <summary>
    /// Xác thực người dùng bằng email và mật khẩu
    /// </summary>
    Task<AuthenticationResult> AuthenticateAsync(string email, string password);
    
    /// <summary>
    /// Đăng ký người dùng mới
    /// </summary>
    Task<RegistrationResult> RegisterUserAsync(string name, string email, string password, string role);
    
    /// <summary>
    /// Tạo token đặt lại mật khẩu
    /// </summary>
    Task<string> GeneratePasswordResetTokenAsync(int userId);
    
    /// <summary>
    /// Đặt lại mật khẩu
    /// </summary>
    Task<PasswordResetResult> ResetPasswordAsync(string token, string newPassword);
    
    /// <summary>
    /// Thay đổi mật khẩu
    /// </summary>
    Task<PasswordChangeResult> ChangePasswordAsync(int userId, string currentPassword, string newPassword);
}
