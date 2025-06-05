using System.Data;
using HotelManagement.Application.Common.Interfaces;
using HotelManagement.Application.Common.Models;
using HotelManagement.Infrastructure.Data;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;

namespace HotelManagement.Infrastructure.Services;

/// <summary>
/// Dịch vụ tạo báo cáo từ stored procedures
/// </summary>
public class ReportService : IReportService
{
    private readonly HotelDbContext _context;

    public ReportService(HotelDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// Lấy báo cáo doanh thu theo tháng
    /// </summary>
    /// <param name="year">Năm cần báo cáo (mặc định là năm hiện tại)</param>
    /// <returns>Danh sách doanh thu theo tháng</returns>
    public async Task<IEnumerable<MonthlyRevenueReportDto>> GetMonthlyRevenueReportAsync(int? year = null)
    {
        if (year == null)
        {
            year = DateTime.Now.Year;
        }

        var yearParam = new SqlParameter("@Year", SqlDbType.Int) { Value = year };
        
        try
        {
            // Gọi stored procedure GetMonthlyRevenueReport
            var result = await _context.Database
                .SqlQueryRaw<MonthlyRevenueReportDto>(
                    "EXEC GetMonthlyRevenueReport @Year", yearParam)
                .ToListAsync();
                
            return result;
        }
        catch (Exception ex)
        {
            // Ghi log lỗi và ném ngoại lệ
            Console.WriteLine($"Lỗi khi lấy báo cáo doanh thu: {ex.Message}");
            throw;
        }
    }

    /// <summary>
    /// Lấy báo cáo công suất phòng
    /// </summary>
    /// <param name="startDate">Ngày bắt đầu (mặc định là 30 ngày trước)</param>
    /// <param name="endDate">Ngày kết thúc (mặc định là ngày hiện tại)</param>
    /// <returns>Danh sách công suất phòng theo ngày</returns>
    public async Task<IEnumerable<OccupancyReportDto>> GetOccupancyReportAsync(DateTime? startDate = null, DateTime? endDate = null)
    {
        if (startDate == null)
        {
            startDate = DateTime.Now.AddDays(-30);
        }

        if (endDate == null)
        {
            endDate = DateTime.Now;
        }

        var startDateParam = new SqlParameter("@StartDate", SqlDbType.Date) { Value = startDate };
        var endDateParam = new SqlParameter("@EndDate", SqlDbType.Date) { Value = endDate };
        
        try
        {
            // Gọi stored procedure GetOccupancyReport
            var result = await _context.Database
                .SqlQueryRaw<OccupancyReportDto>(
                    "EXEC GetOccupancyReport @StartDate, @EndDate", 
                    startDateParam, endDateParam)
                .ToListAsync();
                
            return result;
        }
        catch (Exception ex)
        {
            // Ghi log lỗi và ném ngoại lệ
            Console.WriteLine($"Lỗi khi lấy báo cáo công suất phòng: {ex.Message}");
            throw;
        }
    }
}
