namespace HotelManagement.Domain.Entities;

public class BookingHistory
{
    public int Id { get; set; }
    public int BookingId { get; set; }
    public string Status { get; set; } = string.Empty;
    public string? PaymentStatus { get; set; }
    public DateTime ChangedAt { get; set; } = DateTime.UtcNow;
    public int? ChangedBy { get; set; }
    public string? Notes { get; set; }
    
    // Navigation properties
    public Booking? Booking { get; set; }
    public User? User { get; set; }
}
