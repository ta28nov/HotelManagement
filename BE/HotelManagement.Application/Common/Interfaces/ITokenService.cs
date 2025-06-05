using HotelManagement.Domain.Entities;

namespace HotelManagement.Application.Common.Interfaces;

/// <summary>
/// Interface cho dịch vụ quản lý token
/// </summary>
public interface ITokenService
{
    /// <summary>
    /// Tạo JWT token cho người dùng
    /// </summary>
    string GenerateJwtToken(User user);
    
    /// <summary>
    /// Kiểm tra token có trong danh sách đen không
    /// </summary>
    Task<bool> IsTokenBlacklistedAsync(string token);
    
    /// <summary>
    /// Thêm token vào danh sách đen
    /// </summary>
    Task BlacklistTokenAsync(string token);
    
    /// <summary>
    /// Tạo token đặt lại mật khẩu
    /// </summary>
    Task<string> GeneratePasswordResetTokenAsync(int userId);
    
    /// <summary>
    /// Xác thực token đặt lại mật khẩu
    /// </summary>
    Task<bool> ValidatePasswordResetTokenAsync(string token);
}
