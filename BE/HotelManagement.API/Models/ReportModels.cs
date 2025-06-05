namespace HotelManagement.API.Models;

/// <summary>
/// Mô hình dữ liệu cho tỉ lệ lấp đầy theo loại phòng
/// </summary>
public class RoomTypeOccupancyDto
{
    public int RoomTypeId { get; set; }
    public string RoomTypeName { get; set; } = string.Empty;
    public decimal OccupancyRate { get; set; } // Tỉ lệ phần trăm
    public int TotalRooms { get; set; }
    public int OccupiedRoomDays { get; set; }
    public int AvailableRoomDays { get; set; }
} 