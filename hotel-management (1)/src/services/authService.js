/**
 * Dịch vụ xác thực
 *
 * Dịch vụ này xử lý xác thực người dùng và quản lý người dùng
 */

import { authEndpoints } from "../api"

const authService = {
  // Xác thực người dùng
  login: async (email, password) => {
    try {
      return await authEndpoints.login({ email, password })
    } catch (error) {
      console.error("Lỗi đăng nhập:", error)
      throw error
    }
  },

  register: async (userData) => {
    try {
      // Chuyển đổi dữ liệu frontend thành định dạng mà backend yêu cầu
      const payload = {
        name: `${userData.firstName} ${userData.lastName}`.trim(),
        email: userData.email,
        password: userData.password,
        passwordConfirmation: userData.confirmPassword,
        phoneNumber: userData.phone || "", // optional
      }

      // Gọi API và gửi dữ liệu đã chuyển đổi
      return await authEndpoints.register(payload)
    } catch (error) {
      console.error("Lỗi đăng ký:", error)
      throw error
    }
  },

  logout: async () => {
    try {
      return await authEndpoints.logout()
    } catch (error) {
      console.error("Lỗi đăng xuất:", error)
      throw error
    }
  },

  getCurrentUser: async () => {
    try {
      return await authEndpoints.getCurrentUser()
    } catch (error) {
      console.error("Lỗi lấy thông tin người dùng hiện tại:", error)
      throw error
    }
  },

  // Quản lý người dùng (chỉ admin)
  getAllUsers: async () => {
    try {
      return await authEndpoints.getAllUsers()
    } catch (error) {
      console.error("Lỗi lấy tất cả người dùng:", error)
      throw error
    }
  },

  createUser: async (userData) => {
    try {
      return await authEndpoints.createUser(userData)
    } catch (error) {
      console.error("Lỗi tạo người dùng:", error)
      throw error
    }
  },

  updateUser: async (id, userData) => {
    try {
      return await authEndpoints.updateUser(id, userData)
    } catch (error) {
      console.error("Lỗi cập nhật người dùng:", error)
      throw error
    }
  },

  deleteUser: async (id) => {
    try {
      return await authEndpoints.deleteUser(id)
    } catch (error) {
      console.error("Lỗi xóa người dùng:", error)
      throw error
    }
  },

  // Quản lý mật khẩu
  forgotPassword: async (email) => {
    try {
      return await authEndpoints.forgotPassword(email)
    } catch (error) {
      console.error("Lỗi quên mật khẩu:", error)
      throw error
    }
  },

  resetPassword: async (token, newPassword) => {
    try {
      return await authEndpoints.resetPassword({ token, password: newPassword, passwordConfirmation: newPassword })
    } catch (error) {
      console.error("Lỗi đặt lại mật khẩu:", error)
      throw error
    }
  },

  changePassword: async (currentPassword, newPassword) => {
    try {
      return await authEndpoints.changePassword({
        currentPassword: currentPassword,
        newPassword: newPassword,
        passwordConfirmation: newPassword,
      })
    } catch (error) {
      console.error("Lỗi thay đổi mật khẩu:", error)
      throw error
    }
  },

  // Quản lý hồ sơ
  updateProfile: async (userData) => {
    try {
      return await authEndpoints.updateUser("profile", userData)
    } catch (error) {
      console.error("Lỗi cập nhật hồ sơ:", error)
      throw error
    }
  },
}

export default authService

