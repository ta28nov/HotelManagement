namespace HotelManagement.Domain.Entities;

public class ServiceCategory
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    
    // Navigation properties
    public ICollection<Service>? Services { get; set; }
}
