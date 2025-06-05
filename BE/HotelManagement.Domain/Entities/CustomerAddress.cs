namespace HotelManagement.Domain.Entities;

public class CustomerAddress
{
    public int Id { get; set; }
    public int CustomerId { get; set; }
    public string AddressType { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public string? State { get; set; }
    public string? PostalCode { get; set; }
    public string Country { get; set; } = string.Empty;
    public bool IsDefault { get; set; }
    
    // Navigation properties
    public Customer? Customer { get; set; }
}
