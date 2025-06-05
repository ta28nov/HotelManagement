using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http;

namespace HotelManagement.API.Models;

/// <summary>
/// Mô hình dữ liệu cho thông tin dịch vụ
/// </summary>
public class ServiceDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public int CategoryId { get; set; }
    public string CategoryName { get; set; } = string.Empty;
    public string? Description { get; set; }
    public decimal Price { get; set; }
    public bool IsAvailable { get; set; }
    public string? ImageUrl { get; set; }
}

/// <summary>
/// Mô hình dữ liệu cho danh mục dịch vụ
/// </summary>
public class ServiceCategoryDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
}

/// <summary>
/// Mô hình dữ liệu cho yêu cầu tạo dịch vụ mới
/// </summary>
public class CreateServiceRequest
{
    [Required(ErrorMessage = "Tên dịch vụ là bắt buộc")]
    public string Name { get; set; } = string.Empty;
    
    [Required(ErrorMessage = "Danh mục dịch vụ là bắt buộc")]
    public int CategoryId { get; set; }
    
    public string? Description { get; set; }
    
    [Required(ErrorMessage = "Giá dịch vụ là bắt buộc")]
    [Range(0, 100000, ErrorMessage = "Giá dịch vụ phải từ 0 đến 100000")]
    public decimal Price { get; set; }
    
    public bool IsAvailable { get; set; } = true;
}

/// <summary>
/// Mô hình dữ liệu cho yêu cầu cập nhật dịch vụ
/// </summary>
public class UpdateServiceRequest
{
    public string? Name { get; set; }
    public int? CategoryId { get; set; }
    public string? Description { get; set; }
    
    [Range(0, 100000, ErrorMessage = "Giá dịch vụ phải từ 0 đến 100000")]
    public decimal? Price { get; set; }
    
    public bool? IsAvailable { get; set; }
}

/// <summary>
/// Mô hình dữ liệu cho yêu cầu tạo danh mục dịch vụ mới
/// </summary>
public class CreateServiceCategoryRequest
{
    [Required(ErrorMessage = "Tên danh mục dịch vụ là bắt buộc")]
    public string Name { get; set; } = string.Empty;
    
    public string? Description { get; set; }
}

/// <summary>
/// Mô hình dữ liệu cho yêu cầu tải lên hình ảnh dịch vụ
/// </summary>
public class UploadServiceImageRequest
{
    [Required(ErrorMessage = "ID dịch vụ là bắt buộc")]
    public int ServiceId { get; set; }
    
    [Required(ErrorMessage = "Hình ảnh là bắt buộc")]
    public IFormFile Image { get; set; } = null!;
}
