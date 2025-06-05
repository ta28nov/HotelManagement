/**
 * Các endpoint API dịch vụ khách sạn
 *
 * File này định nghĩa các endpoint liên quan đến quản lý dịch vụ,
 * lọc dịch vụ theo danh mục và tìm kiếm dịch vụ.
 */
import apiClient from "../apiClient"

const serviceEndpoints = {
  // Các thao tác với dịch vụ
  getAllServices: () => apiClient.get("/services"),
  getServiceById: (id) => apiClient.get(`/services/${id}`),
  createService: (serviceData) => apiClient.post("/services", serviceData),
  updateService: (id, serviceData) => apiClient.put(`/services/${id}`, serviceData),
  deleteService: (id) => apiClient.delete(`/services/${id}`),

  // Lọc dịch vụ
  filterServicesByCategory: (category) => apiClient.get("/services/filter", { params: { category } }),

  // Tìm kiếm dịch vụ
  searchServices: (query) => apiClient.get("/services/search", { params: { query } }),

  // Danh mục dịch vụ
  getServiceCategories: () => apiClient.get("/services/categories"),
  createCategory: (categoryData) => apiClient.post("/services/categories", categoryData),

  // Upload hình ảnh dịch vụ
  uploadServiceImage: (serviceId, formData) => {
    return apiClient.post(`/services/${serviceId}/images`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
  },
}

export default serviceEndpoints

