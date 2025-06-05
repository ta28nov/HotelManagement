namespace HotelManagement.Domain.Entities;

public class Room
{
    public int Id { get; set; }
    public string RoomNumber { get; set; } = string.Empty;
    public int RoomTypeId { get; set; }
    public string Status { get; set; } = string.Empty;
    public int Floor { get; set; }
    
    // Navigation properties
    public RoomType? RoomType { get; set; }
    public ICollection<Booking>? Bookings { get; set; }
}
