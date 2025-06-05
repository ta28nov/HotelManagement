using HotelManagement.Application.Common.Interfaces;
using HotelManagement.Domain.Entities;
using HotelManagement.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace HotelManagement.Infrastructure.Repositories;

/// <summary>
/// Repository xử lý các thao tác với dịch vụ
/// </summary>
public class ServiceRepository : IServiceRepository
{
    private readonly HotelDbContext _context;

    public ServiceRepository(HotelDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// Lấy tất cả dịch vụ
    /// </summary>
    public async Task<IEnumerable<Service>> GetAllAsync()
    {
        return await _context.Services
            .Include(s => s.Category)
            .ToListAsync();
    }

    /// <summary>
    /// Lấy dịch vụ theo ID
    /// </summary>
    public async Task<Service?> GetByIdAsync(int id)
    {
        return await _context.Services
            .Include(s => s.Category)
            .FirstOrDefaultAsync(s => s.Id == id);
    }

    /// <summary>
    /// Lấy dịch vụ theo danh mục
    /// </summary>
    public async Task<IEnumerable<Service>> GetByCategoryIdAsync(int categoryId)
    {
        return await _context.Services
            .Include(s => s.Category)
            .Where(s => s.CategoryId == categoryId)
            .ToListAsync();
    }
    
    /// <summary>
    /// Lấy danh mục dịch vụ theo ID
    /// </summary>
    public async Task<ServiceCategory?> GetCategoryByIdAsync(int id)
    {
        return await _context.ServiceCategories
            .FirstOrDefaultAsync(sc => sc.Id == id);
    }
    
    /// <summary>
    /// Lấy danh mục dịch vụ theo tên
    /// </summary>
    public async Task<ServiceCategory?> GetCategoryByNameAsync(string name)
    {
        return await _context.ServiceCategories
            .FirstOrDefaultAsync(sc => sc.Name == name);
    }

    /// <summary>
    /// Lấy tất cả danh mục dịch vụ
    /// </summary>
    public async Task<IEnumerable<ServiceCategory>> GetAllCategoriesAsync()
    {
        return await _context.ServiceCategories.ToListAsync();
    }
    
    /// <summary>
    /// Tìm kiếm dịch vụ theo nhiều tiêu chí
    /// </summary>
    public async Task<IEnumerable<Service>> SearchServicesAsync(
        string? name, 
        int? categoryId, 
        decimal? minPrice, 
        decimal? maxPrice, 
        bool? isAvailable)
    {
        var query = _context.Services
            .Include(s => s.Category)
            .AsQueryable();
            
        // Tìm kiếm theo tên
        if (!string.IsNullOrEmpty(name))
        {
            query = query.Where(s => s.Name.Contains(name));
        }
        
        // Lọc theo danh mục
        if (categoryId.HasValue)
        {
            query = query.Where(s => s.CategoryId == categoryId.Value);
        }
        
        // Lọc theo giá tối thiểu
        if (minPrice.HasValue)
        {
            query = query.Where(s => s.Price >= minPrice.Value);
        }
        
        // Lọc theo giá tối đa
        if (maxPrice.HasValue)
        {
            query = query.Where(s => s.Price <= maxPrice.Value);
        }
        
        // Lọc theo trạng thái
        if (isAvailable.HasValue)
        {
            query = query.Where(s => s.IsAvailable == isAvailable.Value);
        }
        
        return await query.ToListAsync();
    }
    
    /// <summary>
    /// Kiểm tra dịch vụ có đang được sử dụng không
    /// </summary>
    public async Task<bool> IsServiceInUseAsync(int id)
    {
        return await _context.BookingServices
            .AnyAsync(bs => bs.ServiceId == id);
    }
    
    /// <summary>
    /// Cập nhật hình ảnh dịch vụ
    /// </summary>
    public async Task UpdateServiceImageAsync(int serviceId, string imageUrl)
    {
        var service = await _context.Services.FindAsync(serviceId);
        if (service != null)
        {
            // Cập nhật trường ImageUrl trong entity Service
            // Lưu ý: Cần thêm trường ImageUrl vào entity Service
            service.ImageUrl = imageUrl;
            _context.Services.Update(service);
            await _context.SaveChangesAsync();
        }
    }

    /// <summary>
    /// Tạo dịch vụ mới
    /// </summary>
    public async Task<int> CreateAsync(Service service)
    {
        _context.Services.Add(service);
        await _context.SaveChangesAsync();
        return service.Id;
    }

    /// <summary>
    /// Cập nhật dịch vụ
    /// </summary>
    public async Task UpdateAsync(Service service)
    {
        _context.Services.Update(service);
        await _context.SaveChangesAsync();
    }

    /// <summary>
    /// Xóa dịch vụ
    /// </summary>
    public async Task DeleteAsync(int id)
    {
        var service = await _context.Services.FindAsync(id);
        if (service != null)
        {
            _context.Services.Remove(service);
            await _context.SaveChangesAsync();
        }
    }

    /// <summary>
    /// Tạo danh mục dịch vụ mới
    /// </summary>
    public async Task<int> CreateCategoryAsync(ServiceCategory category)
    {
        _context.ServiceCategories.Add(category);
        await _context.SaveChangesAsync();
        return category.Id;
    }

    /// <summary>
    /// Cập nhật danh mục dịch vụ
    /// </summary>
    public async Task UpdateCategoryAsync(ServiceCategory category)
    {
        _context.ServiceCategories.Update(category);
        await _context.SaveChangesAsync();
    }

    /// <summary>
    /// Xóa danh mục dịch vụ
    /// </summary>
    public async Task DeleteCategoryAsync(int id)
    {
        var category = await _context.ServiceCategories.FindAsync(id);
        if (category != null)
        {
            _context.ServiceCategories.Remove(category);
            await _context.SaveChangesAsync();
        }
    }
}
