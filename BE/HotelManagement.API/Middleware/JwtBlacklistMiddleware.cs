using System.IdentityModel.Tokens.Jwt;
using HotelManagement.Application.Common.Interfaces;

namespace HotelManagement.API.Middleware;

/// <summary>
/// Middleware kiểm tra token JWT có trong danh sách đen không
/// </summary>
public class JwtBlacklistMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<JwtBlacklistMiddleware> _logger;

    public JwtBlacklistMiddleware(RequestDelegate next, ILogger<JwtBlacklistMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    /// <summary>
    /// Xử lý request và kiểm tra token
    /// </summary>
    public async Task InvokeAsync(HttpContext context, ITokenService tokenService)
    {
        // Lấy token từ header Authorization
        var authHeader = context.Request.Headers["Authorization"].FirstOrDefault();
        
        if (authHeader != null && authHeader.StartsWith("Bearer "))
        {
            var token = authHeader.Substring("Bearer ".Length).Trim();
            
            try
            {
                // Kiểm tra token có trong danh sách đen không
                var isBlacklisted = await tokenService.IsTokenBlacklistedAsync(token);
                
                if (isBlacklisted)
                {
                    // Nếu token đã bị vô hiệu hóa, trả về lỗi Unauthorized
                    _logger.LogWarning("Phát hiện token đã bị vô hiệu hóa");
                    context.Response.StatusCode = 401;
                    await context.Response.WriteAsJsonAsync(new { message = "Token đã hết hạn hoặc bị vô hiệu hóa" });
                    return;
                }
            }
            catch (Exception ex)
            {
                // Ghi log lỗi
                _logger.LogError(ex, "Lỗi khi kiểm tra token trong danh sách đen");
            }
        }
        
        // Tiếp tục xử lý request
        await _next(context);
    }
}

/// <summary>
/// Extension method để thêm middleware vào pipeline
/// </summary>
public static class JwtBlacklistMiddlewareExtensions
{
    public static IApplicationBuilder UseJwtBlacklist(this IApplicationBuilder builder)
    {
        return builder.UseMiddleware<JwtBlacklistMiddleware>();
    }
}
