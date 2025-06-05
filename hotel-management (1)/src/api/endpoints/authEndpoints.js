/**
 * Các endpoint API xác thực
 *
 * File này định nghĩa các endpoint liên quan đến xác thực người dùng
 * và quản lý tài khoản người dùng.
 */
import apiClient from "../apiClient"

const authEndpoints = {
  // Xác thực người dùng
  login: (credentials) => apiClient.post("/auth/login", credentials),
  register: (userData) => apiClient.post("/auth/register", userData),
  getCurrentUser: () => apiClient.get("/auth/me"),
  logout: () => apiClient.post("/auth/logout"),

  // Quản lý người dùng (chỉ admin)
  getAllUsers: () => apiClient.get("/users"),
  getUserById: (id) => apiClient.get(`/users/${id}`),
  createUser: (userData) => apiClient.post("/users", userData),
  updateUser: (id, userData) => apiClient.put(`/users/${id}`, userData),
  deleteUser: (id) => apiClient.delete(`/users/${id}`),

  // Quản lý mật khẩu
  forgotPassword: (email) => apiClient.post("/auth/forgot-password", { email }),
  resetPassword: (data) => apiClient.post("/auth/reset-password", data),
  changePassword: (passwordData) => apiClient.put("/auth/change-password", passwordData),
}

export default authEndpoints

