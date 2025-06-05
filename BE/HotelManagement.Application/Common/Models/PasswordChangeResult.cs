namespace HotelManagement.Application.Common.Models;

/// <summary>
/// Kết quả thay đổi mật khẩu
/// </summary>
public class PasswordChangeResult
{
    public bool Success { get; set; }
    public string? ErrorMessage { get; set; }
}
