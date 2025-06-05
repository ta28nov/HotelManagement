using HotelManagement.Application.Common.Interfaces;
using HotelManagement.API.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using Microsoft.AspNetCore.Hosting;

namespace HotelManagement.API.Controllers;

/// <summary>
/// Controller xử lý các API liên quan đến xác thực và quản lý tài khoản
/// </summary>
[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly IIdentityService _identityService;
    private readonly ITokenService _tokenService;
    private readonly IUserRepository _userRepository;
    private readonly ILogger<AuthController> _logger;
    private readonly IWebHostEnvironment _environment;

    public AuthController(
        IIdentityService identityService,
        ITokenService tokenService,
        IUserRepository userRepository,
        ILogger<AuthController> logger,
        IWebHostEnvironment environment)
    {
        _identityService = identityService;
        _tokenService = tokenService;
        _userRepository = userRepository;
        _logger = logger;
        _environment = environment;
    }

    /// <summary>
    /// API đăng nhập và lấy JWT token
    /// </summary>
    /// <param name="request">Thông tin đăng nhập</param>
    /// <returns>JWT token và thông tin người dùng</returns>
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        // Xác thực người dùng
        var result = await _identityService.AuthenticateAsync(request.Email, request.Password);

        if (!result.Success)
        {
            _logger.LogWarning("Đăng nhập thất bại cho email: {Email}", request.Email);
            return Unauthorized(new { message = result.ErrorMessage });
        }

        _logger.LogInformation("Đăng nhập thành công cho email: {Email}", request.Email);
        
        return Ok(new
        {
            token = result.Token,
            userId = result.UserId,
            email = result.Email,
            role = result.Role
        });
    }

    /// <summary>
    /// API đăng ký người dùng mới
    /// </summary>
    /// <param name="request">Thông tin đăng ký</param>
    /// <returns>Kết quả đăng ký</returns>
    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
        // Đăng ký người dùng mới
        var result = await _identityService.RegisterUserAsync(
            request.Name,
            request.Email,
            request.Password,
            request.Role ?? "customer");

        if (!result.Success)
        {
            _logger.LogWarning("Đăng ký thất bại cho email: {Email}", request.Email);
            return BadRequest(new { message = result.ErrorMessage });
        }

        _logger.LogInformation("Đăng ký thành công cho email: {Email}", request.Email);
        
        return Ok(new
        {
            userId = result.UserId,
            message = "Đăng ký thành công"
        });
    }

    /// <summary>
    /// API lấy thông tin người dùng hiện tại
    /// </summary>
    /// <returns>Thông tin người dùng</returns>
    [HttpGet("me")]
    [Authorize]
    public async Task<IActionResult> GetCurrentUser()
    {
        // Lấy ID người dùng từ token
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
        if (userIdClaim == null)
        {
            return Unauthorized(new { message = "Token không hợp lệ" });
        }

        var userId = int.Parse(userIdClaim.Value);
        
        // Lấy thông tin người dùng
        var user = await _userRepository.GetByIdAsync(userId);
        if (user == null)
        {
            return NotFound(new { message = "Không tìm thấy người dùng" });
        }

        return Ok(new
        {
            id = user.Id,
            name = user.Name,
            email = user.Email,
            role = user.Role,
            phoneNumber = user.PhoneNumber
        });
    }

    /// <summary>
    /// API đăng xuất người dùng
    /// </summary>
    /// <returns>Kết quả đăng xuất</returns>
    [HttpPost("logout")]
    [Authorize]
    public async Task<IActionResult> Logout()
    {
        // Lấy token từ header
        var authHeader = HttpContext.Request.Headers["Authorization"].FirstOrDefault();
        if (authHeader != null && authHeader.StartsWith("Bearer "))
        {
            var token = authHeader.Substring("Bearer ".Length).Trim();
            
            // Thêm token vào blacklist
            await _tokenService.BlacklistTokenAsync(token);
            
            _logger.LogInformation("Đăng xuất thành công cho người dùng: {UserId}", 
                User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
            
            return Ok(new { message = "Đăng xuất thành công" });
        }
        
        return BadRequest(new { message = "Token không hợp lệ" });
    }

    /// <summary>
    /// API gửi yêu cầu đặt lại mật khẩu
    /// </summary>
    /// <param name="request">Email người dùng</param>
    /// <returns>Kết quả yêu cầu</returns>
    [HttpPost("forgot-password")]
    public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequest request)
    {
        // Tìm người dùng theo email
        var user = await _userRepository.GetByEmailAsync(request.Email);
        if (user == null)
        {
            // Trả về thành công ngay cả khi không tìm thấy email để tránh lộ thông tin
            return Ok(new { message = "Nếu email tồn tại, hướng dẫn đặt lại mật khẩu sẽ được gửi" });
        }

        // Tạo token đặt lại mật khẩu
        var token = await _identityService.GeneratePasswordResetTokenAsync(user.Id);
        
        // TODO: Gửi email với token đặt lại mật khẩu
        // Trong môi trường thực tế, cần tích hợp dịch vụ gửi email
        _logger.LogInformation("Token đặt lại mật khẩu cho email {Email}: {Token}", request.Email, token);
        
        return Ok(new { 
            message = "Hướng dẫn đặt lại mật khẩu đã được gửi đến email của bạn",
            // Chỉ trả về token trong môi trường phát triển
            token = _environment.IsDevelopment() ? token : null
        });
    }

    /// <summary>
    /// API đặt lại mật khẩu
    /// </summary>
    /// <param name="request">Token và mật khẩu mới</param>
    /// <returns>Kết quả đặt lại mật khẩu</returns>
    [HttpPost("reset-password")]
    public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequest request)
    {
        // Đặt lại mật khẩu
        var result = await _identityService.ResetPasswordAsync(request.Token, request.NewPassword);
        
        if (!result.Success)
        {
            return BadRequest(new { message = result.ErrorMessage });
        }
        
        return Ok(new { message = "Đặt lại mật khẩu thành công" });
    }

    /// <summary>
    /// API thay đổi mật khẩu
    /// </summary>
    /// <param name="request">Mật khẩu hiện tại và mật khẩu mới</param>
    /// <returns>Kết quả thay đổi mật khẩu</returns>
    [HttpPut("change-password")]
    [Authorize]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest request)
    {
        // Lấy ID người dùng từ token
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
        if (userIdClaim == null)
        {
            return Unauthorized(new { message = "Token không hợp lệ" });
        }

        var userId = int.Parse(userIdClaim.Value);
        
        // Thay đổi mật khẩu
        var result = await _identityService.ChangePasswordAsync(
            userId, 
            request.CurrentPassword, 
            request.NewPassword);
            
        if (!result.Success)
        {
            return BadRequest(new { message = result.ErrorMessage });
        }
        
        return Ok(new { message = "Thay đổi mật khẩu thành công" });
    }
}
