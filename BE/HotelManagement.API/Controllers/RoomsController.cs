using System.Security.Claims;
using HotelManagement.API.Models;
using HotelManagement.Application.Common.Interfaces;
using HotelManagement.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HotelManagement.API.Controllers;

/// <summary>
/// Controller xử lý các API liên quan đến quản lý phòng
/// </summary>
[ApiController]
[Route("api/rooms")]
public class RoomsController : ControllerBase
{
    private readonly IRoomRepository _roomRepository;
    private readonly IRoomTypeRepository _roomTypeRepository;
    private readonly IWebHostEnvironment _environment;
    private readonly ILogger<RoomsController> _logger;

    public RoomsController(
        IRoomRepository roomRepository,
        IRoomTypeRepository roomTypeRepository,
        IWebHostEnvironment environment,
        ILogger<RoomsController> logger)
    {
        _roomRepository = roomRepository;
        _roomTypeRepository = roomTypeRepository;
        _environment = environment;
        _logger = logger;
    }

    /// <summary>
    /// API lấy danh sách phòng
    /// </summary>
    /// <returns>Danh sách phòng</returns>
    [HttpGet]
    public async Task<IActionResult> GetAllRooms()
    {
        var rooms = await _roomRepository.GetAllAsync();
        
        var result = rooms.Select(r => new RoomDto
        {
            Id = r.Id,
            RoomNumber = r.RoomNumber,
            RoomTypeId = r.RoomTypeId,
            RoomTypeName = r.RoomType?.Name ?? string.Empty,
            Status = r.Status,
            Floor = r.Floor,
            BasePrice = r.RoomType?.BasePrice ?? 0,
            Capacity = r.RoomType?.Capacity ?? 0,
            Features = r.RoomType?.RoomFeatures?
                .Where(rf => rf.FeatureType == "amenity")
                .Select(rf => new RoomFeatureDto
                {
                    Id = rf.Id,
                    Name = rf.Name,
                    Value = rf.Value
                }).ToList() ?? new List<RoomFeatureDto>(),
            Images = r.RoomType?.RoomFeatures?
                .Where(rf => rf.FeatureType == "image")
                .Select(rf => new RoomImageDto
                {
                    Id = rf.Id,
                    Url = rf.Value ?? string.Empty,
                    IsPrimary = rf.IsPrimary
                }).ToList() ?? new List<RoomImageDto>()
        });
        
        return Ok(result);
    }

    /// <summary>
    /// API lấy thông tin phòng theo ID
    /// </summary>
    /// <param name="id">ID phòng</param>
    /// <returns>Thông tin phòng</returns>
    [HttpGet("{id}")]
    public async Task<IActionResult> GetRoomById(int id)
    {
        var room = await _roomRepository.GetByIdAsync(id);
        
        if (room == null)
        {
            return NotFound(new { message = "Không tìm thấy phòng" });
        }
        
        var result = new RoomDto
        {
            Id = room.Id,
            RoomNumber = room.RoomNumber,
            RoomTypeId = room.RoomTypeId,
            RoomTypeName = room.RoomType?.Name ?? string.Empty,
            Status = room.Status,
            Floor = room.Floor,
            BasePrice = room.RoomType?.BasePrice ?? 0,
            Capacity = room.RoomType?.Capacity ?? 0,
            Features = room.RoomType?.RoomFeatures?
                .Where(rf => rf.FeatureType == "amenity")
                .Select(rf => new RoomFeatureDto
                {
                    Id = rf.Id,
                    Name = rf.Name,
                    Value = rf.Value
                }).ToList() ?? new List<RoomFeatureDto>(),
            Images = room.RoomType?.RoomFeatures?
                .Where(rf => rf.FeatureType == "image")
                .Select(rf => new RoomImageDto
                {
                    Id = rf.Id,
                    Url = rf.Value ?? string.Empty,
                    IsPrimary = rf.IsPrimary
                }).ToList() ?? new List<RoomImageDto>()
        };
        
        return Ok(result);
    }

