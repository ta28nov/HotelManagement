namespace HotelManagement.Domain.Entities;

public class Service
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public int CategoryId { get; set; }
    public string? Description { get; set; }
    public decimal Price { get; set; }
    public bool IsAvailable { get; set; } = true;
    public string? ImageUrl { get; set; }
    
    // Navigation properties
    public ServiceCategory? Category { get; set; }
    public ICollection<BookingService>? BookingServices { get; set; }
}
