namespace HotelManagement.Domain.Entities;

public class BookingService
{
    public int Id { get; set; }
    public int BookingId { get; set; }
    public int ServiceId { get; set; }
    public int Quantity { get; set; } = 1;
    public decimal Price { get; set; }
    public DateTime ServiceDate { get; set; } = DateTime.UtcNow;
    
    // Navigation properties
    public Booking? Booking { get; set; }
    public Service? Service { get; set; }
}
