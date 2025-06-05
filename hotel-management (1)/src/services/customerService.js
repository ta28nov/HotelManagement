/**
 * Dịch vụ khách hàng
 *
 * Dịch vụ này xử lý các thao tác liên quan đến khách hàng
 */

import { customerEndpoints } from "../api"

const customerService = {
  // Các thao tác với khách hàng
  getAllCustomers: async () => {
    try {
      return await customerEndpoints.getAllCustomers()
    } catch (error) {
      console.error("Lỗi lấy tất cả khách hàng:", error)
      throw error
    }
  },

  getCustomerById: async (id) => {
    try {
      return await customerEndpoints.getCustomerById(id)
    } catch (error) {
      console.error(`Lỗi lấy khách hàng ${id}:`, error)
      throw error
    }
  },

  createCustomer: async (customerData) => {
    try {
      return await customerEndpoints.createCustomer(customerData)
    } catch (error) {
      console.error("Lỗi tạo khách hàng:", error)
      throw error
    }
  },

  updateCustomer: async (id, customerData) => {
    try {
      return await customerEndpoints.updateCustomer(id, customerData)
    } catch (error) {
      console.error(`Lỗi cập nhật khách hàng ${id}:`, error)
      throw error
    }
  },

  deleteCustomer: async (id) => {
    try {
      return await customerEndpoints.deleteCustomer(id)
    } catch (error) {
      console.error(`Lỗi xóa khách hàng ${id}:`, error)
      throw error
    }
  },

  // Tìm kiếm khách hàng
  searchCustomers: async (query) => {
    try {
      return await customerEndpoints.searchCustomers(query)
    } catch (error) {
      console.error("Lỗi tìm kiếm khách hàng:", error)
      throw error
    }
  },

  // Lịch sử đặt phòng của khách hàng
  getCustomerBookingHistory: async (customerId) => {
    try {
      return await customerEndpoints.getCustomerBookingHistory(customerId)
    } catch (error) {
      console.error(`Lỗi lấy lịch sử đặt phòng của khách hàng ${customerId}:`, error)
      throw error
    }
  },

  // Thống kê khách hàng
  getCustomerStatistics: async () => {
    try {
      return await customerEndpoints.getCustomerStatistics()
    } catch (error) {
      console.error("Lỗi lấy thống kê khách hàng:", error)
      throw error
    }
  },
}

export default customerService

