using System.Security.Claims;
using HotelManagement.API.Models;
using HotelManagement.Application.Common.Interfaces;
using HotelManagement.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HotelManagement.API.Controllers;

/// <summary>
/// Controller xử lý các API liên quan đến quản lý dịch vụ
/// </summary>
[ApiController]
[Route("api/services")]
public class ServicesController : ControllerBase
{
    private readonly IServiceRepository _serviceRepository;
    private readonly IWebHostEnvironment _environment;
    private readonly ILogger<ServicesController> _logger;

    public ServicesController(
        IServiceRepository serviceRepository,
        IWebHostEnvironment environment,
        ILogger<ServicesController> logger)
    {
        _serviceRepository = serviceRepository;
        _environment = environment;
        _logger = logger;
    }

    /// <summary>
    /// API lấy danh sách dịch vụ
    /// </summary>
    /// <returns>Danh sách dịch vụ</returns>
    [HttpGet]
    public async Task<IActionResult> GetAllServices()
    {
        var services = await _serviceRepository.GetAllAsync();
        
        var result = services.Select(s => new ServiceDto
        {
            Id = s.Id,
            Name = s.Name,
            CategoryId = s.CategoryId,
            CategoryName = s.Category?.Name ?? string.Empty,
            Description = s.Description,
            Price = s.Price,
            IsAvailable = s.IsAvailable,
            ImageUrl = s.ImageUrl
        });
        
        return Ok(result);
    }

    /// <summary>
    /// API lấy thông tin dịch vụ theo ID
    /// </summary>
    /// <param name="id">ID dịch vụ</param>
    /// <returns>Thông tin dịch vụ</returns>
    [HttpGet("{id}")]
    public async Task<IActionResult> GetServiceById(int id)
    {
        var service = await _serviceRepository.GetByIdAsync(id);
        
        if (service == null)
        {
            return NotFound(new { message = "Không tìm thấy dịch vụ" });
        }
        
        var result = new ServiceDto
        {
            Id = service.Id,
            Name = service.Name,
            CategoryId = service.CategoryId,
            CategoryName = service.Category?.Name ?? string.Empty,
            Description = service.Description,
            Price = service.Price,
            IsAvailable = service.IsAvailable,
            ImageUrl = service.ImageUrl
        };
        
        return Ok(result);
    }

    /// <summary>
    /// API lấy dịch vụ theo danh mục
    /// </summary>
    /// <param name="categoryId">ID danh mục</param>
    /// <returns>Danh sách dịch vụ</returns>
    [HttpGet("category/{categoryId}")]
    public async Task<IActionResult> GetServicesByCategory(int categoryId)
    {
        var services = await _serviceRepository.GetByCategoryIdAsync(categoryId);
        
        var result = services.Select(s => new ServiceDto
        {
            Id = s.Id,
            Name = s.Name,
            CategoryId = s.CategoryId,
            CategoryName = s.Category?.Name ?? string.Empty,
            Description = s.Description,
            Price = s.Price,
            IsAvailable = s.IsAvailable,
            ImageUrl = s.ImageUrl
        });
        
        return Ok(result);
    }

    /// <summary>
    /// API tìm kiếm dịch vụ
    /// </summary>
    /// <param name="name">Tên dịch vụ</param>
    /// <param name="categoryId">ID danh mục</param>
    /// <param name="minPrice">Giá tối thiểu</param>
    /// <param name="maxPrice">Giá tối đa</param>
    /// <param name="isAvailable">Trạng thái</param>
    /// <returns>Danh sách dịch vụ</returns>
    [HttpGet("search")]
    public async Task<IActionResult> SearchServices(
        [FromQuery] string? name,
        [FromQuery] int? categoryId,
        [FromQuery] decimal? minPrice,
        [FromQuery] decimal? maxPrice,
        [FromQuery] bool? isAvailable)
    {
        var services = await _serviceRepository.SearchServicesAsync(
            name, categoryId, minPrice, maxPrice, isAvailable);
            
        var result = services.Select(s => new ServiceDto
        {
            Id = s.Id,
            Name = s.Name,
            CategoryId = s.CategoryId,
            CategoryName = s.Category?.Name ?? string.Empty,
            Description = s.Description,
            Price = s.Price,
            IsAvailable = s.IsAvailable,
            ImageUrl = s.ImageUrl
        });
        
        return Ok(result);
    }

