namespace HotelManagement.Application.Common.Models;

public class OccupancyReportDto
{
    public DateTime Date { get; set; }
    public int OccupiedRooms { get; set; }
    public int TotalRooms { get; set; }
    public decimal OccupancyRate { get; set; }
}
