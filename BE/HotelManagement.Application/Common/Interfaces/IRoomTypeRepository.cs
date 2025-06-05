using HotelManagement.Domain.Entities;

namespace HotelManagement.Application.Common.Interfaces;

/// <summary>
/// Interface cho repository loại phòng
/// </summary>
public interface IRoomTypeRepository
{
    /// <summary>
    /// Lấy tất cả loại phòng
    /// </summary>
    Task<IEnumerable<RoomType>> GetAllAsync();
    
    /// <summary>
    /// Lấy loại phòng theo ID
    /// </summary>
    Task<RoomType?> GetByIdAsync(int id);
    
    /// <summary>
    /// Lấy tính năng phòng theo ID
    /// </summary>
    Task<RoomFeature?> GetFeatureByIdAsync(int id);
    
    /// <summary>
    /// Lấy danh sách tiện nghi phòng
    /// </summary>
    Task<IEnumerable<object>> GetAllAmenitiesAsync();
    
    /// <summary>
    /// Thêm tính năng cho loại phòng
    /// </summary>
    Task AddFeatureAsync(RoomFeature feature);
    
    /// <summary>
    /// Cập nhật hình ảnh chính cho loại phòng
    /// </summary>
    Task UpdatePrimaryImageAsync(int roomTypeId, RoomFeature feature);
    
    /// <summary>
    /// Xóa tính năng phòng
    /// </summary>
    Task DeleteFeatureAsync(int id);
    
    /// <summary>
    /// Tạo loại phòng mới
    /// </summary>
    Task<int> CreateAsync(RoomType roomType);
    
    /// <summary>
    /// Cập nhật loại phòng
    /// </summary>
    Task UpdateAsync(RoomType roomType);
    
    /// <summary>
    /// Xóa loại phòng
    /// </summary>
    Task DeleteAsync(int id);
}
