using HotelManagement.Domain.Entities;

namespace HotelManagement.Application.Common.Interfaces;

/// <summary>
/// Interface cho repository hóa đơn
/// </summary>
public interface IInvoiceRepository
{
    Task<IEnumerable<Invoice>> GetAllAsync();
    Task<Invoice?> GetByIdAsync(int id);
    Task<Invoice?> GetByBookingIdAsync(int bookingId);
    Task<int> CreateAsync(Invoice invoice);
    Task UpdateAsync(Invoice invoice);
    Task DeleteAsync(int id);
    Task AddInvoiceItemAsync(InvoiceItem item);
    Task RemoveInvoiceItemAsync(int itemId);
    Task<string> GenerateInvoiceNumberAsync();
}
