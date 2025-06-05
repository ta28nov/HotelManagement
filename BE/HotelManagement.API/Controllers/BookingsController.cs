using System.Security.Claims;
using HotelManagement.API.Models;
using HotelManagement.Application.Common.Interfaces;
using HotelManagement.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HotelManagement.API.Controllers;

/// <summary>
/// Controller xử lý các API liên quan đến quản lý đặt phòng
/// </summary>
[ApiController]
[Route("api/bookings")]
public class BookingsController : ControllerBase
{
    private readonly IBookingRepository _bookingRepository;
    private readonly IRoomRepository _roomRepository;
    private readonly IUserRepository _userRepository;
    private readonly IServiceRepository _serviceRepository;
    private readonly ILogger<BookingsController> _logger;

    public BookingsController(
        IBookingRepository bookingRepository,
        IRoomRepository roomRepository,
        IUserRepository userRepository,
        IServiceRepository serviceRepository,
        ILogger<BookingsController> logger)
    {
        _bookingRepository = bookingRepository;
        _roomRepository = roomRepository;
        _userRepository = userRepository;
        _serviceRepository = serviceRepository;
        _logger = logger;
    }

    /// <summary>
    /// API lấy danh sách đặt phòng
    /// </summary>
    /// <returns>Danh sách đặt phòng</returns>
    [HttpGet]
    [Authorize(Policy = "EmployeeAndAdmin")]
    public async Task<IActionResult> GetAllBookings()
    {
        var bookings = await _bookingRepository.GetAllAsync();
        
        var result = bookings.Select(b => MapBookingToDto(b));
        
        return Ok(result);
    }

    /// <summary>
    /// API lấy thông tin đặt phòng theo ID
    /// </summary>
    /// <param name="id">ID đặt phòng</param>
    /// <returns>Thông tin đặt phòng</returns>
    [HttpGet("{id}")]
    [Authorize(Policy = "AllUsers")]
    public async Task<IActionResult> GetBookingById(int id)
    {
        var booking = await _bookingRepository.GetByIdAsync(id);
        
        if (booking == null)
        {
            return NotFound(new { message = "Không tìm thấy đặt phòng" });
        }
        
        // Kiểm tra quyền truy cập
        if (User.FindFirst(ClaimTypes.Role)?.Value == "customer")
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null)
            {
                return Unauthorized(new { message = "Token không hợp lệ" });
            }

            var userId = int.Parse(userIdClaim.Value);
            
