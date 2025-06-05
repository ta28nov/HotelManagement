using HotelManagement.Application.Common.Interfaces;
using HotelManagement.Domain.Entities;
using HotelManagement.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace HotelManagement.Infrastructure.Repositories;

/// <summary>
/// Repository xử lý các thao tác với đặt phòng
/// </summary>
public class BookingRepository : IBookingRepository
{
    private readonly HotelDbContext _context;

    public BookingRepository(HotelDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// Lấy tất cả đặt phòng
    /// </summary>
    public async Task<IEnumerable<Booking>> GetAllAsync()
    {
        return await _context.Bookings
            .Include(b => b.Customer)
            .Include(b => b.Room)
                .ThenInclude(r => r.RoomType)
            .Include(b => b.BookingServices)
                .ThenInclude(bs => bs.Service)
            .Include(b => b.BookingHistories)
                .ThenInclude(bh => bh.User)
            .ToListAsync();
    }

    /// <summary>
    /// Lấy đặt phòng theo ID
    /// </summary>
    public async Task<Booking?> GetByIdAsync(int id)
    {
        return await _context.Bookings
            .Include(b => b.Customer)
            .Include(b => b.Room)
                .ThenInclude(r => r.RoomType)
            .Include(b => b.BookingServices)
                .ThenInclude(bs => bs.Service)
            .Include(b => b.BookingHistories)
                .ThenInclude(bh => bh.User)
            .FirstOrDefaultAsync(b => b.Id == id);
    }

    /// <summary>
    /// Lấy đặt phòng theo ID khách hàng
    /// </summary>
    public async Task<IEnumerable<Booking>> GetByCustomerIdAsync(int customerId)
    {
        return await _context.Bookings
            .Include(b => b.Customer)
            .Include(b => b.Room)
                .ThenInclude(r => r.RoomType)
            .Include(b => b.BookingServices)
                .ThenInclude(bs => bs.Service)
            .Include(b => b.BookingHistories)
                .ThenInclude(bh => bh.User)
            .Where(b => b.CustomerId == customerId)
            .ToListAsync();
    }
    
    /// <summary>
    /// Lọc đặt phòng theo nhiều tiêu chí
    /// </summary>
    public async Task<IEnumerable<Booking>> FilterBookingsAsync(
        DateTime? fromDate, 
        DateTime? toDate, 
        string? status, 
        string? paymentStatus, 
        int? customerId, 
        int? roomId)
    {
        var query = _context.Bookings
            .Include(b => b.Customer)
            .Include(b => b.Room)
                .ThenInclude(r => r.RoomType)
            .Include(b => b.BookingServices)
                .ThenInclude(bs => bs.Service)
            .Include(b => b.BookingHistories)
                .ThenInclude(bh => bh.User)
            .AsQueryable();
            
        // Lọc theo ngày
        if (fromDate.HasValue)
        {
            query = query.Where(b => b.CheckInDate >= fromDate.Value);
        }
        
        if (toDate.HasValue)
        {
            query = query.Where(b => b.CheckOutDate <= toDate.Value);
        }
        
        // Lọc theo trạng thái
        if (!string.IsNullOrEmpty(status))
        {
            query = query.Where(b => b.Status == status);
        }
        
        // Lọc theo trạng thái thanh toán
        if (!string.IsNullOrEmpty(paymentStatus))
        {
            query = query.Where(b => b.PaymentStatus == paymentStatus);
        }
        
        // Lọc theo khách hàng
        if (customerId.HasValue)
        {
            query = query.Where(b => b.CustomerId == customerId.Value);
        }
        
        // Lọc theo phòng
        if (roomId.HasValue)
        {
            query = query.Where(b => b.RoomId == roomId.Value);
        }
        
        return await query.ToListAsync();
    }

    /// <summary>
    /// Tạo đặt phòng mới
    /// </summary>
    public async Task<int> CreateAsync(Booking booking)
    {
        _context.Bookings.Add(booking);
        await _context.SaveChangesAsync();
        return booking.Id;
    }

    /// <summary>
    /// Cập nhật đặt phòng
    /// </summary>
    public async Task UpdateAsync(Booking booking)
    {
        _context.Bookings.Update(booking);
        await _context.SaveChangesAsync();
    }

    /// <summary>
    /// Xóa đặt phòng
    /// </summary>
    public async Task DeleteAsync(int id)
    {
        var booking = await _context.Bookings.FindAsync(id);
        if (booking != null)
        {
            _context.Bookings.Remove(booking);
            await _context.SaveChangesAsync();
        }
    }

    /// <summary>
    /// Thêm lịch sử đặt phòng
    /// </summary>
    public async Task AddBookingHistoryAsync(BookingHistory history)
    {
        _context.BookingHistories.Add(history);
        await _context.SaveChangesAsync();
    }

    /// <summary>
    /// Thêm dịch vụ cho đặt phòng và cập nhật tổng tiền
    /// </summary>
    public async Task AddBookingServiceAsync(BookingService service)
    {
        var booking = await _context.Bookings.FindAsync(service.BookingId);
        if (booking == null)
        {
            // Hoặc ném ngoại lệ phù hợp hơn
            throw new KeyNotFoundException($"Booking with ID {service.BookingId} not found.");
        }

        // Cập nhật tổng tiền của Booking
        booking.TotalAmount += service.Price * service.Quantity;
        _context.Bookings.Update(booking); // Đánh dấu Booking là đã thay đổi

        // Thêm BookingService mới
        _context.BookingServices.Add(service);

        // Lưu cả hai thay đổi trong một transaction
        await _context.SaveChangesAsync();
    }

    /// <summary>
    /// Xóa dịch vụ của đặt phòng và cập nhật tổng tiền
    /// </summary>
    public async Task RemoveBookingServiceAsync(int bookingServiceId) // Sửa tên tham số cho rõ ràng
    {
        // Tìm BookingService cần xóa, đồng thời Include Booking liên quan
        var serviceToRemove = await _context.BookingServices
                                      .Include(bs => bs.Booking) // Nạp Booking kèm theo
                                      .FirstOrDefaultAsync(bs => bs.Id == bookingServiceId);

        if (serviceToRemove != null && serviceToRemove.Booking != null)
        {
            // Cập nhật tổng tiền của Booking
            serviceToRemove.Booking.TotalAmount -= serviceToRemove.Price * serviceToRemove.Quantity;
            _context.Bookings.Update(serviceToRemove.Booking); // Đánh dấu Booking là đã thay đổi

            // Xóa BookingService
            _context.BookingServices.Remove(serviceToRemove);

            // Lưu cả hai thay đổi trong một transaction
            await _context.SaveChangesAsync();
        }
        else if (serviceToRemove != null && serviceToRemove.Booking == null)
        {
             // Log hoặc xử lý trường hợp Booking liên kết bị null (khó xảy ra nếu FK được thiết lập đúng)
             throw new InvalidOperationException($"Booking associated with BookingService ID {bookingServiceId} is null.");
        }
        // Nếu serviceToRemove là null, không làm gì cả hoặc log/ném lỗi
    }
}
