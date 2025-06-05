using HotelManagement.Domain.Entities;

namespace HotelManagement.Application.Common.Interfaces;

/// <summary>
/// Interface cho repository đặt phòng
/// </summary>
public interface IBookingRepository
{
    /// <summary>
    /// Lấy tất cả đặt phòng
    /// </summary>
    Task<IEnumerable<Booking>> GetAllAsync();
    
    /// <summary>
    /// Lấy đặt phòng theo ID
    /// </summary>
    Task<Booking?> GetByIdAsync(int id);
    
    /// <summary>
    /// Lấy đặt phòng theo ID khách hàng
    /// </summary>
    Task<IEnumerable<Booking>> GetByCustomerIdAsync(int customerId);
    
    /// <summary>
    /// Lọc đặt phòng theo nhiều tiêu chí
    /// </summary>
    Task<IEnumerable<Booking>> FilterBookingsAsync(
        DateTime? fromDate, 
        DateTime? toDate, 
        string? status, 
        string? paymentStatus, 
        int? customerId, 
        int? roomId);
    
    /// <summary>
    /// Tạo đặt phòng mới
    /// </summary>
    Task<int> CreateAsync(Booking booking);
    
    /// <summary>
    /// Cập nhật đặt phòng
    /// </summary>
    Task UpdateAsync(Booking booking);
    
    /// <summary>
    /// Xóa đặt phòng
    /// </summary>
    Task DeleteAsync(int id);
    
    /// <summary>
    /// Thêm lịch sử đặt phòng
    /// </summary>
    Task AddBookingHistoryAsync(BookingHistory history);
    
    /// <summary>
    /// Thêm dịch vụ cho đặt phòng
    /// </summary>
    Task AddBookingServiceAsync(BookingService service);
    
    /// <summary>
    /// Xóa dịch vụ của đặt phòng
    /// </summary>
    Task RemoveBookingServiceAsync(int serviceId);
}
