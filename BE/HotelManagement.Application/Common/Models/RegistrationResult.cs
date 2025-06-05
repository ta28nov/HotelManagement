namespace HotelManagement.Application.Common.Models;

public class RegistrationResult
{
    public bool Success { get; set; }
    public string? ErrorMessage { get; set; }
    public int UserId { get; set; }
}