            // Kiểm tra đặt phòng có thuộc về khách hàng không
            if (booking.Customer?.UserId != userId)
            {
                return Forbid();
            }
        }
        
        var result = MapBookingToDto(booking);
        
        return Ok(result);
    }

    /// <summary>
    /// API lấy danh sách đặt phòng của người dùng hiện tại
    /// </summary>
    /// <returns>Danh sách đặt phòng</returns>
    [HttpGet("my-bookings")]
    [Authorize]
    public async Task<IActionResult> GetMyBookings()
    {
        // Lấy ID người dùng từ token
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
        if (userIdClaim == null)
        {
            return Unauthorized(new { message = "Token không hợp lệ" });
        }

        var userId = int.Parse(userIdClaim.Value);
        
        // Lấy thông tin người dùng
        var user = await _userRepository.GetByIdAsync(userId);
        if (user == null)
        {
            return NotFound(new { message = "Không tìm thấy người dùng" });
        }
        
        // Lấy danh sách đặt phòng
        IEnumerable<Booking> bookings;
        
        if (user.Role == "customer")
        {
            // Nếu là khách hàng, chỉ lấy đặt phòng của khách hàng đó
            bookings = await _bookingRepository.FilterBookingsAsync(
                null, null, null, null, userId, null);
        }
        else
        {
            // Nếu là nhân viên hoặc admin, lấy tất cả đặt phòng
            bookings = await _bookingRepository.GetAllAsync();
        }
        
        var result = bookings.Select(b => MapBookingToDto(b));
        
        return Ok(result);
    }

    /// <summary>
    /// API lọc và tìm kiếm đặt phòng
    /// </summary>
    /// <param name="fromDate">Từ ngày</param>
    /// <param name="toDate">Đến ngày</param>
    /// <param name="status">Trạng thái</param>
    /// <param name="paymentStatus">Trạng thái thanh toán</param>
    /// <param name="customerId">ID khách hàng</param>
    /// <param name="roomId">ID phòng</param>
    /// <returns>Danh sách đặt phòng</returns>
    [HttpGet("filter")]
    [Authorize(Policy = "EmployeeAndAdmin")]
    public async Task<IActionResult> FilterBookings(
        [FromQuery] DateTime? fromDate,
        [FromQuery] DateTime? toDate,
        [FromQuery] string? status,
        [FromQuery] string? paymentStatus,
        [FromQuery] int? customerId,
        [FromQuery] int? roomId)
    {
        var bookings = await _bookingRepository.FilterBookingsAsync(
            fromDate, toDate, status, paymentStatus, customerId, roomId);
            
        var result = bookings.Select(b => MapBookingToDto(b));
        
        return Ok(result);
    }

    /// <summary>
    /// API tạo đặt phòng mới
    /// </summary>
    /// <param name="request">Thông tin đặt phòng mới</param>
    /// <returns>Kết quả tạo đặt phòng</returns>
    [HttpPost]
    [Authorize(Policy = "AllUsers")]
    public async Task<IActionResult> CreateBooking([FromBody] CreateBookingRequest request)
    {
        // Kiểm tra phòng tồn tại
        var room = await _roomRepository.GetByIdAsync(request.RoomId);
        if (room == null)
        {
            return BadRequest(new { message = "Phòng không tồn tại" });
        }
        
        // Kiểm tra phòng có sẵn trong khoảng thời gian
        var isAvailable = await _roomRepository.IsRoomAvailableAsync(
            request.RoomId, request.CheckInDate, request.CheckOutDate);
            
        if (!isAvailable)
        {
            return BadRequest(new { message = "Phòng không có sẵn trong khoảng thời gian này" });
        }
        
        // Tính tổng tiền
        var totalDays = (request.CheckOutDate - request.CheckInDate).Days;
        if (totalDays <= 0)
        {
            return BadRequest(new { message = "Ngày check-out phải sau ngày check-in" });
        }
        
        var totalAmount = room.RoomType?.BasePrice * totalDays ?? 0;
        
        // Tạo đặt phòng mới
        var booking = new Booking
        {
            CustomerId = request.CustomerId,
            RoomId = request.RoomId,
            CheckInDate = request.CheckInDate,
            CheckOutDate = request.CheckOutDate,
            Adults = request.Adults,
            Children = request.Children,
            TotalAmount = totalAmount,
            Status = "pending",
            PaymentStatus = "pending",
            CreatedAt = DateTime.UtcNow
        };
        
        var bookingId = await _bookingRepository.CreateAsync(booking);
        
        // Thêm lịch sử đặt phòng
        var history = new BookingHistory
        {
            BookingId = bookingId,
            Status = "pending",
            PaymentStatus = "pending",
            ChangedAt = DateTime.UtcNow,
            ChangedBy = User.FindFirst(ClaimTypes.NameIdentifier) != null ? 
                int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value) : null,
            Notes = "Đặt phòng ban đầu"
        };
        
        await _bookingRepository.AddBookingHistoryAsync(history);
        
        _logger.LogInformation("Đặt phòng mới được tạo: {BookingId}", bookingId);
        
        return CreatedAtAction(nameof(GetBookingById), new { id = bookingId }, new
        {
            bookingId = bookingId,
            message = "Tạo đặt phòng thành công"
        });
    }

    /// <summary>
    /// API cập nhật thông tin đặt phòng
    /// </summary>
    /// <param name="id">ID đặt phòng</param>
    /// <param name="request">Thông tin cập nhật</param>
    /// <returns>Kết quả cập nhật</returns>
    [HttpPut("{id}")]
    [Authorize(Policy = "EmployeeAndAdmin")]
    public async Task<IActionResult> UpdateBooking(int id, [FromBody] UpdateBookingRequest request)
    {
        // Kiểm tra đặt phòng tồn tại
        var booking = await _bookingRepository.GetByIdAsync(id);
        if (booking == null)
        {
            return NotFound(new { message = "Không tìm thấy đặt phòng" });
        }
        
        // Kiểm tra phòng có sẵn nếu có thay đổi phòng hoặc ngày
        if (request.RoomId.HasValue || request.CheckInDate.HasValue || request.CheckOutDate.HasValue)
        {
            var roomId = request.RoomId ?? booking.RoomId;
            var checkInDate = request.CheckInDate ?? booking.CheckInDate;
            var checkOutDate = request.CheckOutDate ?? booking.CheckOutDate;
            
            // Kiểm tra phòng tồn tại
            var room = await _roomRepository.GetByIdAsync(roomId);
            if (room == null)
            {
                return BadRequest(new { message = "Phòng không tồn tại" });
            }
            
            // Kiểm tra phòng có sẵn
            var isAvailable = await _roomRepository.IsRoomAvailableForUpdateAsync(
                roomId, checkInDate, checkOutDate, id);
                
            if (!isAvailable)
            {
                return BadRequest(new { message = "Phòng không có sẵn trong khoảng thời gian này" });
            }
            
            // Cập nhật thông tin
            booking.RoomId = roomId;
            booking.CheckInDate = checkInDate;
            booking.CheckOutDate = checkOutDate;
            
            // Tính lại tổng tiền
            var totalDays = (checkOutDate - checkInDate).Days;
            if (totalDays <= 0)
            {
                return BadRequest(new { message = "Ngày check-out phải sau ngày check-in" });
            }
            
            booking.TotalAmount = room.RoomType?.BasePrice * totalDays ?? 0;
        }
        
        // Cập nhật thông tin khác
        if (request.CustomerId.HasValue)
        {
            booking.CustomerId = request.CustomerId.Value;
        }
        
        if (request.Adults.HasValue)
        {
            booking.Adults = request.Adults.Value;
        }
        
        if (request.Children.HasValue)
        {
            booking.Children = request.Children.Value;
        }
        
        if (!string.IsNullOrEmpty(request.Status))
        {
            booking.Status = request.Status;
        }
        
        if (!string.IsNullOrEmpty(request.PaymentStatus))
        {
            booking.PaymentStatus = request.PaymentStatus;
        }
        
        await _bookingRepository.UpdateAsync(booking);
        
        // Thêm lịch sử đặt phòng
        var history = new BookingHistory
        {
            BookingId = id,
            Status = booking.Status,
            PaymentStatus = booking.PaymentStatus,
            ChangedAt = DateTime.UtcNow,
            ChangedBy = User.FindFirst(ClaimTypes.NameIdentifier) != null ? 
                int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value) : null,
            Notes = "Cập nhật thông tin đặt phòng"
        };
        
        await _bookingRepository.AddBookingHistoryAsync(history);
        
        _logger.LogInformation("Cập nhật thông tin đặt phòng: {BookingId}", id);
        
        return Ok(new { message = "Cập nhật đặt phòng thành công" });
    }

    /// <summary>
    /// API xóa đặt phòng
    /// </summary>
    /// <param name="id">ID đặt phòng</param>
    /// <returns>Kết quả xóa</returns>
    [HttpDelete("{id}")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> DeleteBooking(int id)
    {
        // Kiểm tra đặt phòng tồn tại
        var booking = await _bookingRepository.GetByIdAsync(id);
        if (booking == null)
        {
            return NotFound(new { message = "Không tìm thấy đặt phòng" });
        }
        
        await _bookingRepository.DeleteAsync(id);
        
        _logger.LogInformation("Xóa đặt phòng: {BookingId}", id);
        
        return Ok(new { message = "Xóa đặt phòng thành công" });
    }

    /// <summary>
    /// API check-in cho đặt phòng
    /// </summary>
    /// <param name="id">ID đặt phòng</param>
    /// <returns>Kết quả check-in</returns>
    [HttpPut("{id}/check-in")]
    [Authorize(Policy = "EmployeeAndAdmin")]
    public async Task<IActionResult> CheckIn(int id)
    {
        // Kiểm tra đặt phòng tồn tại
        var booking = await _bookingRepository.GetByIdAsync(id);
        if (booking == null)
        {
            return NotFound(new { message = "Không tìm thấy đặt phòng" });
        }
        
        // Kiểm tra trạng thái
        if (booking.Status != "confirmed")
        {
            return BadRequest(new { message = "Đặt phòng phải ở trạng thái đã xác nhận để check-in" });
        }
        
        // Cập nhật trạng thái
        booking.Status = "checked_in";
        
        await _bookingRepository.UpdateAsync(booking);
        
        // Thêm lịch sử đặt phòng
        var history = new BookingHistory
        {
            BookingId = id,
            Status = "checked_in",
            PaymentStatus = booking.PaymentStatus,
            ChangedAt = DateTime.UtcNow,
            ChangedBy = User.FindFirst(ClaimTypes.NameIdentifier) != null ? 
                int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value) : null,
            Notes = "Khách đã check-in"
        };
        
        await _bookingRepository.AddBookingHistoryAsync(history);
        
        _logger.LogInformation("Check-in đặt phòng: {BookingId}", id);
        
        return Ok(new { message = "Check-in thành công" });
    }

    /// <summary>
    /// API check-out cho đặt phòng
    /// </summary>
    /// <param name="id">ID đặt phòng</param>
    /// <returns>Kết quả check-out</returns>
    [HttpPut("{id}/check-out")]
    [Authorize(Policy = "EmployeeAndAdmin")]
    public async Task<IActionResult> CheckOut(int id)
    {
        // Kiểm tra đặt phòng tồn tại
        var booking = await _bookingRepository.GetByIdAsync(id);
        if (booking == null)
        {
            return NotFound(new { message = "Không tìm thấy đặt phòng" });
        }
        
        // Kiểm tra trạng thái
        if (booking.Status != "checked_in")
        {
            return BadRequest(new { message = "Đặt phòng phải ở trạng thái đã check-in để check-out" });
        }
        
        // Cập nhật trạng thái
        booking.Status = "checked_out";
        
        await _bookingRepository.UpdateAsync(booking);
        
        // Thêm lịch sử đặt phòng
        var history = new BookingHistory
        {
            BookingId = id,
            Status = "checked_out",
            PaymentStatus = booking.PaymentStatus,
            ChangedAt = DateTime.UtcNow,
            ChangedBy = User.FindFirst(ClaimTypes.NameIdentifier) != null ? 
                int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value) : null,
            Notes = "Khách đã check-out"
        };
        
        await _bookingRepository.AddBookingHistoryAsync(history);
        
        _logger.LogInformation("Check-out đặt phòng: {BookingId}", id);
        
        return Ok(new { message = "Check-out thành công" });
    }

    /// <summary>
    /// API cập nhật thanh toán
    /// </summary>
    /// <param name="id">ID đặt phòng</param>
    /// <param name="request">Thông tin thanh toán</param>
    /// <returns>Kết quả cập nhật</returns>
    [HttpPut("{id}/payment")]
    [Authorize(Policy = "EmployeeAndAdmin")]
    public async Task<IActionResult> UpdatePayment(int id, [FromBody] UpdatePaymentRequest request)
    {
        // Kiểm tra đặt phòng tồn tại
        var booking = await _bookingRepository.GetByIdAsync(id);
        if (booking == null)
        {
            return NotFound(new { message = "Không tìm thấy đặt phòng" });
        }
        
        // Cập nhật trạng thái thanh toán
        booking.PaymentStatus = request.PaymentStatus;
        
        await _bookingRepository.UpdateAsync(booking);
        
        // Thêm lịch sử đặt phòng
        var history = new BookingHistory
        {
            BookingId = id,
            Status = booking.Status,
            PaymentStatus = request.PaymentStatus,
            ChangedAt = DateTime.UtcNow,
            ChangedBy = User.FindFirst(ClaimTypes.NameIdentifier) != null ? 
                int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value) : null,
            Notes = request.Notes ?? "Cập nhật trạng thái thanh toán"
        };
        
        await _bookingRepository.AddBookingHistoryAsync(history);
        
        _logger.LogInformation("Cập nhật thanh toán đặt phòng: {BookingId}", id);
        
        return Ok(new { message = "Cập nhật thanh toán thành công" });
    }

    /// <summary>
    /// API xử lý thanh toán
    /// </summary>
    /// <param name="id">ID đặt phòng</param>
    /// <param name="request">Thông tin thanh toán</param>
    /// <returns>Kết quả thanh toán</returns>
    [HttpPost("{id}/payment/process")]
    [Authorize(Policy = "AllUsers")]
    public async Task<IActionResult> ProcessPayment(int id, [FromBody] ProcessPaymentRequest request)
    {
        // Kiểm tra đặt phòng tồn tại
        var booking = await _bookingRepository.GetByIdAsync(id);
        if (booking == null)
        {
            return NotFound(new { message = "Không tìm thấy đặt phòng" });
        }
        
        // Kiểm tra quyền truy cập
        if (User.FindFirst(ClaimTypes.Role)?.Value == "customer")
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null)
            {
                return Unauthorized(new { message = "Token không hợp lệ" });
            }

            var userId = int.Parse(userIdClaim.Value);
            
            // Kiểm tra đặt phòng có thuộc về khách hàng không
            if (booking.Customer?.UserId != userId)
            {
                return Forbid();
            }
        }
        
        // TODO: Tích hợp với cổng thanh toán thực tế
        // Giả lập xử lý thanh toán thành công
        
        // Cập nhật trạng thái thanh toán
        booking.PaymentStatus = "paid";
        
        await _bookingRepository.UpdateAsync(booking);
        
        // Thêm lịch sử đặt phòng
        var history = new BookingHistory
        {
            BookingId = id,
            Status = booking.Status,
            PaymentStatus = "paid",
            ChangedAt = DateTime.UtcNow,
            ChangedBy = User.FindFirst(ClaimTypes.NameIdentifier) != null ? 
                int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value) : null,
            Notes = $"Thanh toán thành công qua {request.PaymentMethod}"
        };
        
        await _bookingRepository.AddBookingHistoryAsync(history);
        
        _logger.LogInformation("Xử lý thanh toán đặt phòng: {BookingId}", id);
        
        return Ok(new { 
            message = "Thanh toán thành công",
            transactionId = Guid.NewGuid().ToString()
        });
    }

    /// <summary>
    /// API lấy danh sách dịch vụ của đặt phòng
    /// </summary>
    /// <param name="id">ID đặt phòng</param>
    /// <returns>Danh sách dịch vụ</returns>
    [HttpGet("{id}/services")]
    [Authorize(Policy = "AllUsers")]
    public async Task<IActionResult> GetBookingServices(int id)
    {
        // Kiểm tra đặt phòng tồn tại
        var booking = await _bookingRepository.GetByIdAsync(id);
        if (booking == null)
        {
            return NotFound(new { message = "Không tìm thấy đặt phòng" });
        }
        
        // Kiểm tra quyền truy cập
        if (User.FindFirst(ClaimTypes.Role)?.Value == "customer")
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null)
            {
                return Unauthorized(new { message = "Token không hợp lệ" });
            }

            var userId = int.Parse(userIdClaim.Value);
            
            // Kiểm tra đặt phòng có thuộc về khách hàng không
            if (booking.Customer?.UserId != userId)
            {
                return Forbid();
            }
        }
        
        var services = booking.BookingServices?.Select(bs => new BookingServiceDto
        {
            Id = bs.Id,
            ServiceId = bs.ServiceId,
            ServiceName = bs.Service?.Name ?? string.Empty,
            Quantity = bs.Quantity,
            Price = bs.Price,
            TotalPrice = bs.Price * bs.Quantity,
            ServiceDate = bs.ServiceDate
        }).ToList() ?? new List<BookingServiceDto>();
        
        return Ok(services);
    }

    /// <summary>
    /// API thêm dịch vụ cho đặt phòng
    /// </summary>
    /// <param name="id">ID đặt phòng</param>
    /// <param name="request">Thông tin dịch vụ</param>
    /// <returns>Kết quả thêm dịch vụ</returns>
    [HttpPost("{id}/services")]
    [Authorize(Policy = "EmployeeAndAdmin")]
    public async Task<IActionResult> AddBookingService(int id, [FromBody] AddBookingServiceRequest request)
    {
        // Kiểm tra đặt phòng tồn tại
        var booking = await _bookingRepository.GetByIdAsync(id);
        if (booking == null)
        {
            return NotFound(new { message = "Không tìm thấy đặt phòng" });
        }
        
        // Kiểm tra dịch vụ tồn tại
        var service = await _serviceRepository.GetByIdAsync(request.ServiceId);
        if (service == null)
        {
            return NotFound(new { message = "Không tìm thấy dịch vụ" });
        }
        
        // Kiểm tra dịch vụ có sẵn
        if (!service.IsAvailable)
        {
            return BadRequest(new { message = "Dịch vụ không có sẵn" });
        }
        
        // Tạo dịch vụ đặt phòng mới
        var bookingService = new BookingService
        {
            BookingId = id,
            ServiceId = request.ServiceId,
            Quantity = request.Quantity,
            Price = service.Price,
            ServiceDate = request.ServiceDate ?? DateTime.UtcNow
        };
        
        await _bookingRepository.AddBookingServiceAsync(bookingService);
        
        // Cập nhật tổng tiền đặt phòng
        booking.TotalAmount += service.Price * request.Quantity;
        await _bookingRepository.UpdateAsync(booking);
        
        _logger.LogInformation("Thêm dịch vụ cho đặt phòng: {BookingId}, Dịch vụ: {ServiceId}", id, request.ServiceId);
        
        return Ok(new { message = "Thêm dịch vụ thành công" });
    }

    /// <summary>
    /// API xóa dịch vụ của đặt phòng
    /// </summary>
    /// <param name="id">ID đặt phòng</param>
    /// <param name="serviceId">ID dịch vụ đặt phòng</param>
    /// <returns>Kết quả xóa dịch vụ</returns>
    [HttpDelete("{id}/services/{serviceId}")]
    [Authorize(Policy = "EmployeeAndAdmin")]
    public async Task<IActionResult> RemoveBookingService(int id, int serviceId)
    {
        // Kiểm tra đặt phòng tồn tại
        var booking = await _bookingRepository.GetByIdAsync(id);
        if (booking == null)
        {
            return NotFound(new { message = "Không tìm thấy đặt phòng" });
        }
        
        // Kiểm tra dịch vụ đặt phòng tồn tại
        var bookingService = booking.BookingServices?.FirstOrDefault(bs => bs.Id == serviceId);
        if (bookingService == null)
        {
            return NotFound(new { message = "Không tìm thấy dịch vụ đặt phòng" });
        }
        
        // Xóa dịch vụ đặt phòng
        await _bookingRepository.RemoveBookingServiceAsync(serviceId);
        
        // Cập nhật tổng tiền đặt phòng
        booking.TotalAmount -= bookingService.Price * bookingService.Quantity;
        await _bookingRepository.UpdateAsync(booking);
        
        _logger.LogInformation("Xóa dịch vụ của đặt phòng: {BookingId}, Dịch vụ: {ServiceId}", id, serviceId);
        
        return Ok(new { message = "Xóa dịch vụ thành công" });
    }

    /// <summary>
    /// Hàm hỗ trợ chuyển đổi từ entity Booking sang DTO
    /// </summary>
    private BookingDto MapBookingToDto(Booking booking)
    {
        return new BookingDto
        {
            Id = booking.Id,
            CustomerId = booking.CustomerId,
            CustomerName = $"{booking.Customer?.FirstName} {booking.Customer?.LastName}".Trim(),
            CustomerEmail = booking.Customer?.Email,
            CustomerPhone = booking.Customer?.PhoneNumber,
            RoomId = booking.RoomId,
            RoomNumber = booking.Room?.RoomNumber ?? string.Empty,
            RoomTypeName = booking.Room?.RoomType?.Name ?? string.Empty,
            CheckInDate = booking.CheckInDate,
            CheckOutDate = booking.CheckOutDate,
            Adults = booking.Adults,
            Children = booking.Children,
            TotalAmount = booking.TotalAmount,
            Status = booking.Status,
            PaymentStatus = booking.PaymentStatus,
            CreatedAt = booking.CreatedAt,
            Services = booking.BookingServices?.Select(bs => new BookingServiceDto
            {
                Id = bs.Id,
                ServiceId = bs.ServiceId,
                ServiceName = bs.Service?.Name ?? string.Empty,
                Quantity = bs.Quantity,
                Price = bs.Price,
                TotalPrice = bs.Price * bs.Quantity,
                ServiceDate = bs.ServiceDate
            }).ToList() ?? new List<BookingServiceDto>(),
            History = booking.BookingHistories?.Select(bh => new BookingHistoryDto
            {
                Id = bh.Id,
                Status = bh.Status,
                PaymentStatus = bh.PaymentStatus,
                ChangedAt = bh.ChangedAt,
                ChangedBy = bh.ChangedBy,
                ChangedByName = bh.User?.Name,
                Notes = bh.Notes
            }).OrderByDescending(bh => bh.ChangedAt).ToList() ?? new List<BookingHistoryDto>()
        };
    }
}
