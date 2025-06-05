using System.ComponentModel.DataAnnotations;

namespace HotelManagement.API.Models // Hoặc namespace DTO riêng
{
    public class UpdateCustomerRequest
    {
        [MaxLength(50)]
        public string? FirstName { get; set; }

        [MaxLength(50)]
        public string? LastName { get; set; }

        [EmailAddress(ErrorMessage = "Địa chỉ email không hợp lệ")]
        [MaxLength(100)]
        public string? Email { get; set; }

        [Phone(ErrorMessage = "Số điện thoại không hợp lệ")]
        [MaxLength(20)]
        public string? PhoneNumber { get; set; }

        [MaxLength(50)]
        public string? IdNumber { get; set; }

        [MaxLength(50)]
        public string? Nationality { get; set; }
    }
} 