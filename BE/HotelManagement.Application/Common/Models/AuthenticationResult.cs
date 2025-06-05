namespace HotelManagement.Application.Common.Models;

public class AuthenticationResult
{
    public bool Success { get; set; }
    public string? ErrorMessage { get; set; }
    public string? Token { get; set; }
    public int UserId { get; set; }
    public string? Email { get; set; }
    public string? Role { get; set; }
}
