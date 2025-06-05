namespace HotelManagement.Domain.Entities;

public class Booking
{
    public int Id { get; set; }
    public int CustomerId { get; set; }
    public int RoomId { get; set; }
    public DateTime CheckInDate { get; set; }
    public DateTime CheckOutDate { get; set; }
    public int Adults { get; set; } = 1;
    public int Children { get; set; } = 0;
    public decimal TotalAmount { get; set; }
    public string Status { get; set; } = string.Empty;
    public string PaymentStatus { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    // Navigation properties
    public Customer? Customer { get; set; }
    public Room? Room { get; set; }
    public Invoice? Invoice { get; set; }
    public ICollection<BookingHistory>? BookingHistories { get; set; }
    public ICollection<BookingService>? BookingServices { get; set; }
    public ICollection<Review>? Reviews { get; set; }
}
