using HotelManagement.Domain.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace HotelManagement.Application.Common.Interfaces;

/// <summary>
/// Interface cho repository khách hàng
/// </summary>
public interface ICustomerRepository
{
    // Lấy tất cả khách hàng (có thể thêm phân trang/sắp xếp sau)
    Task<IEnumerable<Customer>> GetAllAsync();

    // Tìm kiếm khách hàng (đơn giản theo tên/email/phone)
    Task<IEnumerable<Customer>> SearchAsync(string searchTerm);

    // Lấy khách hàng theo ID
    Task<Customer?> GetByIdAsync(int id);

    // Tạo khách hàng mới (trả về ID mới tạo)
    Task<int> CreateAsync(Customer customer);
    Task UpdateAsync(Customer customer);

    // Xóa khách hàng (Nếu cần)
    // Task DeleteAsync(int id);

    // (Optional) Kiểm tra trùng lặp nếu cần
    Task<bool> DoesEmailExistAsync(string email, int? excludeCustomerId = null);
    Task<bool> DoesPhoneNumberExistAsync(string phoneNumber, int? excludeCustomerId = null);
}
