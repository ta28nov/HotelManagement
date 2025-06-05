namespace HotelManagement.Domain.Entities;

public class Customer
{
    public int Id { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string PhoneNumber { get; set; } = string.Empty;
    public string? IdNumber { get; set; }
    public string? Nationality { get; set; }
    public int? UserId { get; set; }
    
    // Navigation properties
    public User? User { get; set; }
    public ICollection<CustomerAddress>? Addresses { get; set; }
    public ICollection<Booking>? Bookings { get; set; }
}
