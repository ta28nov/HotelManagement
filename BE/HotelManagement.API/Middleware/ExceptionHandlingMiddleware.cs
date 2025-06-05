using System.Net;
using System.Text.Json;
using HotelManagement.Application.Common.Exceptions;

namespace HotelManagement.API.Middleware;

/// <summary>
/// Middleware xử lý ngoại lệ toàn cục cho ứng dụng
/// </summary>
public class ExceptionHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionHandlingMiddleware> _logger;

    public ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    /// <summary>
    /// Xử lý request và bắt các ngoại lệ
    /// </summary>
    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            await HandleExceptionAsync(context, ex);
        }
    }

    /// <summary>
    /// Xử lý ngoại lệ và trả về response phù hợp
    /// </summary>
    private async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        _logger.LogError(exception, "Đã xảy ra lỗi không được xử lý");

        var statusCode = GetStatusCode(exception);
        
        var response = new
        {
            title = GetTitle(exception),
            status = statusCode,
            detail = exception.Message,
            errors = GetErrors(exception)
        };

        context.Response.ContentType = "application/json";
        context.Response.StatusCode = statusCode;

        await context.Response.WriteAsync(JsonSerializer.Serialize(response));
    }

    /// <summary>
    /// Xác định mã trạng thái HTTP dựa trên loại ngoại lệ
    /// </summary>
    private static int GetStatusCode(Exception exception) =>
        exception switch
        {
            ValidationException => (int)HttpStatusCode.BadRequest,
            NotFoundException => (int)HttpStatusCode.NotFound,
            UnauthorizedAccessException => (int)HttpStatusCode.Unauthorized,
            ForbiddenAccessException => (int)HttpStatusCode.Forbidden,
            _ => (int)HttpStatusCode.InternalServerError
        };

    /// <summary>
    /// Xác định tiêu đề lỗi dựa trên loại ngoại lệ
    /// </summary>
    private static string GetTitle(Exception exception) =>
        exception switch
        {
            ApplicationException applicationException => applicationException.Message,
            _ => "Lỗi máy chủ"
        };

    /// <summary>
    /// Lấy danh sách lỗi chi tiết từ ngoại lệ validation
    /// </summary>
    private static IReadOnlyDictionary<string, string[]>? GetErrors(Exception exception)
    {
        IReadOnlyDictionary<string, string[]>? errors = null;

        if (exception is ValidationException validationException)
        {
            errors = validationException.Errors;
        }

        return errors;
    }
}
