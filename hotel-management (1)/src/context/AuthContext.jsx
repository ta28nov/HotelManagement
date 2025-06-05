"\"use client"

//chịu trách nhiệm xác thực người dùng, lưu trữ thông tin người dùng và cung cấp quyền truy cập cho các thành phần của ứng dụng
//cung cấp các hàm để đăng nhập, đăng ký, đăng xuất, cập nhật thông tin người dùng và kiểm tra quyền truy cập 
//sử dụng useContext để cung cấp thông tin người dùng cho các component con


// Import các thư viện cần thiết
import { createContext, useState, useEffect, useContext } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "react-toastify"
import authService from "../services/authService"
import { TOKEN_KEY, USER_KEY } from "../config/constants"

// Tạo context xác thực
const AuthContext = createContext()

// Hook tùy chỉnh để sử dụng context xác thực
export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }) => {
  // Các state quản lý thông tin người dùng và trạng thái
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  // Function to fetch user data and update state/storage
  const fetchAndSetUser = async () => {
    try {
        const response = await authService.getCurrentUser();
        console.log("[/auth/me] API Response Data:", response.data); // DEBUG
        const userData = response.data;

        if (userData && typeof userData === 'object') {
            console.log("[/auth/me] Setting user data:", userData); // DEBUG
            setCurrentUser(userData);
            localStorage.setItem(USER_KEY, JSON.stringify(userData));
            return userData; // Return user data on success
        } else {
            console.warn("[/auth/me] Response did not contain valid user data.");
            localStorage.removeItem(USER_KEY);
            setCurrentUser(null);
            return null; // Return null if user data is invalid
        }
    } catch (error) {
        console.error("Error fetching current user:", error); // Log the specific error
        localStorage.removeItem(TOKEN_KEY); // Crucial: Remove token if fetch fails
        localStorage.removeItem(USER_KEY);
        setCurrentUser(null);
        // Don't navigate here, let the caller decide
        throw error; // Re-throw error to indicate failure
    }
  };

  // Kiểm tra token khi component được tải
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem(TOKEN_KEY)
      // No need to parse saved user string here anymore, rely on fetchAndSetUser
      // const savedUserString = localStorage.getItem(USER_KEY)

      if (token) {
          try {
            await fetchAndSetUser(); // Fetch user data using the token
          } catch (error) {
            // Error already handled within fetchAndSetUser (token removal, state update)
            console.log("checkAuth: fetchAndSetUser failed, user logged out.")
          }
      }
      setLoading(false)
    }

    checkAuth()
  }, [])

  /**
   * Đăng nhập người dùng
   */
  const login = async (email, password) => {
    setLoading(true); // Set loading at the beginning
    setError(null);
    try {
      // 1. Call login API
      const loginResponse = await authService.login(email, password);
      console.log("Login API Response Data:", loginResponse.data); // DEBUG

      const token = loginResponse.data?.token;

      if (!token) {
        throw new Error("Login response did not include a token.");
      }

      // 2. Save token immediately
      localStorage.setItem(TOKEN_KEY, token);

      // 3. Fetch user data using the new token
      console.log("Login successful, fetching user details...");
      const user = await fetchAndSetUser(); // Use the reusable function

      // 4. Handle navigation based on fetched user data
      if (user && user.role) { // Check user and role exist
         console.log("[Login] Fetched User role:", user.role); // DEBUG
         toast.success("Đăng nhập thành công!");
         if (user.role === "admin" || user.role === "employee") {
            console.log("[Login] Navigating to /admin/dashboard"); // DEBUG
            navigate("/admin/dashboard");
         } else {
            console.log("[Login] Navigating to /"); // DEBUG
            navigate("/");
         }
         return user; // Return the fetched user
      } else {
          // This case should ideally not happen if fetchAndSetUser succeeds
          // but handles cases where /auth/me might fail or return invalid data right after login
          console.warn("[Login] User details could not be fetched or were invalid after login. Navigating home.");
          toast.warn("Đăng nhập thành công, nhưng không thể tải chi tiết người dùng.")
          navigate("/"); // Navigate to default page
          return null;
      }

    } catch (error) {
      // Error could be from login API or fetchAndSetUser API
      const errorMessage = error.response?.data?.message || error.message || "Đăng nhập hoặc lấy thông tin người dùng thất bại.";
      setError(errorMessage);
      toast.error(errorMessage);
      // Ensure token/user are cleared if login or fetch fails
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      setCurrentUser(null);
      // Don't throw here unless absolutely necessary for the calling component
      // throw error;
      return null; // Indicate login failure
    } finally {
      setLoading(false);
    }
  }

  /**
   * Đăng ký người dùng mới
   * @param {Object} userData - Thông tin người dùng
   * @returns {Object} - Kết quả đăng ký
   */
  const register = async (userData) => {
    try {
      setLoading(true)
      setError(null)
      const response = await authService.register(userData)
      toast.success("Đăng ký thành công! Vui lòng đăng nhập.")
      navigate("/login")
      return response.data
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Đăng ký thất bại. Vui lòng thử lại."
      setError(errorMessage)
      toast.error(errorMessage)
      throw error
    } finally {
      setLoading(false)
    }
  }

  /**
   * Đăng xuất người dùng
   */
  const logout = async () => {
    setLoading(true); // Optional: Add loading state
    try {
      if (currentUser) {
        await authService.logout()
      }
    } catch (error) {
      console.error("Logout error:", error)
    } finally {
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(USER_KEY)
      setCurrentUser(null)
      toast.info("Đã đăng xuất")
      setLoading(false); // Optional: Clear loading state
      navigate("/")
    }
  }

  /**
   * Cập nhật thông tin người dùng
   * @param {Object} userData - Thông tin người dùng cần cập nhật
   * @returns {Object} - Thông tin người dùng đã cập nhật
   */
  const updateProfile = async (userData) => {
    try {
      setLoading(true)
      setError(null)
      const response = await authService.updateProfile(userData)
      // Instead of manually merging, fetch fresh user data
      // const updatedUser = response.data
      // setCurrentUser({ ...currentUser, ...updatedUser })
      // localStorage.setItem(USER_KEY, JSON.stringify({ ...currentUser, ...updatedUser }))

      // Fetch fresh user data after successful update
      const freshUser = await fetchAndSetUser();

      toast.success("Cập nhật thông tin thành công!")
      return freshUser; // Return the newly fetched user data
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Cập nhật thất bại. Vui lòng thử lại."
      setError(errorMessage)
      toast.error(errorMessage)
      throw error
    } finally {
      setLoading(false)
    }
  }

  /**
   * Kiểm tra quyền truy cập
   * @param {string|Array} requiredRole - Vai trò yêu cầu
   * @returns {boolean} - Có quyền truy cập hay không
   */
  const hasPermission = (requiredRole) => {
    if (!currentUser) return false

    if (Array.isArray(requiredRole)) {
      return requiredRole.includes(currentUser.role)
    }

    if (requiredRole === "admin") {
      return currentUser.role === "admin"
    }

    if (requiredRole === "employee") {
      return currentUser.role === "admin" || currentUser.role === "employee"
    }

    return true // Khách hàng có thể truy cập các trang công khai
  }

  /**
   * Gửi yêu cầu quên mật khẩu
   * @param {string} email - Email của người dùng
   */
  const forgotPassword = async (email) => {
    try {
      setLoading(true)
      setError(null)
      // API call is designed to always return success to prevent email enumeration
      await authService.forgotPassword(email)
      // Don't show specific success toast here, page handles the messaging
      return true; // Indicate the call was made
    } catch (error) {
      // Log error internally but don't expose details to the user
      console.error("Forgot password error:", error)
      // We still return true or don't throw, so the page shows the generic message
      return true; // Or simply don't throw, ensuring flow continues
      // throw error; // Avoid throwing to prevent info leak
    } finally {
      setLoading(false)
    }
  }

  /**
   * Đặt lại mật khẩu bằng token
   * @param {string} token - Token từ URL/email
   * @param {string} newPassword - Mật khẩu mới
   */
  const resetPassword = async (token, newPassword) => {
    try {
      setLoading(true)
      setError(null)
      await authService.resetPassword(token, newPassword)
      // Success toast is handled in the page component after this resolves
      // navigate("/login"); // Navigation is handled in the page component
      return true; // Indicate success
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Đặt lại mật khẩu thất bại. Vui lòng thử lại."
      setError(errorMessage)
      // Don't toast here, let the page handle it based on the thrown error
      // toast.error(errorMessage)
      throw error // Re-throw the error for the page component to catch
    } finally {
      setLoading(false)
    }
  }

  /**
   * Thay đổi mật khẩu người dùng đang đăng nhập
   * @param {string} currentPassword - Mật khẩu hiện tại
   * @param {string} newPassword - Mật khẩu mới
   */
  const changePassword = async (currentPassword, newPassword) => {
      try {
          setLoading(true);
          setError(null);
          await authService.changePassword(currentPassword, newPassword);
          // Success toast handled by the calling component
          return true;
      } catch (error) {
          const errorMessage = error.response?.data?.message || "Thay đổi mật khẩu thất bại. Vui lòng thử lại.";
          setError(errorMessage);
          // Let the component display the error toast and specific field errors
          throw error; // Re-throw for component handling
      } finally {
          setLoading(false);
      }
  };

  // Giá trị context
  const value = {
    currentUser,
    loading,
    error,
    login,
    register,
    logout,
    updateProfile,
    hasPermission,
    forgotPassword,
    resetPassword,
    changePassword,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export default AuthContext

