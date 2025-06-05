/**
 * Dịch vụ quản lý dịch vụ khách sạn
 *
 * Dịch vụ này xử lý các thao tác liên quan đến dịch vụ khách sạn
 */

import { serviceEndpoints } from "../api"

const serviceService = {
  // Các thao tác với dịch vụ
  getAllServices: async () => {
    try {
      return await serviceEndpoints.getAllServices()
    } catch (error) {
      console.error("Lỗi lấy tất cả dịch vụ:", error)
      throw error
    }
  },

  getServiceById: async (id) => {
    try {
      return await serviceEndpoints.getServiceById(id)
    } catch (error) {
      console.error(`Lỗi lấy dịch vụ ${id}:`, error)
      throw error
    }
  },

  createService: async (serviceData) => {
    try {
      return await serviceEndpoints.createService(serviceData)
    } catch (error) {
      console.error("Lỗi tạo dịch vụ:", error)
      throw error
    }
  },

  updateService: async (id, serviceData) => {
    try {
      return await serviceEndpoints.updateService(id, serviceData)
    } catch (error) {
      console.error(`Lỗi cập nhật dịch vụ ${id}:`, error)
      throw error
    }
  },

  deleteService: async (id) => {
    try {
      return await serviceEndpoints.deleteService(id)
    } catch (error) {
      console.error(`Lỗi xóa dịch vụ ${id}:`, error)
      throw error
    }
  },

  filterServicesByCategory: async (category) => {
    try {
      return await serviceEndpoints.filterServicesByCategory(category)
    } catch (error) {
      console.error("Lỗi lọc dịch vụ theo danh mục:", error)
      throw error
    }
  },

  searchServices: async (query) => {
    try {
      return await serviceEndpoints.searchServices(query)
    } catch (error) {
      console.error("Lỗi tìm kiếm dịch vụ:", error)
      throw error
    }
  },

  // Các thao tác với danh mục dịch vụ
  getAllCategories: async () => {
    try {
      // Note: Endpoint is named getServiceCategories
      return await serviceEndpoints.getServiceCategories()
    } catch (error) {
      console.error("Lỗi lấy tất cả danh mục dịch vụ:", error)
      throw error
    }
  },

  createCategory: async (categoryData) => {
    try {
      return await serviceEndpoints.createCategory(categoryData)
    } catch (error) {
      console.error("Lỗi tạo danh mục dịch vụ:", error)
      throw error
    }
  },
}

export default serviceService

