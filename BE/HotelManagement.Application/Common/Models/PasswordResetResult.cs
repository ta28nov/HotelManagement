namespace HotelManagement.Application.Common.Models;

/// <summary>
/// Kết quả đặt lại mật khẩu
/// </summary>
public class PasswordResetResult
{
    public bool Success { get; set; }
    public string? ErrorMessage { get; set; }
}
