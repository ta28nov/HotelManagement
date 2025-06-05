using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using System;
using System.IO;
using System.Threading.Tasks;
using HotelManagement.Infrastructure.Data;
using HotelManagement.Domain.Entities;
using System.Linq;

namespace HotelManagement.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ImagesController : ControllerBase
    {
        private readonly HotelDbContext _context;
        private readonly IWebHostEnvironment _environment;

        public ImagesController(HotelDbContext context, IWebHostEnvironment environment)
        {
            _context = context;
            _environment = environment;
        }

        // POST: api/Images/RoomType/{roomTypeId}
        [HttpPost("RoomType/{roomTypeId}")]
        [Authorize(Roles = "admin,employee")]
        public async Task<IActionResult> UploadRoomTypeImage(int roomTypeId, [FromForm] IFormFile file, [FromForm] bool isPrimary = false)
        {
            // Kiểm tra roomTypeId có tồn tại
            var roomType = await _context.RoomTypes.FindAsync(roomTypeId);
            if (roomType == null)
            {
                return NotFound($"Không tìm thấy loại phòng với ID: {roomTypeId}");
            }

            // Kiểm tra file
            if (file == null || file.Length == 0)
            {
                return BadRequest("Không có file nào được tải lên");
            }

            // Kiểm tra định dạng file
            var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif" };
            var fileExtension = Path.GetExtension(file.FileName).ToLowerInvariant();
            if (!allowedExtensions.Contains(fileExtension))
            {
                return BadRequest("Chỉ chấp nhận file hình ảnh (jpg, jpeg, png, gif)");
            }

            try
            {
                // Tạo tên file duy nhất
                var fileName = $"room_{roomTypeId}_{DateTime.Now.Ticks}{fileExtension}";
                
                // Đường dẫn lưu file
                var roomsFolder = Path.Combine(_environment.WebRootPath, "images", "rooms");
                if (!Directory.Exists(roomsFolder))
                {
                    Directory.CreateDirectory(roomsFolder);
                }
                
                var filePath = Path.Combine(roomsFolder, fileName);
                
                // Lưu file
                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }

                // Nếu là hình ảnh chính, cập nhật tất cả các hình ảnh khác thành không phải chính
                if (isPrimary)
                {
                    var existingPrimaryImages = await _context.RoomFeatures
                        .Where(rf => rf.RoomTypeId == roomTypeId && rf.FeatureType == "image" && rf.IsPrimary)
                        .ToListAsync();
                    
                    foreach (var img in existingPrimaryImages)
                    {
                        img.IsPrimary = false;
                    }
                }

                // Lưu thông tin vào database
                var imagePath = $"/images/rooms/{fileName}";
                var roomFeature = new RoomFeature
                {
                    RoomTypeId = roomTypeId,
                    FeatureType = "image",
                    Name = "RoomImage",
                    Value = imagePath,
                    IsPrimary = isPrimary
                };

                _context.RoomFeatures.Add(roomFeature);
                await _context.SaveChangesAsync();

                return Ok(new { 
                    message = "Tải lên hình ảnh thành công", 
                    imagePath = imagePath,
                    featureId = roomFeature.Id,
                    isPrimary = isPrimary
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Lỗi khi tải lên hình ảnh: {ex.Message}");
            }
        }

        // POST: api/Images/Service/{serviceId}
        [HttpPost("Service/{serviceId}")]
        [Authorize(Roles = "admin,employee")]
        public async Task<IActionResult> UploadServiceImage(int serviceId, [FromForm] IFormFile file)
        {
            // Kiểm tra serviceId có tồn tại
            var service = await _context.Services.FindAsync(serviceId);
            if (service == null)
            {
                return NotFound($"Không tìm thấy dịch vụ với ID: {serviceId}");
            }

            // Kiểm tra file
            if (file == null || file.Length == 0)
            {
                return BadRequest("Không có file nào được tải lên");
            }

            // Kiểm tra định dạng file
            var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif" };
            var fileExtension = Path.GetExtension(file.FileName).ToLowerInvariant();
            if (!allowedExtensions.Contains(fileExtension))
            {
                return BadRequest("Chỉ chấp nhận file hình ảnh (jpg, jpeg, png, gif)");
            }

            try
            {
                // Tạo tên file duy nhất
                var fileName = $"service_{serviceId}_{DateTime.Now.Ticks}{fileExtension}";
                
                // Đường dẫn lưu file
                var servicesFolder = Path.Combine(_environment.WebRootPath, "images", "services");
                if (!Directory.Exists(servicesFolder))
                {
                    Directory.CreateDirectory(servicesFolder);
                }
                
                var filePath = Path.Combine(servicesFolder, fileName);
                
                // Lưu file
                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }

                // Xóa hình ảnh cũ nếu có
                if (!string.IsNullOrEmpty(service.ImageUrl))
                {
                    var oldImagePath = Path.Combine(_environment.WebRootPath, service.ImageUrl.TrimStart('/'));
                    if (System.IO.File.Exists(oldImagePath))
                    {
                        System.IO.File.Delete(oldImagePath);
                    }
                }

                // Cập nhật đường dẫn hình ảnh trong database
                var imagePath = $"/images/services/{fileName}";
                service.ImageUrl = imagePath;
                await _context.SaveChangesAsync();

                return Ok(new { 
                    message = "Tải lên hình ảnh thành công", 
                    imagePath = imagePath 
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Lỗi khi tải lên hình ảnh: {ex.Message}");
            }
        }

        // DELETE: api/Images/RoomType/{featureId}
        [HttpDelete("RoomType/{featureId}")]
        [Authorize(Roles = "admin,employee")]
        public async Task<IActionResult> DeleteRoomTypeImage(int featureId)
        {
            var feature = await _context.RoomFeatures.FindAsync(featureId);
            if (feature == null || feature.FeatureType != "image")
            {
                return NotFound("Không tìm thấy hình ảnh");
            }

            try
            {
                // Xóa file
                var imagePath = Path.Combine(_environment.WebRootPath, feature.Value.TrimStart('/'));
                if (System.IO.File.Exists(imagePath))
                {
                    System.IO.File.Delete(imagePath);
                }

                // Xóa record trong database
                _context.RoomFeatures.Remove(feature);
                await _context.SaveChangesAsync();

                return Ok(new { message = "Xóa hình ảnh thành công" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Lỗi khi xóa hình ảnh: {ex.Message}");
            }
        }

        // GET: api/Images/RoomType/{roomTypeId}
        [HttpGet("RoomType/{roomTypeId}")]
        public async Task<IActionResult> GetRoomTypeImages(int roomTypeId)
        {
            var images = await _context.RoomFeatures
                .Where(rf => rf.RoomTypeId == roomTypeId && rf.FeatureType == "image")
                .Select(rf => new
                {
                    rf.Id,
                    rf.Value,
                    rf.IsPrimary
                })
                .ToListAsync();

            return Ok(images);
        }

        // PUT: api/Images/RoomType/{featureId}/SetPrimary
        [HttpPut("RoomType/{featureId}/SetPrimary")]
        [Authorize(Roles = "admin,employee")]
        public async Task<IActionResult> SetPrimaryImage(int featureId)
        {
            var feature = await _context.RoomFeatures.FindAsync(featureId);
            if (feature == null || feature.FeatureType != "image")
            {
                return NotFound("Không tìm thấy hình ảnh");
            }

            try
            {
                // Cập nhật tất cả các hình ảnh khác của loại phòng này thành không phải chính
                var otherImages = await _context.RoomFeatures
                    .Where(rf => rf.RoomTypeId == feature.RoomTypeId && rf.FeatureType == "image" && rf.Id != featureId)
                    .ToListAsync();
                
                foreach (var img in otherImages)
                {
                    img.IsPrimary = false;
                }

                // Đặt hình ảnh này làm hình ảnh chính
                feature.IsPrimary = true;
                await _context.SaveChangesAsync();

                return Ok(new { message = "Đã đặt làm hình ảnh chính" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Lỗi khi cập nhật hình ảnh: {ex.Message}");
            }
        }
    }
}