    /// <summary>
    /// API lấy danh sách phòng có sẵn trong khoảng thời gian
    /// </summary>
    /// <param name="checkIn">Ngày check-in</param>
    /// <param name="checkOut">Ngày check-out</param>
    /// <returns>Danh sách phòng có sẵn</returns>
    [HttpGet("available")]
    public async Task<IActionResult> GetAvailableRooms([FromQuery] DateTime checkIn, [FromQuery] DateTime checkOut)
    {
        if (checkIn >= checkOut)
        {
            return BadRequest(new { message = "Ngày check-out phải sau ngày check-in" });
        }
        
        var rooms = await _roomRepository.GetAvailableRoomsAsync(checkIn, checkOut);
        
        var result = rooms.Select(r => new RoomDto
        {
            Id = r.Id,
            RoomNumber = r.RoomNumber,
            RoomTypeId = r.RoomTypeId,
            RoomTypeName = r.RoomType?.Name ?? string.Empty,
            Status = r.Status,
            Floor = r.Floor,
            BasePrice = r.RoomType?.BasePrice ?? 0,
            Capacity = r.RoomType?.Capacity ?? 0,
            Features = r.RoomType?.RoomFeatures?
                .Where(rf => rf.FeatureType == "amenity")
                .Select(rf => new RoomFeatureDto
                {
                    Id = rf.Id,
                    Name = rf.Name,
                    Value = rf.Value
                }).ToList() ?? new List<RoomFeatureDto>(),
            Images = r.RoomType?.RoomFeatures?
                .Where(rf => rf.FeatureType == "image")
                .Select(rf => new RoomImageDto
                {
                    Id = rf.Id,
                    Url = rf.Value ?? string.Empty,
                    IsPrimary = rf.IsPrimary
                }).ToList() ?? new List<RoomImageDto>()
        });
        
        return Ok(result);
    }

    /// <summary>
    /// API tạo phòng mới
    /// </summary>
    /// <param name="request">Thông tin phòng mới</param>
    /// <returns>Kết quả tạo phòng</returns>
    [HttpPost]
    [Authorize(Policy = "EmployeeAndAdmin")]
    public async Task<IActionResult> CreateRoom([FromBody] CreateRoomRequest request)
    {
        // Kiểm tra loại phòng tồn tại
        var roomType = await _roomTypeRepository.GetByIdAsync(request.RoomTypeId);
        if (roomType == null)
        {
            return BadRequest(new { message = "Loại phòng không tồn tại" });
        }
        
        // Kiểm tra số phòng đã tồn tại chưa
        var existingRoom = await _roomRepository.GetByRoomNumberAsync(request.RoomNumber);
        if (existingRoom != null)
        {
            return BadRequest(new { message = "Số phòng đã tồn tại" });
        }
        
        // Tạo phòng mới
        var room = new Room
        {
            RoomNumber = request.RoomNumber,
            RoomTypeId = request.RoomTypeId,
            Status = request.Status,
            Floor = request.Floor
        };
        
        var roomId = await _roomRepository.CreateAsync(room);
        
        _logger.LogInformation("Phòng mới được tạo: {RoomNumber}, ID: {RoomId}", request.RoomNumber, roomId);
        
        return CreatedAtAction(nameof(GetRoomById), new { id = roomId }, new
        {
            roomId = roomId,
            message = "Tạo phòng thành công"
        });
    }

    /// <summary>
    /// API cập nhật thông tin phòng
    /// </summary>
    /// <param name="id">ID phòng</param>
    /// <param name="request">Thông tin cập nhật</param>
    /// <returns>Kết quả cập nhật</returns>
    [HttpPut("{id}")]
    [Authorize(Policy = "EmployeeAndAdmin")]
    public async Task<IActionResult> UpdateRoom(int id, [FromBody] UpdateRoomRequest request)
    {
        // Kiểm tra phòng tồn tại
        var room = await _roomRepository.GetByIdAsync(id);
        if (room == null)
        {
            return NotFound(new { message = "Không tìm thấy phòng" });
        }
        
        // Kiểm tra loại phòng tồn tại nếu có cập nhật
        if (request.RoomTypeId.HasValue)
        {
            var roomType = await _roomTypeRepository.GetByIdAsync(request.RoomTypeId.Value);
            if (roomType == null)
            {
                return BadRequest(new { message = "Loại phòng không tồn tại" });
            }
            
            room.RoomTypeId = request.RoomTypeId.Value;
        }
        
        // Kiểm tra số phòng đã tồn tại chưa nếu có cập nhật
        if (!string.IsNullOrEmpty(request.RoomNumber) && request.RoomNumber != room.RoomNumber)
        {
            var existingRoom = await _roomRepository.GetByRoomNumberAsync(request.RoomNumber);
            if (existingRoom != null)
            {
                return BadRequest(new { message = "Số phòng đã tồn tại" });
            }
            
            room.RoomNumber = request.RoomNumber;
        }
        
        // Cập nhật thông tin khác
        if (!string.IsNullOrEmpty(request.Status))
        {
            room.Status = request.Status;
        }
        
        if (request.Floor.HasValue)
        {
            room.Floor = request.Floor.Value;
        }
        
        await _roomRepository.UpdateAsync(room);
        
        _logger.LogInformation("Cập nhật thông tin phòng: {RoomId}", id);
        
        return Ok(new { message = "Cập nhật phòng thành công" });
    }

