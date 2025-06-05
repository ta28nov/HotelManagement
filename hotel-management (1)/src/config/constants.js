/**
 * Các hằng số sử dụng trong ứng dụng
 *
 * File này định nghĩa các hằng số được sử dụng xuyên suốt ứng dụng
 * như các loại phòng, trạng thái, vai trò người dùng, v.v.
 */

// Khóa lưu trữ token và thông tin người dùng
export const TOKEN_KEY = "hotel_auth_token"
export const USER_KEY = "hotel_user"

// Vai trò người dùng
export const ROLES = {
  ADMIN: "admin",
  EMPLOYEE: "employee",
  CUSTOMER: "customer",
}

// Loại phòng
export const ROOM_TYPES = [
  { value: "standard", label: "Phòng tiêu chuẩn" },
  { value: "deluxe", label: "Phòng cao cấp" },
  { value: "suite", label: "Phòng Suite" },
  { value: "family", label: "Phòng gia đình" },
  { value: "executive", label: "Phòng hạng sang" },
]

// Trạng thái phòng
export const ROOM_STATUS = [
  { value: "available", label: "Có sẵn" },
  { value: "occupied", label: "Đã đặt" },
  { value: "maintenance", label: "Bảo trì" },
  { value: "cleaning", label: "Đang dọn dẹp" },
]

// Trạng thái đặt phòng
export const BOOKING_STATUS = [
  { value: "confirmed", label: "Đã xác nhận" },
  { value: "pending", label: "Chờ xác nhận" },
  { value: "checked_in", label: "Đã nhận phòng" },
  { value: "checked_out", label: "Đã trả phòng" },
  { value: "cancelled", label: "Đã hủy" },
]

// Trạng thái thanh toán
export const PAYMENT_STATUS = [
  { value: "paid", label: "Đã thanh toán" },
  { value: "pending", label: "Chưa thanh toán" },
  { value: "partially_paid", label: "Thanh toán một phần" },
  { value: "refunded", label: "Đã hoàn tiền" },
]

// Phương thức thanh toán
export const PAYMENT_METHODS = [
  { value: "credit_card", label: "Thẻ tín dụng" },
  { value: "bank_transfer", label: "Chuyển khoản ngân hàng" },
  { value: "cash", label: "Tiền mặt" },
  { value: "paypal", label: "PayPal" },
]

// Danh mục dịch vụ
export const SERVICE_CATEGORIES = [
  { value: "spa", label: "Spa & Massage" },
  { value: "restaurant", label: "Nhà hàng" },
  { value: "laundry", label: "Giặt ủi" },
  { value: "transport", label: "Đưa đón" },
  { value: "tour", label: "Tour du lịch" },
  { value: "other", label: "Khác" },
]

// Định dạng tiền tệ
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount)
}

// Cấu hình API
export const API_CONFIG = {
  // Thời gian timeout cho các request (ms)
  TIMEOUT: 30000,

  // Số lần thử lại khi request thất bại
  RETRY_COUNT: 3,

  // Thời gian chờ giữa các lần thử lại (ms)
  RETRY_DELAY: 1000,
}

// Cấu hình phân trang
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
}

