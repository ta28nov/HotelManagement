using HotelManagement.Domain.Entities;

namespace HotelManagement.Application.Common.Interfaces;

/// <summary>
/// Interface cho repository người dùng
/// </summary>
public interface IUserRepository
{
    /// <summary>
    /// Lấy tất cả người dùng
    /// </summary>
    Task<IEnumerable<User>> GetAllAsync();
    
    /// <summary>
    /// Lấy người dùng theo ID
    /// </summary>
    Task<User?> GetByIdAsync(int id);
    
    /// <summary>
    /// Lấy người dùng theo email
    /// </summary>
    Task<User?> GetByEmailAsync(string email);
    
    /// <summary>
    /// Lấy ID người dùng từ token đặt lại mật khẩu
    /// </summary>
    Task<int> GetUserIdFromResetTokenAsync(string token);
    
    /// <summary>
    /// Tạo người dùng mới
    /// </summary>
    Task<int> CreateAsync(User user);
    
    /// <summary>
    /// Cập nhật người dùng
    /// </summary>
    Task UpdateAsync(User user);
    
    /// <summary>
    /// Xóa người dùng
    /// </summary>
    Task DeleteAsync(int id);
}
