using HotelManagement.Application.Common.Interfaces;
using HotelManagement.Domain.Entities;
using HotelManagement.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Distributed;

namespace HotelManagement.Infrastructure.Repositories;

/// <summary>
/// Repository xử lý các thao tác với người dùng
/// </summary>
public class UserRepository : IUserRepository
{
    private readonly HotelDbContext _context;
    private readonly IDistributedCache _cache;

    public UserRepository(HotelDbContext context, IDistributedCache cache)
    {
        _context = context;
        _cache = cache;
    }

    /// <summary>
    /// Lấy tất cả người dùng
    /// </summary>
    public async Task<IEnumerable<User>> GetAllAsync()
    {
        return await _context.Users.ToListAsync();
    }

    /// <summary>
    /// Lấy người dùng theo ID
    /// </summary>
    public async Task<User?> GetByIdAsync(int id)
    {
        return await _context.Users.FindAsync(id);
    }

    /// <summary>
    /// Lấy người dùng theo email
    /// </summary>
    public async Task<User?> GetByEmailAsync(string email)
    {
        return await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
    }
    
    /// <summary>
    /// Lấy ID người dùng từ token đặt lại mật khẩu
    /// </summary>
    public async Task<int> GetUserIdFromResetTokenAsync(string token)
    {
        var userIdString = await _cache.GetStringAsync($"reset_{token}");
        if (string.IsNullOrEmpty(userIdString))
        {
            return 0;
        }
        
        return int.Parse(userIdString);
    }

    /// <summary>
    /// Tạo người dùng mới
    /// </summary>
    public async Task<int> CreateAsync(User user)
    {
        _context.Users.Add(user);
        await _context.SaveChangesAsync();
        return user.Id;
    }

    /// <summary>
    /// Cập nhật người dùng
    /// </summary>
    public async Task UpdateAsync(User user)
    {
        user.UpdatedAt = DateTime.UtcNow;
        _context.Users.Update(user);
        await _context.SaveChangesAsync();
    }

    /// <summary>
    /// Xóa người dùng
    /// </summary>
    public async Task DeleteAsync(int id)
    {
        var user = await _context.Users.FindAsync(id);
        if (user != null)
        {
            _context.Users.Remove(user);
            await _context.SaveChangesAsync();
        }
    }
}
