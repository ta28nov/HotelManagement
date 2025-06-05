using System.ComponentModel.DataAnnotations;

namespace HotelManagement.API.Models // Hoặc namespace DTO riêng
{
    public class CreateCustomerRequest
    {
        [Required(ErrorMessage = "Tên không được để trống")]
        [MaxLength(50)]
        public string FirstName { get; set; } = null!;

        [Required(ErrorMessage = "Họ không được để trống")]
        [MaxLength(50)]
        public string LastName { get; set; } = null!;

        [EmailAddress(ErrorMessage = "Địa chỉ email không hợp lệ")]
        [MaxLength(100)]
        public string? Email { get; set; } // Email có thể không bắt buộc khi NV tạo

        [Required(ErrorMessage = "Số điện thoại không được để trống")]
        [Phone(ErrorMessage = "Số điện thoại không hợp lệ")]
        [MaxLength(20)]
        public string PhoneNumber { get; set; } = null!;

        [MaxLength(50)]
        public string? IdNumber { get; set; }

        [MaxLength(50)]
        public string? Nationality { get; set; }
        // Không cần UserId ở đây, việc liên kết User nên là quy trình riêng
    }
} 