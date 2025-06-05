using HotelManagement.Application.Common.Models;

namespace HotelManagement.Application.Common.Interfaces;

public interface IReportService
{
    Task<IEnumerable<MonthlyRevenueReportDto>> GetMonthlyRevenueReportAsync(int? year = null);
    Task<IEnumerable<OccupancyReportDto>> GetOccupancyReportAsync(DateTime? startDate = null, DateTime? endDate = null);
}
