/**
 * Các endpoint API đặt phòng
 *
 * File này định nghĩa các endpoint liên quan đến quản lý đặt phòng,
 * xử lý trạng thái đặt phòng và thanh toán.
 */
import apiClient from "../apiClient"

const bookingEndpoints = {
  // Các thao tác đặt phòng
  getAllBookings: (params) => apiClient.get("/bookings", { params }),
  getBookingById: (id) => apiClient.get(`/bookings/${id}`),
  createBooking: (bookingData) => apiClient.post("/bookings", bookingData),
  updateBooking: (id, bookingData) => apiClient.put(`/bookings/${id}`, bookingData),
  deleteBooking: (id) => apiClient.delete(`/bookings/${id}`),

  // Quản lý trạng thái đặt phòng
  updateBookingStatus: (id, statusData) => apiClient.put(`/bookings/${id}/status`, statusData),
  checkIn: (id) => apiClient.post(`/bookings/${id}/check-in`),
  checkOut: (id) => apiClient.post(`/bookings/${id}/check-out`),
  cancelBooking: (id) => apiClient.delete(`/bookings/${id}`),

  // Lọc đặt phòng
  filterBookings: (filters) => apiClient.get("/bookings/filter", { params: filters }),

  // Đặt phòng của khách hàng
  getCustomerBookings: (customerId) => apiClient.get(`/customers/${customerId}/bookings`),
  getMyBookings: () => apiClient.get("/bookings/my-bookings"),

  // Liên quan đến thanh toán
  updatePaymentStatus: (id, paymentData) =>
    apiClient.put(`/bookings/${id}/payment`, paymentData),
  processPayment: (bookingId, paymentData) => apiClient.post(`/bookings/${bookingId}/payment`, paymentData),

  // Dịch vụ cho đặt phòng
  addServiceToBooking: (bookingId, serviceData) => apiClient.post(`/bookings/${bookingId}/services`, serviceData),
  removeServiceFromBooking: (bookingId, serviceId) => apiClient.delete(`/bookings/${bookingId}/services/${serviceId}`),
  getBookingServices: (bookingId) => apiClient.get(`/bookings/${bookingId}/services`),

  // Tạo hóa đơn
  createInvoice: (bookingId) => apiClient.post(`/bookings/${bookingId}/invoice`),
  getInvoice: (bookingId) => apiClient.get(`/bookings/${bookingId}/invoice`),
  downloadInvoice: (bookingId) => apiClient.get(`/bookings/${bookingId}/invoice/download`, { responseType: "blob" }),
}

export default bookingEndpoints

