using HotelManagement.Domain.Entities;

namespace HotelManagement.Application.Common.Interfaces;

/// <summary>
/// Interface cho repository phòng
/// </summary>
public interface IRoomRepository
{
    /// <summary>
    /// Lấy tất cả phòng
    /// </summary>
    Task<IEnumerable<Room>> GetAllAsync();
    
    /// <summary>
    /// Lấy phòng theo ID
    /// </summary>
    Task<Room?> GetByIdAsync(int id);
    
    /// <summary>
    /// Lấy phòng theo số phòng
    /// </summary>
    Task<Room?> GetByRoomNumberAsync(string roomNumber);
    
    /// <summary>
    /// Lấy danh sách phòng có sẵn trong khoảng thời gian
    /// </summary>
    Task<IEnumerable<Room>> GetAvailableRoomsAsync(DateTime checkIn, DateTime checkOut);
    
    /// <summary>
    /// Kiểm tra phòng có sẵn trong khoảng thời gian
    /// </summary>
    Task<bool> IsRoomAvailableAsync(int roomId, DateTime checkIn, DateTime checkOut);
    
    /// <summary>
    /// Kiểm tra phòng có sẵn cho cập nhật đặt phòng
    /// </summary>
    Task<bool> IsRoomAvailableForUpdateAsync(int roomId, DateTime checkIn, DateTime checkOut, int bookingId);
    
    /// <summary>
    /// Kiểm tra phòng có đang được đặt không
    /// </summary>
    Task<bool> HasActiveBookingsAsync(int roomId);
    
    /// <summary>
    /// Tạo phòng mới
    /// </summary>
    Task<int> CreateAsync(Room room);
    
    /// <summary>
    /// Cập nhật phòng
    /// </summary>
    Task UpdateAsync(Room room);
    
    /// <summary>
    /// Xóa phòng
    /// </summary>
    Task DeleteAsync(int id);
}
