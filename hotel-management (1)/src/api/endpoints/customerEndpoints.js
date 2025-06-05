/**
 * Các endpoint API khách hàng
 *
 * File này định nghĩa các endpoint liên quan đến quản lý khách hàng,
 * tìm kiếm khách hàng và lịch sử đặt phòng của khách hàng.
 */
import apiClient from "../apiClient"

const BASE_URL = "/customers"; // Remove leading '/api'

const customerEndpoints = {
  // Các thao tác với khách hàng
  getAllCustomers: (searchTerm) => {
    const params = searchTerm ? { searchTerm } : {};
    return apiClient.get(BASE_URL, { params });
  },
  getCustomerById: (id) => apiClient.get(`${BASE_URL}/${id}`),
  createCustomer: (customerData) => apiClient.post(BASE_URL, customerData),
  updateCustomer: (id, customerData) => apiClient.put(`${BASE_URL}/${id}`, customerData),
  deleteCustomer: (id) => apiClient.delete(`${BASE_URL}/${id}`),

  // Tìm kiếm khách hàng - GET /api/customers handled this via searchTerm parameter
  // searchCustomers: (query) => apiClient.get("/customers/search", { params: { query } }), // Remove this as it's covered by getAllCustomers

  // Lịch sử đặt phòng của khách hàng
  getCustomerBookingHistory: (customerId) => apiClient.get(`${BASE_URL}/${customerId}/bookings`),

  // Thống kê khách hàng - Assuming this endpoint still exists, adjust if needed
  getCustomerStatistics: () => apiClient.get(`${BASE_URL}/statistics`), // Adjusted path
}

export default customerEndpoints