    /// <summary>
    /// API xóa phòng
    /// </summary>
    /// <param name="id">ID phòng</param>
    /// <returns>Kết quả xóa</returns>
    [HttpDelete("{id}")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> DeleteRoom(int id)
    {
        // Kiểm tra phòng tồn tại
        var room = await _roomRepository.GetByIdAsync(id);
        if (room == null)
        {
            return NotFound(new { message = "Không tìm thấy phòng" });
        }
        
        // Kiểm tra phòng có đang được đặt không
        var hasActiveBookings = await _roomRepository.HasActiveBookingsAsync(id);
        if (hasActiveBookings)
        {
            return BadRequest(new { message = "Không thể xóa phòng đang có đặt phòng" });
        }
        
        await _roomRepository.DeleteAsync(id);
        
        _logger.LogInformation("Xóa phòng: {RoomId}", id);
        
        return Ok(new { message = "Xóa phòng thành công" });
    }

    /// <summary>
    /// API tải lên hình ảnh phòng
    /// </summary>
    /// <param name="request">Thông tin hình ảnh</param>
    /// <returns>Kết quả tải lên</returns>
    [HttpPost("image")]
    [Authorize(Policy = "EmployeeAndAdmin")]
    public async Task<IActionResult> UploadRoomImage([FromForm] UploadRoomImageRequest request)
    {
        // Kiểm tra loại phòng tồn tại
        var roomType = await _roomTypeRepository.GetByIdAsync(request.RoomTypeId);
        if (roomType == null)
        {
            return BadRequest(new { message = "Loại phòng không tồn tại" });
        }
        
        // Lưu hình ảnh
        var fileName = $"{Guid.NewGuid()}_{request.Image.FileName}";
        var uploadsFolder = Path.Combine(_environment.WebRootPath, "images", "rooms");
        
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
        var imageUrl = $"/images/rooms/{fileName}";
        
        // Tạo tính năng hình ảnh
        var feature = new RoomFeature
        {
            RoomTypeId = request.RoomTypeId,
            FeatureType = "image",
            Name = "RoomImage",
            Value = imageUrl,
            IsPrimary = request.IsPrimary
        };
        
        // Nếu là hình ảnh chính, cập nhật hình ảnh chính
        if (request.IsPrimary)
        {
            await _roomTypeRepository.UpdatePrimaryImageAsync(request.RoomTypeId, feature);
        }
        else
        {
            await _roomTypeRepository.AddFeatureAsync(feature);
        }
        
        _logger.LogInformation("Tải lên hình ảnh cho loại phòng: {RoomTypeId}", request.RoomTypeId);
        
        return Ok(new 
        { 
            message = "Tải lên hình ảnh thành công",
            imageUrl = imageUrl
        });
    }

    /// <summary>
    /// API xóa hình ảnh phòng
    /// </summary>
    /// <param name="roomId">ID phòng</param>
    /// <param name="imageId">ID hình ảnh</param>
    /// <returns>Kết quả xóa</returns>
    [HttpDelete("{roomId}/image/{imageId}")]
    [Authorize(Policy = "EmployeeAndAdmin")]
    public async Task<IActionResult> DeleteRoomImage(int roomId, int imageId)
    {
        // Kiểm tra phòng tồn tại
        var room = await _roomRepository.GetByIdAsync(roomId);
        if (room == null)
        {
            return NotFound(new { message = "Không tìm thấy phòng" });
        }
        
        // Kiểm tra hình ảnh tồn tại
        var feature = await _roomTypeRepository.GetFeatureByIdAsync(imageId);
        if (feature == null || feature.FeatureType != "image")
        {
            return NotFound(new { message = "Không tìm thấy hình ảnh" });
        }
        
        // Xóa file hình ảnh
        if (!string.IsNullOrEmpty(feature.Value))
        {
            var imagePath = Path.Combine(_environment.WebRootPath, feature.Value.TrimStart('/'));
            if (System.IO.File.Exists(imagePath))
            {
                System.IO.File.Delete(imagePath);
            }
        }
        
        // Xóa tính năng hình ảnh
        await _roomTypeRepository.DeleteFeatureAsync(imageId);
        
        _logger.LogInformation("Xóa hình ảnh: {ImageId} của phòng: {RoomId}", imageId, roomId);
        
        return Ok(new { message = "Xóa hình ảnh thành công" });
    }

    /// <summary>
    /// API lấy danh sách tiện nghi phòng
    /// </summary>
    /// <returns>Danh sách tiện nghi</returns>
    [HttpGet("amenities")]
    public async Task<IActionResult> GetAllAmenities()
    {
        var amenities = await _roomTypeRepository.GetAllAmenitiesAsync();
        return Ok(amenities);
    }
}
