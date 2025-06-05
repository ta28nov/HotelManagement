using System.Security.Claims;
using HotelManagement.API.Models;
using HotelManagement.Application.Common.Interfaces;
using HotelManagement.Application.Common.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using HotelManagement.Infrastructure.Data;
using Microsoft.Data.SqlClient;
using System.Globalization;

namespace HotelManagement.API.Controllers;

/// <summary>
/// Controller xử lý các API liên quan đến báo cáo
/// </summary>
[ApiController]
[Route("api/reports")]
[Authorize(Policy = "EmployeeAndAdmin")]
public class ReportsController : ControllerBase
{
    private readonly HotelDbContext _context;
    private readonly ILogger<ReportsController> _logger;

    public ReportsController(
        HotelDbContext context,
        ILogger<ReportsController> logger)
    {
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// API lấy báo cáo doanh thu theo tháng
    /// </summary>
    /// <param name="startDate">Ngày bắt đầu (YYYY-MM-DD)</param>
    /// <param name="endDate">Ngày kết thúc (YYYY-MM-DD)</param>
    /// <returns>Báo cáo doanh thu</returns>
    [HttpGet("monthly-revenue")]
    [ProducesResponseType(typeof(IEnumerable<MonthlyRevenueReportDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> GetMonthlyRevenueReport([FromQuery] string startDate, [FromQuery] string endDate)
    {
        // Validate and parse dates
        if (!DateTime.TryParseExact(startDate, "yyyy-MM-dd", CultureInfo.InvariantCulture, DateTimeStyles.None, out var parsedStartDate) ||
            !DateTime.TryParseExact(endDate, "yyyy-MM-dd", CultureInfo.InvariantCulture, DateTimeStyles.None, out var parsedEndDate))
        {
            _logger.LogWarning("Invalid date format received for monthly revenue report. StartDate: {StartDate}, EndDate: {EndDate}", startDate, endDate);
            return BadRequest(new { message = "Định dạng ngày không hợp lệ. Vui lòng sử dụng YYYY-MM-DD." });
        }

        // Ensure endDate is not before startDate
        if (parsedEndDate < parsedStartDate)
        {
             _logger.LogWarning("EndDate is before StartDate for monthly revenue report. StartDate: {StartDate}, EndDate: {EndDate}", startDate, endDate);
            return BadRequest(new { message = "Ngày kết thúc không được trước ngày bắt đầu." });
        }

        try
        {
            _logger.LogInformation("Fetching monthly revenue report from {StartDate} to {EndDate}", parsedStartDate.ToString("yyyy-MM-dd"), parsedEndDate.ToString("yyyy-MM-dd"));

            var sql = "EXEC GetMonthlyRevenueReport @StartDate, @EndDate";
            var parameters = new[] {
                new SqlParameter("@StartDate", parsedStartDate),
                new SqlParameter("@EndDate", parsedEndDate)
            };

            var report = await _context.Set<MonthlyRevenueReportDto>()
                .FromSqlRaw(sql, parameters)
                .ToListAsync();

            _logger.LogInformation("Successfully retrieved {Count} months of revenue data.", report.Count);
            return Ok(report);
        }
        catch (SqlException ex) // Catch specific SQL errors
        {
             _logger.LogError(ex, "SQL Error occurred while fetching monthly revenue report from {StartDate} to {EndDate}", parsedStartDate.ToString("yyyy-MM-dd"), parsedEndDate.ToString("yyyy-MM-dd"));
            return StatusCode(StatusCodes.Status500InternalServerError, "Đã xảy ra lỗi khi truy vấn dữ liệu báo cáo.");
        }
        catch (Exception ex) // Catch other potential errors
        {
             _logger.LogError(ex, "Generic Error occurred while fetching monthly revenue report from {StartDate} to {EndDate}", parsedStartDate.ToString("yyyy-MM-dd"), parsedEndDate.ToString("yyyy-MM-dd"));
            return StatusCode(StatusCodes.Status500InternalServerError, "Đã xảy ra lỗi máy chủ nội bộ.");
        }
    }

    /// <summary>
    /// API lấy báo cáo công suất phòng
    /// </summary>
    /// <param name="startDate">Ngày bắt đầu (YYYY-MM-DD)</param>
    /// <param name="endDate">Ngày kết thúc (YYYY-MM-DD)</param>
    /// <returns>Báo cáo công suất</returns>
    [HttpGet("occupancy")]
    [ProducesResponseType(typeof(IEnumerable<OccupancyReportDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> GetOccupancyReport(
        [FromQuery] string startDate,
        [FromQuery] string endDate)
    {
        // Validate and parse dates
        if (!DateTime.TryParseExact(startDate, "yyyy-MM-dd", CultureInfo.InvariantCulture, DateTimeStyles.None, out var parsedStartDate) ||
            !DateTime.TryParseExact(endDate, "yyyy-MM-dd", CultureInfo.InvariantCulture, DateTimeStyles.None, out var parsedEndDate))
        {
            _logger.LogWarning("Invalid date format received for occupancy report. StartDate: {StartDate}, EndDate: {EndDate}", startDate, endDate);
            return BadRequest(new { message = "Định dạng ngày không hợp lệ. Vui lòng sử dụng YYYY-MM-DD." });
        }

        if (parsedEndDate < parsedStartDate)
        {
            _logger.LogWarning("EndDate is before StartDate for occupancy report. StartDate: {StartDate}, EndDate: {EndDate}", startDate, endDate);
            return BadRequest(new { message = "Ngày kết thúc không được trước ngày bắt đầu." });
        }

        try
        {
             _logger.LogInformation("Fetching occupancy report from {StartDate} to {EndDate}", parsedStartDate.ToString("yyyy-MM-dd"), parsedEndDate.ToString("yyyy-MM-dd"));

            var sql = "EXEC GetOccupancyReport @StartDate, @EndDate";
            var parameters = new[] {
                new SqlParameter("@StartDate", parsedStartDate),
                new SqlParameter("@EndDate", parsedEndDate)
            };

            var report = await _context.Set<OccupancyReportDto>()
                .FromSqlRaw(sql, parameters)
                .ToListAsync();

            _logger.LogInformation("Successfully retrieved {Count} days of occupancy data.", report.Count);
            return Ok(report);
        }
        catch (SqlException ex)
        {
             _logger.LogError(ex, "SQL Error occurred while fetching occupancy report from {StartDate} to {EndDate}", parsedStartDate.ToString("yyyy-MM-dd"), parsedEndDate.ToString("yyyy-MM-dd"));
            return StatusCode(StatusCodes.Status500InternalServerError, "Đã xảy ra lỗi khi truy vấn dữ liệu báo cáo.");
        }
        catch (Exception ex)
        {
             _logger.LogError(ex, "Generic Error occurred while fetching occupancy report from {StartDate} to {EndDate}", parsedStartDate.ToString("yyyy-MM-dd"), parsedEndDate.ToString("yyyy-MM-dd"));
            return StatusCode(StatusCodes.Status500InternalServerError, "Đã xảy ra lỗi máy chủ nội bộ.");
        }
    }
}
