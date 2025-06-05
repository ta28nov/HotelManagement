using HotelManagement.Application.Common.Interfaces;
using HotelManagement.Domain.Entities;
using HotelManagement.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace HotelManagement.Infrastructure.Repositories;

/// <summary>
/// Repository xử lý các thao tác với phòng
/// </summary>
public class RoomRepository : IRoomRepository
{
    private readonly HotelDbContext _context;

    public RoomRepository(HotelDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// Lấy tất cả phòng
    /// </summary>
    public async Task<IEnumerable<Room>> GetAllAsync()
    {
        return await _context.Rooms
            .Include(r => r.RoomType)
                .ThenInclude(rt => rt.RoomFeatures)
            .ToListAsync();
    }

    /// <summary>
    /// Lấy phòng theo ID
    /// </summary>
    public async Task<Room?> GetByIdAsync(int id)
    {
        return await _context.Rooms
            .Include(r => r.RoomType)
                .ThenInclude(rt => rt.RoomFeatures)
            .FirstOrDefaultAsync(r => r.Id == id);
    }
    
    /// <summary>
    /// Lấy phòng theo số phòng
    /// </summary>
    public async Task<Room?> GetByRoomNumberAsync(string roomNumber)
    {
        return await _context.Rooms
            .FirstOrDefaultAsync(r => r.RoomNumber == roomNumber);
    }

    /// <summary>
    /// Lấy danh sách phòng có sẵn trong khoảng thời gian
    /// </summary>
    public async Task<IEnumerable<Room>> GetAvailableRoomsAsync(DateTime checkIn, DateTime checkOut)
    {
        // Lấy danh sách phòng đã được đặt trong khoảng thời gian
        var bookedRoomIds = await _context.Bookings
            .Where(b => 
                (checkIn < b.CheckOutDate && checkOut > b.CheckInDate) && 
                b.Status != "cancelled")
            .Select(b => b.RoomId)
            .ToListAsync();

        // Lấy danh sách phòng có sẵn (không nằm trong danh sách đã đặt và không trong trạng thái bảo trì)
        return await _context.Rooms
            .Include(r => r.RoomType)
                .ThenInclude(rt => rt.RoomFeatures)
            .Where(r => !bookedRoomIds.Contains(r.Id) && 
                        r.Status != "maintenance" && 
                        r.Status != "cleaning")
            .ToListAsync();
    }

    /// <summary>
    /// Kiểm tra phòng có sẵn trong khoảng thời gian
    /// </summary>
    public async Task<bool> IsRoomAvailableAsync(int roomId, DateTime checkIn, DateTime checkOut)
    {
        // Kiểm tra phòng có tồn tại và không trong trạng thái bảo trì
        var room = await _context.Rooms.FindAsync(roomId);
        if (room == null || room.Status == "maintenance" || room.Status == "cleaning")
        {
            return false;
        }

        // Kiểm tra phòng đã được đặt trong khoảng thời gian chưa
        var isBooked = await _context.Bookings
            .AnyAsync(b => 
                b.RoomId == roomId && 
                (checkIn < b.CheckOutDate && checkOut > b.CheckInDate) && 
                b.Status != "cancelled");

        return !isBooked;
    }
    
    /// <summary>
    /// Kiểm tra phòng có sẵn cho cập nhật đặt phòng
    /// </summary>
    public async Task<bool> IsRoomAvailableForUpdateAsync(int roomId, DateTime checkIn, DateTime checkOut, int bookingId)
    {
        // Kiểm tra phòng có tồn tại và không trong trạng thái bảo trì
        var room = await _context.Rooms.FindAsync(roomId);
        if (room == null || room.Status == "maintenance" || room.Status == "cleaning")
        {
            return false;
        }

        // Kiểm tra phòng đã được đặt trong khoảng thời gian chưa (trừ đặt phòng hiện tại)
        var isBooked = await _context.Bookings
            .AnyAsync(b => 
                b.Id != bookingId &&
                b.RoomId == roomId && 
                (checkIn < b.CheckOutDate && checkOut > b.CheckInDate) && 
                b.Status != "cancelled");

        return !isBooked;
    }
    
    /// <summary>
    /// Kiểm tra phòng có đang được đặt không
    /// </summary>
    public async Task<bool> HasActiveBookingsAsync(int roomId)
    {
        return await _context.Bookings
            .AnyAsync(b => 
                b.RoomId == roomId && 
                b.Status != "cancelled" && 
                b.Status != "completed");
    }

    /// <summary>
    /// Tạo phòng mới
    /// </summary>
    public async Task<int> CreateAsync(Room room)
    {
        _context.Rooms.Add(room);
        await _context.SaveChangesAsync();
        return room.Id;
    }

    /// <summary>
    /// Cập nhật phòng
    /// </summary>
    public async Task UpdateAsync(Room room)
    {
        _context.Rooms.Update(room);
        await _context.SaveChangesAsync();
    }

    /// <summary>
    /// Xóa phòng
    /// </summary>
    public async Task DeleteAsync(int id)
    {
        var room = await _context.Rooms.FindAsync(id);
        if (room != null)
        {
            _context.Rooms.Remove(room);
            await _context.SaveChangesAsync();
        }
    }
}
