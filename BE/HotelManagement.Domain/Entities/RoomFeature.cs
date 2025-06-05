namespace HotelManagement.Domain.Entities;

public class RoomFeature
{
    public int Id { get; set; }
    public int RoomTypeId { get; set; }
    public string FeatureType { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Value { get; set; }
    public bool IsPrimary { get; set; }
    
    // Navigation properties
    public RoomType? RoomType { get; set; }
}
