using HotelManagement.Application.Common.Interfaces;
using HotelManagement.Domain.Entities;
using HotelManagement.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace HotelManagement.Infrastructure.Repositories;

/// <summary>
/// Repository xử lý các thao tác với hóa đơn
/// </summary>
public class InvoiceRepository : IInvoiceRepository
{
    private readonly HotelDbContext _context;

    public InvoiceRepository(HotelDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// Lấy tất cả hóa đơn
    /// </summary>
    public async Task<IEnumerable<Invoice>> GetAllAsync()
    {
        return await _context.Invoices
            .Include(i => i.Booking)
            .Include(i => i.InvoiceItems)
            .ToListAsync();
    }

    /// <summary>
    /// Lấy hóa đơn theo ID
    /// </summary>
    public async Task<Invoice?> GetByIdAsync(int id)
    {
        return await _context.Invoices
            .Include(i => i.Booking)
            .Include(i => i.InvoiceItems)
            .FirstOrDefaultAsync(i => i.Id == id);
    }

    /// <summary>
    /// Lấy hóa đơn theo ID đặt phòng
    /// </summary>
    public async Task<Invoice?> GetByBookingIdAsync(int bookingId)
    {
        return await _context.Invoices
            .Include(i => i.Booking)
            .Include(i => i.InvoiceItems)
            .FirstOrDefaultAsync(i => i.BookingId == bookingId);
    }

    /// <summary>
    /// Tạo hóa đơn mới
    /// </summary>
    public async Task<int> CreateAsync(Invoice invoice)
    {
        _context.Invoices.Add(invoice);
        await _context.SaveChangesAsync();
        return invoice.Id;
    }

    /// <summary>
    /// Cập nhật hóa đơn
    /// </summary>
    public async Task UpdateAsync(Invoice invoice)
    {
        _context.Invoices.Update(invoice);
        await _context.SaveChangesAsync();
    }

    /// <summary>
    /// Xóa hóa đơn
    /// </summary>
    public async Task DeleteAsync(int id)
    {
        var invoice = await _context.Invoices.FindAsync(id);
        if (invoice != null)
        {
            _context.Invoices.Remove(invoice);
            await _context.SaveChangesAsync();
        }
    }

    /// <summary>
    /// Thêm mục hóa đơn
    /// </summary>
    public async Task AddInvoiceItemAsync(InvoiceItem item)
    {
        _context.InvoiceItems.Add(item);
        await _context.SaveChangesAsync();
    }

    /// <summary>
    /// Xóa mục hóa đơn
    /// </summary>
    public async Task RemoveInvoiceItemAsync(int itemId)
    {
        var item = await _context.InvoiceItems.FindAsync(itemId);
        if (item != null)
        {
            _context.InvoiceItems.Remove(item);
            await _context.SaveChangesAsync();
        }
    }

    /// <summary>
    /// Tạo số hóa đơn mới
    /// </summary>
    public async Task<string> GenerateInvoiceNumberAsync()
    {
        var today = DateTime.Today;
        var year = today.Year;
        var month = today.Month;
        
        // Đếm số hóa đơn trong tháng hiện tại
        var count = await _context.Invoices
            .CountAsync(i => i.IssuedDate.Year == year && i.IssuedDate.Month == month);
        
        // Tạo số hóa đơn theo định dạng INV-YYYYMM-XXXXX
        return $"INV-{year}{month:D2}-{(count + 1):D5}";
    }
}
