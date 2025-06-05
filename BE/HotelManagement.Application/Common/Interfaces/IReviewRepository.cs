using HotelManagement.Domain.Entities;

namespace HotelManagement.Application.Common.Interfaces;

/// <summary>
/// Interface cho repository đánh giá
/// </summary>
public interface IReviewRepository
{
    Task<IEnumerable<Review>> GetAllAsync();
    Task<Review?> GetByIdAsync(int id);
    Task<Review?> GetByBookingIdAsync(int bookingId);
    Task<IEnumerable<Review>> GetByRoomIdAsync(int roomId);
    Task<int> CreateAsync(Review review);
    Task UpdateAsync(Review review);
    Task DeleteAsync(int id);
}
