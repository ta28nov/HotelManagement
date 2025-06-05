using AutoMapper;
using HotelManagement.API.Models;
using HotelManagement.Application.Common.Interfaces;
using HotelManagement.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HotelManagement.API.Controllers;

/// <summary>
/// Controller quản lý loại phòng
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class RoomTypesController : ControllerBase
{
    private readonly IRoomTypeRepository _roomTypeRepository;
    private readonly IMapper _mapper;
    private readonly ILogger<RoomTypesController> _logger;

    public RoomTypesController(
        IRoomTypeRepository roomTypeRepository,
        IMapper mapper,
        ILogger<RoomTypesController> logger)
    {
        _roomTypeRepository = roomTypeRepository;
        _mapper = mapper;
        _logger = logger;
    }

    /// <summary>
    /// Lấy tất cả loại phòng
    /// </summary>
    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<RoomTypeDto>>> GetAll()
    {
        try
        {
            _logger.LogInformation("Đang lấy danh sách tất cả loại phòng");
            
            var roomTypes = await _roomTypeRepository.GetAllAsync();
            return Ok(_mapper.Map<IEnumerable<RoomTypeDto>>(roomTypes));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi lấy danh sách loại phòng");
            return StatusCode(500, new { message = "Đã xảy ra lỗi khi lấy danh sách loại phòng" });
        }
    }

    /// <summary>
    /// Lấy loại phòng theo ID
    /// </summary>
    [HttpGet("{id}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<RoomTypeDto>> GetById(int id)
    {
        try
        {
            _logger.LogInformation("Đang lấy thông tin loại phòng ID: {Id}", id);
            
            var roomType = await _roomTypeRepository.GetByIdAsync(id);
            
            if (roomType == null)
            {
                _logger.LogWarning("Không tìm thấy loại phòng ID: {Id}", id);
                return NotFound(new { message = "Không tìm thấy loại phòng" });
            }
            
            return Ok(_mapper.Map<RoomTypeDto>(roomType));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi lấy thông tin loại phòng ID: {Id}", id);
            return StatusCode(500, new { message = "Đã xảy ra lỗi khi lấy thông tin loại phòng" });
        }
    }

    /// <summary>
    /// Tạo loại phòng mới
    /// </summary>
    [HttpPost]
    [Authorize(Policy = "EmployeeAndAdmin")]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<RoomTypeDto>> Create([FromBody] CreateRoomTypeRequest request)
    {
        try
        {
            _logger.LogInformation("Đang tạo loại phòng mới: {Name}", request.Name);
            
            // Tạo loại phòng mới
            var roomType = new RoomType
            {
                Name = request.Name,
                Description = request.Description,
                BasePrice = request.BasePrice,
                Capacity = request.Capacity
            };

            var roomTypeId = await _roomTypeRepository.CreateAsync(roomType);
            var createdRoomType = await _roomTypeRepository.GetByIdAsync(roomTypeId);
            
            _logger.LogInformation("Đã tạo loại phòng thành công ID: {Id}", roomTypeId);
            
            return CreatedAtAction(nameof(GetById), new { id = roomTypeId }, _mapper.Map<RoomTypeDto>(createdRoomType));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi tạo loại phòng mới");
            return StatusCode(500, new { message = "Đã xảy ra lỗi khi tạo loại phòng" });
        }
    }

    /// <summary>
    /// Cập nhật loại phòng
    /// </summary>
    [HttpPut("{id}")]
    [Authorize(Policy = "EmployeeAndAdmin")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateRoomTypeRequest request)
    {
        try
        {
            _logger.LogInformation("Đang cập nhật loại phòng ID: {Id}", id);
            
            var roomType = await _roomTypeRepository.GetByIdAsync(id);
            
            if (roomType == null)
            {
                _logger.LogWarning("Không tìm thấy loại phòng ID: {Id}", id);
                return NotFound(new { message = "Không tìm thấy loại phòng" });
            }

            // Cập nhật thông tin loại phòng
            roomType.Name = request.Name ?? roomType.Name;
            roomType.Description = request.Description ?? roomType.Description;
            
            if (request.BasePrice.HasValue)
            {
                roomType.BasePrice = request.BasePrice.Value;
            }
            
            if (request.Capacity.HasValue)
            {
                roomType.Capacity = request.Capacity.Value;
            }

            await _roomTypeRepository.UpdateAsync(roomType);
            
            _logger.LogInformation("Đã cập nhật loại phòng ID: {Id} thành công", id);
            
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi cập nhật loại phòng ID: {Id}", id);
            return StatusCode(500, new { message = "Đã xảy ra lỗi khi cập nhật loại phòng" });
        }
    }

    /// <summary>
    /// Xóa loại phòng
    /// </summary>
    [HttpDelete("{id}")]
    [Authorize(Policy = "AdminOnly")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(int id)
    {
        try
        {
            _logger.LogInformation("Đang xóa loại phòng ID: {Id}", id);
            
            var roomType = await _roomTypeRepository.GetByIdAsync(id);
            
            if (roomType == null)
            {
                _logger.LogWarning("Không tìm thấy loại phòng ID: {Id}", id);
                return NotFound(new { message = "Không tìm thấy loại phòng" });
            }
            
            await _roomTypeRepository.DeleteAsync(id);
            
            _logger.LogInformation("Đã xóa loại phòng ID: {Id} thành công", id);
            
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi xóa loại phòng ID: {Id}", id);
            return StatusCode(500, new { message = "Đã xảy ra lỗi khi xóa loại phòng" });
        }
    }
}
