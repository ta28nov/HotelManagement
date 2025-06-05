using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http;

namespace HotelManagement.API.Models;

/// <summary>
/// Mô hình dữ liệu cho thông tin phòng
/// </summary>
public class RoomDto
{
    public int Id { get; set; }
    public string RoomNumber { get; set; } = string.Empty;
    public int RoomTypeId { get; set; }
    public string RoomTypeName { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public int Floor { get; set; }
    public decimal BasePrice { get; set; }
    public int Capacity { get; set; }
    public List<RoomFeatureDto> Features { get; set; } = new List<RoomFeatureDto>();
    public List<RoomImageDto> Images { get; set; } = new List<RoomImageDto>();
}

/// <summary>
/// Mô hình dữ liệu cho tính năng phòng
/// </summary>
public class RoomFeatureDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Value { get; set; }
}

/// <summary>
/// Mô hình dữ liệu cho hình ảnh phòng
/// </summary>
public class RoomImageDto
{
    public int Id { get; set; }
    public string Url { get; set; } = string.Empty;
    public bool IsPrimary { get; set; }
}

/// <summary>
/// Mô hình dữ liệu cho thông tin loại phòng
/// </summary>
public class RoomTypeDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public decimal BasePrice { get; set; }
    public int Capacity { get; set; }
    public List<RoomFeatureDto> Features { get; set; } = new List<RoomFeatureDto>();
    public List<RoomImageDto> Images { get; set; } = new List<RoomImageDto>();
}

/// <summary>
/// Mô hình dữ liệu cho yêu cầu tạo phòng mới
/// </summary>
public class CreateRoomRequest
{
    [Required(ErrorMessage = "Số phòng là bắt buộc")]
    public string RoomNumber { get; set; } = string.Empty;
    
    [Required(ErrorMessage = "Loại phòng là bắt buộc")]
    public int RoomTypeId { get; set; }
    
    [Required(ErrorMessage = "Trạng thái là bắt buộc")]
    public string Status { get; set; } = "available";
    
    [Required(ErrorMessage = "Tầng là bắt buộc")]
    public int Floor { get; set; }
}

/// <summary>
/// Mô hình dữ liệu cho yêu cầu cập nhật phòng
/// </summary>
public class UpdateRoomRequest
{
    public string? RoomNumber { get; set; }
    public int? RoomTypeId { get; set; }
    public string? Status { get; set; }
    public int? Floor { get; set; }
}

/// <summary>
/// Mô hình dữ liệu cho yêu cầu tạo loại phòng mới
/// </summary>
public class CreateRoomTypeRequest
{
    [Required(ErrorMessage = "Tên loại phòng là bắt buộc")]
    public string Name { get; set; } = string.Empty;
    
    public string? Description { get; set; }
    
    [Required(ErrorMessage = "Giá cơ bản là bắt buộc")]
    [Range(0, 10000000, ErrorMessage = "Giá cơ bản phải từ 0 đến 10000000")]
    public decimal BasePrice { get; set; }
    
    [Required(ErrorMessage = "Sức chứa là bắt buộc")]
    [Range(1, 10, ErrorMessage = "Sức chứa phải từ 1 đến 10")]
    public int Capacity { get; set; }
}

/// <summary>
/// Mô hình dữ liệu cho yêu cầu cập nhật loại phòng
/// </summary>
public class UpdateRoomTypeRequest
{
    public string? Name { get; set; }
    public string? Description { get; set; }
    
    [Range(0, 10000000, ErrorMessage = "Giá cơ bản phải từ 0 đến 10000000")]
    public decimal? BasePrice { get; set; }
    
    [Range(1, 10, ErrorMessage = "Sức chứa phải từ 1 đến 10")]
    public int? Capacity { get; set; }
}

/// <summary>
/// Mô hình dữ liệu cho yêu cầu tải lên hình ảnh phòng
/// </summary>
public class UploadRoomImageRequest
{
    [Required(ErrorMessage = "ID loại phòng là bắt buộc")]
    public int RoomTypeId { get; set; }
    
    [Required(ErrorMessage = "Hình ảnh là bắt buộc")]
    public IFormFile Image { get; set; } = null!;
    
    public bool IsPrimary { get; set; } = false;
}
