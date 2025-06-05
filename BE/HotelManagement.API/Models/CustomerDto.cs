namespace HotelManagement.API.Models // Hoặc namespace DTO riêng
{
    public class CustomerDto
    {
        public int Id { get; set; } // CustomerId
        public string FirstName { get; set; } = null!;
        public string LastName { get; set; } = null!;
        public string FullName => $"{FirstName} {LastName}"; // Computed property
        public string? Email { get; set; }
        public string PhoneNumber { get; set; } = null!;
        public string? IdNumber { get; set; }
        public string? Nationality { get; set; }
        public int? UserId { get; set; }
        public string? UserEmail { get; set; } // Lấy từ User liên kết (nếu có)
    }
} 