namespace HotelManagement.Domain.Entities;

public class RoomType
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public decimal BasePrice { get; set; }
    public int Capacity { get; set; }
    
    // Navigation properties
    public ICollection<Room>? Rooms { get; set; }
    public ICollection<RoomFeature>? RoomFeatures { get; set; }
}
