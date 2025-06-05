namespace HotelManagement.Domain.Entities;

public class Review
{
    public int Id { get; set; }
    public int BookingId { get; set; }
    public int Rating { get; set; }
    public string? Comment { get; set; }
    public DateTime ReviewDate { get; set; } = DateTime.UtcNow;
    
    // Navigation properties
    public Booking? Booking { get; set; }
}
