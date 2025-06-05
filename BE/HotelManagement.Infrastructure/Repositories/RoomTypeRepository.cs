using HotelManagement.Application.Common.Interfaces;
using HotelManagement.Domain.Entities;
using HotelManagement.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace HotelManagement.Infrastructure.Repositories;

/// <summary>
/// Repository xử lý các thao tác với loại phòng
/// </summary>
public class RoomTypeRepository : IRoomTypeRepository
{
    private readonly HotelDbContext _context;

    public RoomTypeRepository(HotelDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// Lấy tất cả loại phòng
    /// </summary>
    public async Task<IEnumerable<RoomType>> GetAllAsync()
    {
        return await _context.RoomTypes
            .Include(rt => rt.RoomFeatures)
            .ToListAsync();
    }

    /// <summary>
    /// Lấy loại phòng theo ID
    /// </summary>
    public async Task<RoomType?> GetByIdAsync(int id)
    {
        return await _context.RoomTypes
            .Include(rt => rt.RoomFeatures)
            .FirstOrDefaultAsync(rt => rt.Id == id);
    }
    
    /// <summary>
    /// Lấy tính năng phòng theo ID
    /// </summary>
    public async Task<RoomFeature?> GetFeatureByIdAsync(int id)
    {
        return await _context.RoomFeatures
            .FirstOrDefaultAsync(rf => rf.Id == id);
    }
    
    /// <summary>
    /// Lấy danh sách tiện nghi phòng
    /// </summary>
    public async Task<IEnumerable<object>> GetAllAmenitiesAsync()
    {
        // Lấy danh sách tiện nghi từ tính năng phòng
        var amenities = await _context.RoomFeatures
            .Where(rf => rf.FeatureType == "amenity")
            .GroupBy(rf => rf.Name)
            .Select(g => new { Name = g.Key, Count = g.Count() })
            .ToListAsync();
            
        return amenities;
    }
    
    /// <summary>
    /// Thêm tính năng cho loại phòng
    /// </summary>
    public async Task AddFeatureAsync(RoomFeature feature)
    {
        _context.RoomFeatures.Add(feature);
        await _context.SaveChangesAsync();
    }
    
    /// <summary>
    /// Cập nhật hình ảnh chính cho loại phòng
    /// </summary>
    public async Task UpdatePrimaryImageAsync(int roomTypeId, RoomFeature feature)
    {
        // Tìm hình ảnh chính hiện tại
        var currentPrimaryImage = await _context.RoomFeatures
            .FirstOrDefaultAsync(rf => 
                rf.RoomTypeId == roomTypeId && 
                rf.FeatureType == "image" && 
                rf.IsPrimary);
                
        // Nếu có hình ảnh chính, cập nhật thành không phải hình ảnh chính
        if (currentPrimaryImage != null)
        {
            currentPrimaryImage.IsPrimary = false;
            _context.RoomFeatures.Update(currentPrimaryImage);
        }
        
        // Thêm hình ảnh mới
        _context.RoomFeatures.Add(feature);
        
        await _context.SaveChangesAsync();
    }
    
    /// <summary>
    /// Xóa tính năng phòng
    /// </summary>
    public async Task DeleteFeatureAsync(int id)
    {
        var feature = await _context.RoomFeatures.FindAsync(id);
        if (feature != null)
        {
            _context.RoomFeatures.Remove(feature);
            await _context.SaveChangesAsync();
        }
    }

    /// <summary>
    /// Tạo loại phòng mới
    /// </summary>
    public async Task<int> CreateAsync(RoomType roomType)
    {
        _context.RoomTypes.Add(roomType);
        await _context.SaveChangesAsync();
        return roomType.Id;
    }

    /// <summary>
    /// Cập nhật loại phòng
    /// </summary>
    public async Task UpdateAsync(RoomType roomType)
    {
        _context.RoomTypes.Update(roomType);
        await _context.SaveChangesAsync();
    }

    /// <summary>
    /// Xóa loại phòng
    /// </summary>
    public async Task DeleteAsync(int id)
    {
        var roomType = await _context.RoomTypes.FindAsync(id);
        if (roomType != null)
        {
            _context.RoomTypes.Remove(roomType);
            await _context.SaveChangesAsync();
        }
    }
}
