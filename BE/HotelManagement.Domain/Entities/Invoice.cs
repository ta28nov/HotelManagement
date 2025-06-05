namespace HotelManagement.Domain.Entities;

public class Invoice
{
    public int Id { get; set; }
    public int BookingId { get; set; }
    public string InvoiceNumber { get; set; } = string.Empty;
    public DateTime IssuedDate { get; set; } = DateTime.UtcNow;
    public decimal TotalAmount { get; set; }
    public decimal Tax { get; set; }
    public string Status { get; set; } = string.Empty;
    
    // Navigation properties
    public Booking? Booking { get; set; }
    public ICollection<InvoiceItem>? InvoiceItems { get; set; }
}
