namespace HotelManagement.Application.Common.Models;

public class MonthlyRevenueReportDto
{
    public int Month { get; set; }
    public int Year { get; set; }
    public decimal TotalRevenue { get; set; }
}
