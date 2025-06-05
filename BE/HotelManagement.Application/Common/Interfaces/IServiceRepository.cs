using HotelManagement.Domain.Entities;

namespace HotelManagement.Application.Common.Interfaces;

/// <summary>
/// Interface cho repository dịch vụ
/// </summary>
public interface IServiceRepository
{
    /// <summary>
    /// Lấy tất cả dịch vụ
    /// </summary>
    Task<IEnumerable<Service>> GetAllAsync();
    
    /// <summary>
    /// Lấy dịch vụ theo ID
    /// </summary>
    Task<Service?> GetByIdAsync(int id);
    
    /// <summary>
    /// Lấy dịch vụ theo danh mục
    /// </summary>
    Task<IEnumerable<Service>> GetByCategoryIdAsync(int categoryId);
    
    /// <summary>
    /// Lấy danh mục dịch vụ theo ID
    /// </summary>
    Task<ServiceCategory?> GetCategoryByIdAsync(int id);
    
    /// <summary>
    /// Lấy danh mục dịch vụ theo tên
    /// </summary>
    Task<ServiceCategory?> GetCategoryByNameAsync(string name);
    
    /// <summary>
    /// Lấy tất cả danh mục dịch vụ
    /// </summary>
    Task<IEnumerable<ServiceCategory>> GetAllCategoriesAsync();
    
    /// <summary>
    /// Tìm kiếm dịch vụ theo nhiều tiêu chí
    /// </summary>
    Task<IEnumerable<Service>> SearchServicesAsync(
        string? name, 
        int? categoryId, 
        decimal? minPrice, 
        decimal? maxPrice, 
        bool? isAvailable);
    
    /// <summary>
    /// Kiểm tra dịch vụ có đang được sử dụng không
    /// </summary>
    Task<bool> IsServiceInUseAsync(int id);
    
    /// <summary>
    /// Cập nhật hình ảnh dịch vụ
    /// </summary>
    Task UpdateServiceImageAsync(int serviceId, string imageUrl);
    
    /// <summary>
    /// Tạo dịch vụ mới
    /// </summary>
    Task<int> CreateAsync(Service service);
    
    /// <summary>
    /// Cập nhật dịch vụ
    /// </summary>
    Task UpdateAsync(Service service);
    
    /// <summary>
    /// Xóa dịch vụ
    /// </summary>
    Task DeleteAsync(int id);
    
    /// <summary>
    /// Tạo danh mục dịch vụ mới
    /// </summary>
    Task<int> CreateCategoryAsync(ServiceCategory category);
    
    /// <summary>
    /// Cập nhật danh mục dịch vụ
    /// </summary>
    Task UpdateCategoryAsync(ServiceCategory category);
    
    /// <summary>
    /// Xóa danh mục dịch vụ
    /// </summary>
    Task DeleteCategoryAsync(int id);
}
