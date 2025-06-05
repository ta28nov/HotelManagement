/**
 * API Client kết nối với backend
 *
 * File này cung cấp một API client tập trung để thực hiện các yêu cầu HTTP đến backend.
 * Nó xử lý xác thực, xử lý lỗi và định dạng yêu cầu.
 */

import axios from "axios"
import { toast } from "react-toastify"
// Import constants
import { TOKEN_KEY, USER_KEY } from "../config/constants"

// URL cơ sở API - lấy từ biến môi trường
// QUAN TRỌNG: Cần tạo file .env.local với nội dung VITE_API_URL=https://your-backend-api-url.com/api
// Updated default base URL
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5225/api"
// Tạo instance axios với cấu hình mặc định
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

// Interceptor yêu cầu để thêm token xác thực
apiClient.interceptors.request.use(
  (config) => {
    // Use imported TOKEN_KEY
    const token = localStorage.getItem(TOKEN_KEY)
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error),
)

// Interceptor phản hồi để xử lý các lỗi phổ biến
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Xử lý các lỗi phổ biến
    if (error.response) {
      // Xử lý lỗi 401 Unauthorized - chuyển hướng đến trang đăng nhập
      if (error.response.status === 401) {
        // Use imported constants
        localStorage.removeItem(TOKEN_KEY)
        localStorage.removeItem(USER_KEY)

        // Chuyển hướng đến trang đăng nhập nếu chưa ở đó
        if (window.location.pathname !== "/login") {
          toast.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.")
          setTimeout(() => {
            window.location.href = "/login"
          }, 1500)
        }
      }

      // Xử lý lỗi 403 Forbidden
      if (error.response.status === 403) {
        toast.error("Bạn không có quyền thực hiện hành động này")
      }

      // Xử lý lỗi 404 Not Found
      if (error.response.status === 404) {
        toast.error("Không tìm thấy tài nguyên yêu cầu")
      }

      // Xử lý lỗi 422 Validation Error
      if (error.response.status === 422) {
        const errors = error.response.data.errors
        if (errors) {
          Object.keys(errors).forEach((key) => {
            toast.error(errors[key][0])
          })
        } else {
          toast.error(error.response.data.message || "Dữ liệu không hợp lệ")
        }
      }

      // Xử lý lỗi 500 Server Error
      if (error.response.status >= 500) {
        toast.error("Đã xảy ra lỗi máy chủ. Vui lòng thử lại sau.")
      }
    } else if (error.request) {
      // Lỗi mạng - không nhận được phản hồi
      toast.error("Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.")
    } else {
      // Lỗi khác
      toast.error("Đã xảy ra lỗi. Vui lòng thử lại.")
    }

    return Promise.reject(error)
  },
)

export default apiClient

