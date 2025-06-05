using System.Security.Claims;
using HotelManagement.API.Models;
using HotelManagement.Application.Common.Interfaces;
using HotelManagement.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HotelManagement.API.Controllers;

/// <summary>
/// Controller xử lý các API liên quan đến quản lý người dùng
/// </summary>
[ApiController]
[Route("api/users")]
public class UsersController : ControllerBase
{
    private readonly IUserRepository _userRepository;
    private readonly IIdentityService _identityService;
    private readonly ILogger<UsersController> _logger;

    public UsersController(
        IUserRepository userRepository,
        IIdentityService identityService,
        ILogger<UsersController> logger)
    {
        _userRepository = userRepository;
        _identityService = identityService;
        _logger = logger;
    }

    /// <summary>
    /// API lấy danh sách người dùng
    /// </summary>
    /// <returns>Danh sách người dùng</returns>
    [HttpGet]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> GetAllUsers()
    {
        var users = await _userRepository.GetAllAsync();
        
        var result = users.Select(u => new UserDto
        {
            Id = u.Id,
            Name = u.Name,
            Email = u.Email,
            PhoneNumber = u.PhoneNumber,
            Role = u.Role,
            CreatedAt = u.CreatedAt
        });
        
        return Ok(result);
    }

    /// <summary>
    /// API lấy thông tin người dùng theo ID
    /// </summary>
    /// <param name="id">ID người dùng</param>
    /// <returns>Thông tin người dùng</returns>
    [HttpGet("{id}")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> GetUserById(int id)
    {
        var user = await _userRepository.GetByIdAsync(id);
        
        if (user == null)
        {
            return NotFound(new { message = "Không tìm thấy người dùng" });
        }
        
        var result = new UserDto
        {
            Id = user.Id,
            Name = user.Name,
            Email = user.Email,
            PhoneNumber = user.PhoneNumber,
            Role = user.Role,
            CreatedAt = user.CreatedAt
        };
        
        return Ok(result);
    }

    /// <summary>
    /// API tạo người dùng mới
    /// </summary>
    /// <param name="request">Thông tin người dùng mới</param>
    /// <returns>Kết quả tạo người dùng</returns>
    [HttpPost]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> CreateUser([FromBody] CreateUserRequest request)
    {
        // Đăng ký người dùng mới
        var result = await _identityService.RegisterUserAsync(
            request.Name,
            request.Email,
            request.Password,
            request.Role);
            
        if (!result.Success)
        {
            return BadRequest(new { message = result.ErrorMessage });
        }
        
        _logger.LogInformation("Người dùng mới được tạo: {Email}, Vai trò: {Role}", request.Email, request.Role);
        
        return CreatedAtAction(nameof(GetUserById), new { id = result.UserId }, new
        {
            userId = result.UserId,
            message = "Tạo người dùng thành công"
        });
    }

    /// <summary>
    /// API cập nhật thông tin người dùng
    /// </summary>
    /// <param name="id">ID người dùng</param>
    /// <param name="request">Thông tin cập nhật</param>
    /// <returns>Kết quả cập nhật</returns>
    [HttpPut("{id}")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> UpdateUser(int id, [FromBody] UpdateUserRequest request)
    {
        // Kiểm tra người dùng tồn tại
        var user = await _userRepository.GetByIdAsync(id);
        if (user == null)
        {
            return NotFound(new { message = "Không tìm thấy người dùng" });
        }
        
        // Cập nhật thông tin
        if (!string.IsNullOrEmpty(request.Name))
        {
            user.Name = request.Name;
        }
        
        if (!string.IsNullOrEmpty(request.PhoneNumber))
        {
            user.PhoneNumber = request.PhoneNumber;
        }
        
        if (!string.IsNullOrEmpty(request.Role))
        {
            user.Role = request.Role;
        }
        
        user.UpdatedAt = DateTime.UtcNow;
        
        await _userRepository.UpdateAsync(user);
        
        _logger.LogInformation("Cập nhật thông tin người dùng: {UserId}", id);
        
        return Ok(new { message = "Cập nhật người dùng thành công" });
    }

    /// <summary>
    /// API xóa người dùng
    /// </summary>
    /// <param name="id">ID người dùng</param>
    /// <returns>Kết quả xóa</returns>
    [HttpDelete("{id}")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> DeleteUser(int id)
    {
        // Kiểm tra người dùng tồn tại
        var user = await _userRepository.GetByIdAsync(id);
        if (user == null)
        {
            return NotFound(new { message = "Không tìm thấy người dùng" });
        }
        
        await _userRepository.DeleteAsync(id);
        
        _logger.LogInformation("Xóa người dùng: {UserId}", id);
        
        return Ok(new { message = "Xóa người dùng thành công" });
    }

    /// <summary>
    /// API cập nhật thông tin cá nhân
    /// </summary>
    /// <param name="request">Thông tin cập nhật</param>
    /// <returns>Kết quả cập nhật</returns>
    [HttpPut("profile")]
    [Authorize]
    public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileRequest request)
    {
        // Lấy ID người dùng từ token
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
        if (userIdClaim == null)
        {
            return Unauthorized(new { message = "Token không hợp lệ" });
        }

        var userId = int.Parse(userIdClaim.Value);
        
        // Kiểm tra người dùng tồn tại
        var user = await _userRepository.GetByIdAsync(userId);
        if (user == null)
        {
            return NotFound(new { message = "Không tìm thấy người dùng" });
        }
        
        // Cập nhật thông tin
        if (!string.IsNullOrEmpty(request.Name))
        {
            user.Name = request.Name;
        }
        
        if (!string.IsNullOrEmpty(request.PhoneNumber))
        {
            user.PhoneNumber = request.PhoneNumber;
        }
        
        user.UpdatedAt = DateTime.UtcNow;
        
        await _userRepository.UpdateAsync(user);
        
        _logger.LogInformation("Cập nhật thông tin cá nhân: {UserId}", userId);
        
        return Ok(new { message = "Cập nhật thông tin cá nhân thành công" });
    }
}
