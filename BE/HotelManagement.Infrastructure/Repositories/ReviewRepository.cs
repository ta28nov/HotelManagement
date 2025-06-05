using HotelManagement.Application.Common.Interfaces;
using HotelManagement.Domain.Entities;
using HotelManagement.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace HotelManagement.Infrastructure.Repositories;

/// <summary>
/// Repository xử lý các thao tác với đánh giá
/// </summary>
public class ReviewRepository : IReviewRepository
{
    private readonly HotelDbContext _context;

    public ReviewRepository(HotelDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// Lấy tất cả đánh giá
    /// </summary>
    public async Task<IEnumerable<Review>> GetAllAsync()
    {
        return await _context.Reviews
            .Include(r => r.Booking)
                .ThenInclude(b => b.Customer)
            .Include(r => r.Booking)
                .ThenInclude(b => b.Room)
            .ToListAsync();
    }

    /// <summary>
    /// Lấy đánh giá theo ID
    /// </summary>
    public async Task<Review?> GetByIdAsync(int id)
    {
        return await _context.Reviews
            .Include(r => r.Booking)
                .ThenInclude(b => b.Customer)
            .Include(r => r.Booking)
                .ThenInclude(b => b.Room)
            .FirstOrDefaultAsync(r => r.Id == id);
    }

    /// <summary>
    /// Lấy đánh giá theo ID đặt phòng
    /// </summary>
    public async Task<Review?> GetByBookingIdAsync(int bookingId)
    {
        return await _context.Reviews
            .Include(r => r.Booking)
                .ThenInclude(b => b.Customer)
            .Include(r => r.Booking)
                .ThenInclude(b => b.Room)
            .FirstOrDefaultAsync(r => r.BookingId == bookingId);
    }

    /// <summary>
    /// Lấy đánh giá theo ID phòng
    /// </summary>
    public async Task<IEnumerable<Review>> GetByRoomIdAsync(int roomId)
    {
        return await _context.Reviews
            .Include(r => r.Booking)
                .ThenInclude(b => b.Customer)
            .Include(r => r.Booking)
                .ThenInclude(b => b.Room)
            .Where(r => r.Booking.RoomId == roomId)
            .ToListAsync();
    }

    /// <summary>
    /// Tạo đánh giá mới
    /// </summary>
    public async Task<int> CreateAsync(Review review)
    {
        _context.Reviews.Add(review);
        await _context.SaveChangesAsync();
        return review.Id;
    }

    /// <summary>
    /// Cập nhật đánh giá
    /// </summary>
    public async Task UpdateAsync(Review review)
    {
        _context.Reviews.Update(review);
        await _context.SaveChangesAsync();
    }

    /// <summary>
    /// Xóa đánh giá
    /// </summary>
    public async Task DeleteAsync(int id)
    {
        var review = await _context.Reviews.FindAsync(id);
        if (review != null)
        {
            _context.Reviews.Remove(review);
            await _context.SaveChangesAsync();
        }
    }
}
