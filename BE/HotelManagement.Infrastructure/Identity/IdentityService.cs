using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using HotelManagement.Application.Common.Interfaces;
using HotelManagement.Application.Common.Models;
using HotelManagement.Domain.Entities;

namespace HotelManagement.Infrastructure.Identity;

/// <summary>
/// Dịch vụ xác thực và quản lý người dùng
/// </summary>
public class IdentityService : IIdentityService
{
    private readonly IUserRepository _userRepository;
    private readonly ITokenService _tokenService;

    public IdentityService(IUserRepository userRepository, ITokenService tokenService)
    {
        _userRepository = userRepository;
        _tokenService = tokenService;
    }

    /// <summary>
    /// Xác thực người dùng bằng email và mật khẩu
    /// </summary>
    /// <param name="email">Email đăng nhập</param>
    /// <param name="password">Mật khẩu</param>
    /// <returns>Kết quả xác thực bao gồm token JWT nếu thành công</returns>
    public async Task<AuthenticationResult> AuthenticateAsync(string email, string password)
    {
        // Tìm kiếm người dùng theo email
        var user = await _userRepository.GetByEmailAsync(email);
        
        if (user == null)
        {
            return new AuthenticationResult { Success = false, ErrorMessage = "Không tìm thấy người dùng" };
        }

        // Kiểm tra mật khẩu
        if (!BCrypt.Net.BCrypt.Verify(password, user.PasswordHash))
        {
            return new AuthenticationResult { Success = false, ErrorMessage = "Mật khẩu không đúng" };
        }

        // Tạo token JWT
        var token = _tokenService.GenerateJwtToken(user);
        
        return new AuthenticationResult
        {
            Success = true,
            Token = token,
            UserId = user.Id,
            Email = user.Email,
            Role = user.Role
        };
    }

    /// <summary>
    /// Đăng ký người dùng mới
    /// </summary>
    /// <param name="name">Tên người dùng</param>
    /// <param name="email">Email</param>
    /// <param name="password">Mật khẩu</param>
    /// <param name="role">Vai trò (admin, employee, customer)</param>
    /// <returns>Kết quả đăng ký</returns>
    public async Task<RegistrationResult> RegisterUserAsync(string name, string email, string password, string role)
    {
        // Kiểm tra email đã tồn tại chưa
        var existingUser = await _userRepository.GetByEmailAsync(email);
        
        if (existingUser != null)
        {
            return new RegistrationResult { Success = false, ErrorMessage = "Email đã được sử dụng" };
        }

        // Mã hóa mật khẩu
        var passwordHash = BCrypt.Net.BCrypt.HashPassword(password);
        
        // Tạo người dùng mới
        var user = new User
        {
            Name = name,
            Email = email,
            PasswordHash = passwordHash,
            Role = role,
            CreatedAt = DateTime.UtcNow
        };

        // Lưu vào cơ sở dữ liệu
        var userId = await _userRepository.CreateAsync(user);
        
        return new RegistrationResult
        {
            Success = true,
            UserId = userId
        };
    }
    
    /// <summary>
    /// Tạo token đặt lại mật khẩu
    /// </summary>
    /// <param name="userId">ID người dùng</param>
    /// <returns>Token đặt lại mật khẩu</returns>
    public async Task<string> GeneratePasswordResetTokenAsync(int userId)
    {
        // Kiểm tra người dùng tồn tại
        var user = await _userRepository.GetByIdAsync(userId);
        if (user == null)
        {
            throw new ArgumentException("Không tìm thấy người dùng");
        }
        
        // Tạo token đặt lại mật khẩu
        return await _tokenService.GeneratePasswordResetTokenAsync(userId);
    }
    
    /// <summary>
    /// Đặt lại mật khẩu
    /// </summary>
    /// <param name="token">Token đặt lại mật khẩu</param>
    /// <param name="newPassword">Mật khẩu mới</param>
    /// <returns>Kết quả đặt lại mật khẩu</returns>
    public async Task<PasswordResetResult> ResetPasswordAsync(string token, string newPassword)
    {
        // Xác thực token
        var isValid = await _tokenService.ValidatePasswordResetTokenAsync(token);
        if (!isValid)
        {
            return new PasswordResetResult { Success = false, ErrorMessage = "Token không hợp lệ hoặc đã hết hạn" };
        }
        
        // Lấy ID người dùng từ token
        var userId = await _userRepository.GetUserIdFromResetTokenAsync(token);
        if (userId == 0)
        {
            return new PasswordResetResult { Success = false, ErrorMessage = "Không tìm thấy người dùng" };
        }
        
        // Lấy thông tin người dùng
        var user = await _userRepository.GetByIdAsync(userId);
        if (user == null)
        {
            return new PasswordResetResult { Success = false, ErrorMessage = "Không tìm thấy người dùng" };
        }
        
        // Mã hóa mật khẩu mới
        var passwordHash = BCrypt.Net.BCrypt.HashPassword(newPassword);
        
        // Cập nhật mật khẩu
        user.PasswordHash = passwordHash;
        user.UpdatedAt = DateTime.UtcNow;
        
        await _userRepository.UpdateAsync(user);
        
        return new PasswordResetResult { Success = true };
    }
    
    /// <summary>
    /// Thay đổi mật khẩu
    /// </summary>
    /// <param name="userId">ID người dùng</param>
    /// <param name="currentPassword">Mật khẩu hiện tại</param>
    /// <param name="newPassword">Mật khẩu mới</param>
    /// <returns>Kết quả thay đổi mật khẩu</returns>
    public async Task<PasswordChangeResult> ChangePasswordAsync(int userId, string currentPassword, string newPassword)
    {
        // Lấy thông tin người dùng
        var user = await _userRepository.GetByIdAsync(userId);
        if (user == null)
        {
            return new PasswordChangeResult { Success = false, ErrorMessage = "Không tìm thấy người dùng" };
        }
        
        // Kiểm tra mật khẩu hiện tại
        if (!BCrypt.Net.BCrypt.Verify(currentPassword, user.PasswordHash))
        {
            return new PasswordChangeResult { Success = false, ErrorMessage = "Mật khẩu hiện tại không đúng" };
        }
        
        // Mã hóa mật khẩu mới
        var passwordHash = BCrypt.Net.BCrypt.HashPassword(newPassword);
        
        // Cập nhật mật khẩu
        user.PasswordHash = passwordHash;
        user.UpdatedAt = DateTime.UtcNow;
        
        await _userRepository.UpdateAsync(user);
        
        return new PasswordChangeResult { Success = true };
    }
}
