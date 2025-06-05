using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using HotelManagement.Application.Common.Interfaces;
using HotelManagement.Domain.Entities;
using Microsoft.Extensions.Caching.Distributed;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace HotelManagement.Infrastructure.Identity;

/// <summary>
/// Dịch vụ tạo và quản lý JWT token
/// </summary>
public class TokenService : ITokenService
{
    private readonly IConfiguration _configuration;
    private readonly IDistributedCache _cache;

    public TokenService(IConfiguration configuration, IDistributedCache cache)
    {
        _configuration = configuration;
        _cache = cache;
    }

    /// <summary>
    /// Tạo JWT token cho người dùng
    /// </summary>
    /// <param name="user">Thông tin người dùng</param>
    /// <returns>JWT token dạng chuỗi</returns>
    public string GenerateJwtToken(User user)
    {
        // Lấy khóa bí mật từ cấu hình
        var key = Encoding.ASCII.GetBytes(_configuration["JwtSettings:Key"]!);
        var tokenHandler = new JwtSecurityTokenHandler();
        
        // Tạo danh sách claims
        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.Name, user.Name),
            new Claim(ClaimTypes.Role, user.Role)
        };

        // Cấu hình token
        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(claims),
            Expires = DateTime.UtcNow.AddMinutes(double.Parse(_configuration["JwtSettings:DurationInMinutes"]!)),
            SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature),
            Issuer = _configuration["JwtSettings:Issuer"],
            Audience = _configuration["JwtSettings:Audience"]
        };

        // Tạo token
        var token = tokenHandler.CreateToken(tokenDescriptor);
        return tokenHandler.WriteToken(token);
    }
    
    /// <summary>
    /// Kiểm tra token có trong danh sách đen không
    /// </summary>
    /// <param name="token">JWT token cần kiểm tra</param>
    /// <returns>True nếu token đã bị vô hiệu hóa, ngược lại là False</returns>
    public async Task<bool> IsTokenBlacklistedAsync(string token)
    {
        // Kiểm tra token trong cache
        var cachedToken = await _cache.GetStringAsync($"blacklist_{token}");
        return cachedToken != null;
    }
    
    /// <summary>
    /// Thêm token vào danh sách đen
    /// </summary>
    /// <param name="token">JWT token cần vô hiệu hóa</param>
    public async Task BlacklistTokenAsync(string token)
    {
        // Phân tích token để lấy thời gian hết hạn
        var tokenHandler = new JwtSecurityTokenHandler();
        var jwtToken = tokenHandler.ReadJwtToken(token);
        var expiry = jwtToken.ValidTo;
        
        // Tính thời gian còn lại của token
        var timeToExpiry = expiry - DateTime.UtcNow;
        if (timeToExpiry.TotalSeconds <= 0)
        {
            // Token đã hết hạn, không cần thêm vào blacklist
            return;
        }
        
        // Lưu token vào cache với thời gian hết hạn tương ứng
        var cacheOptions = new DistributedCacheEntryOptions
        {
            AbsoluteExpirationRelativeToNow = timeToExpiry
        };
        
        await _cache.SetStringAsync($"blacklist_{token}", "revoked", cacheOptions);
    }
    
    /// <summary>
    /// Tạo token đặt lại mật khẩu
    /// </summary>
    /// <param name="userId">ID người dùng</param>
    /// <returns>Token đặt lại mật khẩu</returns>
    public async Task<string> GeneratePasswordResetTokenAsync(int userId)
    {
        // Tạo token ngẫu nhiên
        var token = Guid.NewGuid().ToString("N");
        
        // Lưu token vào cache với thời gian hết hạn 24 giờ
        var cacheOptions = new DistributedCacheEntryOptions
        {
            AbsoluteExpirationRelativeToNow = TimeSpan.FromHours(24)
        };
        
        await _cache.SetStringAsync($"reset_{token}", userId.ToString(), cacheOptions);
        
        return token;
    }
    
    /// <summary>
    /// Xác thực token đặt lại mật khẩu
    /// </summary>
    /// <param name="token">Token cần xác thực</param>
    /// <returns>True nếu token hợp lệ, ngược lại là False</returns>
    public async Task<bool> ValidatePasswordResetTokenAsync(string token)
    {
        // Kiểm tra token trong cache
        var userId = await _cache.GetStringAsync($"reset_{token}");
        return userId != null;
    }
}