    /// <summary>
    /// API lấy danh sách danh mục dịch vụ
    /// </summary>
    /// <returns>Danh sách danh mục</returns>
    [HttpGet("categories")]
    public async Task<IActionResult> GetAllCategories()
    {
        var categories = await _serviceRepository.GetAllCategoriesAsync();
        
        var result = categories.Select(c => new ServiceCategoryDto
        {
            Id = c.Id,
            Name = c.Name,
            Description = c.Description
        });
        
        return Ok(result);
    }

    /// <summary>
    /// API tạo dịch vụ mới
    /// </summary>
    /// <param name="request">Thông tin dịch vụ mới</param>
    /// <returns>Kết quả tạo dịch vụ</returns>
    [HttpPost]
    [Authorize(Policy = "EmployeeAndAdmin")]
    public async Task<IActionResult> CreateService([FromBody] CreateServiceRequest request)
    {
        // Kiểm tra danh mục tồn tại
        var category = await _serviceRepository.GetCategoryByIdAsync(request.CategoryId);
        if (category == null)
        {
            return BadRequest(new { message = "Danh mục không tồn tại" });
        }
        
        // Tạo dịch vụ mới
        var service = new Service
        {
            Name = request.Name,
            CategoryId = request.CategoryId,
            Description = request.Description,
            Price = request.Price,
            IsAvailable = request.IsAvailable
        };
        
        var serviceId = await _serviceRepository.CreateAsync(service);
        
        _logger.LogInformation("Dịch vụ mới được tạo: {ServiceName}, ID: {ServiceId}", request.Name, serviceId);
        
        return CreatedAtAction(nameof(GetServiceById), new { id = serviceId }, new
        {
            serviceId = serviceId,
            message = "Tạo dịch vụ thành công"
        });
    }

    /// <summary>
    /// API cập nhật dịch vụ
    /// </summary>
    /// <param name="id">ID dịch vụ</param>
    /// <param name="request">Thông tin cập nhật</param>
    /// <returns>Kết quả cập nhật</returns>
    [HttpPut("{id}")]
    [Authorize(Policy = "EmployeeAndAdmin")]
    public async Task<IActionResult> UpdateService(int id, [FromBody] UpdateServiceRequest request)
    {
        // Kiểm tra dịch vụ tồn tại
        var service = await _serviceRepository.GetByIdAsync(id);
        if (service == null)
        {
            return NotFound(new { message = "Không tìm thấy dịch vụ" });
        }
        
        // Kiểm tra danh mục tồn tại nếu có cập nhật
        if (request.CategoryId.HasValue)
        {
            var category = await _serviceRepository.GetCategoryByIdAsync(request.CategoryId.Value);
            if (category == null)
            {
                return BadRequest(new { message = "Danh mục không tồn tại" });
            }
            
            service.CategoryId = request.CategoryId.Value;
        }
        
        // Cập nhật thông tin khác
        if (!string.IsNullOrEmpty(request.Name))
        {
            service.Name = request.Name;
        }
        
        if (request.Description != null)
        {
            service.Description = request.Description;
        }
        
        if (request.Price.HasValue)
        {
            service.Price = request.Price.Value;
        }
        
        if (request.IsAvailable.HasValue)
        {
            service.IsAvailable = request.IsAvailable.Value;
        }
        
        await _serviceRepository.UpdateAsync(service);
        
        _logger.LogInformation("Cập nhật thông tin dịch vụ: {ServiceId}", id);
        
        return Ok(new { message = "Cập nhật dịch vụ thành công" });
    }

    /// <summary>
    /// API xóa dịch vụ
    /// </summary>
    /// <param name="id">ID dịch vụ</param>
    /// <returns>Kết quả xóa</returns>
    [HttpDelete("{id}")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> DeleteService(int id)
    {
        // Kiểm tra dịch vụ tồn tại
        var service = await _serviceRepository.GetByIdAsync(id);
        if (service == null)
        {
            return NotFound(new { message = "Không tìm thấy dịch vụ" });
        }
        
        // Kiểm tra dịch vụ có đang được sử dụng không
        var isInUse = await _serviceRepository.IsServiceInUseAsync(id);
        if (isInUse)
        {
            return BadRequest(new { message = "Không thể xóa dịch vụ đang được sử dụng" });
        }
        
        await _serviceRepository.DeleteAsync(id);
        
        _logger.LogInformation("Xóa dịch vụ: {ServiceId}", id);
        
        return Ok(new { message = "Xóa dịch vụ thành công" });
    }

    /// <summary>
    /// API tạo danh mục dịch vụ mới
    /// </summary>
    /// <param name="request">Thông tin danh mục mới</param>
    /// <returns>Kết quả tạo danh mục</returns>
    [HttpPost("categories")]
    [Authorize(Policy = "EmployeeAndAdmin")]
    public async Task<IActionResult> CreateCategory([FromBody] CreateServiceCategoryRequest request)
    {
        // Kiểm tra danh mục đã tồn tại chưa
        var existingCategory = await _serviceRepository.GetCategoryByNameAsync(request.Name);
        if (existingCategory != null)
        {
            return BadRequest(new { message = "Danh mục đã tồn tại" });
        }
        
        // Tạo danh mục mới
        var category = new ServiceCategory
        {
            Name = request.Name,
            Description = request.Description
        };
        
        var categoryId = await _serviceRepository.CreateCategoryAsync(category);
        
        _logger.LogInformation("Danh mục dịch vụ mới được tạo: {CategoryName}, ID: {CategoryId}", request.Name, categoryId);
        
        return Ok(new
        {
            categoryId = categoryId,
            message = "Tạo danh mục dịch vụ thành công"
        });
    }

    /// <summary>
    /// API tải lên hình ảnh dịch vụ
    /// </summary>
    /// <param name="request">Thông tin hình ảnh</param>
    /// <returns>Kết quả tải lên</returns>
    [HttpPost("image")]
    [Authorize(Policy = "EmployeeAndAdmin")]
    public async Task<IActionResult> UploadServiceImage([FromForm] UploadServiceImageRequest request)
    {
        // Kiểm tra dịch vụ tồn tại
        var service = await _serviceRepository.GetByIdAsync(request.ServiceId);
        if (service == null)
        {
            return BadRequest(new { message = "Dịch vụ không tồn tại" });
        }
        
        // Lưu hình ảnh
        var fileName = $"{Guid.NewGuid()}_{request.Image.FileName}";
        var uploadsFolder = Path.Combine(_environment.WebRootPath, "images", "services");
        
        // Tạo thư mục nếu chưa tồn tại
        if (!Directory.Exists(uploadsFolder))
        {
            Directory.CreateDirectory(uploadsFolder);
        }
        
        var filePath = Path.Combine(uploadsFolder, fileName);
        
        using (var fileStream = new FileStream(filePath, FileMode.Create))
        {
            await request.Image.CopyToAsync(fileStream);
        }
        
        // Tạo đường dẫn tương đối
        var imageUrl = $"/images/services/{fileName}";
        
        // Cập nhật đường dẫn hình ảnh cho dịch vụ
        await _serviceRepository.UpdateServiceImageAsync(request.ServiceId, imageUrl);
        
        _logger.LogInformation("Tải lên hình ảnh cho dịch vụ: {ServiceId}", request.ServiceId);
        
        return Ok(new 
        { 
            message = "Tải lên hình ảnh thành công",
            imageUrl = imageUrl
        });
    }
}
