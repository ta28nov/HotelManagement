"use client"

import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { FaUser, FaEnvelope, FaLock, FaPhone, FaGoogle, FaFacebookF } from "react-icons/fa"
import { toast } from "react-toastify"
import Header from "../../components/Header/Header"
import Footer from "../../components/Footer/Footer"
import { useAuth } from "../../context/AuthContext"
import "./RegisterPage.css"

const RegisterPage = () => {
  // State cho form data
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    passwordConfirmation: "",
    agreeTerms: false,
  })

  // State cho validation errors và loading state
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Lấy hàm register từ AuthContext thông qua hook useAuth
  const { register } = useAuth()
  const navigate = useNavigate()

  // Scroll to top khi component mount
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  // Xử lý thay đổi input
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target

    // Cập nhật state dựa trên loại input
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))

    // Xóa lỗi khi người dùng sửa input
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  // Validate form trước khi submit
  const validateForm = () => {
    const newErrors = {}

    // Validate firstName
    if (!formData.firstName.trim()) {
      newErrors.firstName = "Vui lòng nhập tên"
    }

    // Validate lastName
    if (!formData.lastName.trim()) {
      newErrors.lastName = "Vui lòng nhập họ"
    }

    // Validate email
    if (!formData.email.trim()) {
      newErrors.email = "Vui lòng nhập email"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email không hợp lệ"
    }

    // Validate password
    if (!formData.password) {
      newErrors.password = "Vui lòng nhập mật khẩu"
    } else if (formData.password.length < 8) {
      newErrors.password = "Mật khẩu phải có ít nhất 8 ký tự"
    }

    // Validate password confirmation
    if (formData.password !== formData.passwordConfirmation) {
      newErrors.passwordConfirmation = "Mật khẩu xác nhận không khớp"
    }

    // Validate terms agreement
    if (!formData.agreeTerms) {
      newErrors.agreeTerms = "Bạn phải đồng ý với điều khoản và điều kiện"
    }

    // Cập nhật state errors và trả về kết quả validation
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Xử lý đăng ký
  const handleRegister = async (e) => {
    e.preventDefault()

    // Kiểm tra form hợp lệ
    if (validateForm()) {
      setIsSubmitting(true)

      try {
        // Lấy dữ liệu từ form
        const { firstName, lastName, email, phone, password, passwordConfirmation } = formData

        // Chuẩn bị dữ liệu theo đúng định dạng mà authService.register cần
        const userData = {
          firstName,
          lastName,
          email,
          phone,
          password,
          confirmPassword: passwordConfirmation, // Đổi tên để phù hợp với authService
        }

        // Gọi hàm register từ AuthContext
        await register(userData)

        // Hiển thị thông báo thành công (mặc dù AuthContext đã có toast,
        // nhưng chúng ta có thể thêm thông báo ở đây nếu cần)
        toast.success("Đăng ký thành công! Vui lòng đăng nhập.")

        // Chuyển hướng sẽ được xử lý trong AuthContext
      } catch (err) {
        // Xử lý lỗi cụ thể nếu cần
        const errorMessage = err.response?.data?.message || "Đăng ký thất bại. Vui lòng thử lại."
        toast.error(errorMessage)

        // Cập nhật state errors nếu có lỗi từ server
        if (err.response?.data?.errors) {
          setErrors((prev) => ({
            ...prev,
            ...err.response.data.errors,
          }))
        }
      } finally {
        setIsSubmitting(false)
      }
    }
  }

  // Xử lý đăng ký bằng Google
  const handleGoogleSignup = () => {
    // Thực hiện đăng ký bằng Google (nếu có)
    toast.info("Chức năng đăng ký bằng Google đang được phát triển")
  }

  // Xử lý đăng ký bằng Facebook
  const handleFacebookSignup = () => {
    // Thực hiện đăng ký bằng Facebook (nếu có)
    toast.info("Chức năng đăng ký bằng Facebook đang được phát triển")
  }

  return (
    <div className="register-page">
      <Header />

      <div className="register-container">
        <div className="container">
          <motion.div
            className="register-form-container"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="register-form-content">
              <h1>Register New Account</h1>
              <p>Join our community to access exclusive benefits and manage your bookings.</p>

              <form onSubmit={handleRegister} className="register-form">
                {/* Họ và tên */}
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="firstName">
                      <FaUser /> Tên
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      placeholder="Nhập tên của bạn"
                      className={errors.firstName ? "error" : ""}
                    />
                    {errors.firstName && <div className="error-message">{errors.firstName}</div>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="lastName">
                      <FaUser /> Họ
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      placeholder="Nhập họ của bạn"
                      className={errors.lastName ? "error" : ""}
                    />
                    {errors.lastName && <div className="error-message">{errors.lastName}</div>}
                  </div>
                </div>

                {/* Email và số điện thoại */}
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="email">
                      <FaEnvelope /> Địa chỉ email
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="Nhập email của bạn"
                      className={errors.email ? "error" : ""}
                    />
                    {errors.email && <div className="error-message">{errors.email}</div>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="phone">
                      <FaPhone /> Số điện thoại (Tùy chọn)
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="Nhập số điện thoại của bạn"
                    />
                  </div>
                </div>

                {/* Mật khẩu và xác nhận mật khẩu */}
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="password">
                      <FaLock /> Mật khẩu
                    </label>
                    <input
                      type="password"
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="Nhập mật khẩu của bạn"
                      className={errors.password ? "error" : ""}
                    />
                    {errors.password && <div className="error-message">{errors.password}</div>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="passwordConfirmation">
                      <FaLock /> Xác nhận mật khẩu
                    </label>
                    <input
                      type="password"
                      id="passwordConfirmation"
                      name="passwordConfirmation"
                      value={formData.passwordConfirmation}
                      onChange={handleInputChange}
                      placeholder="Xác nhận mật khẩu của bạn"
                      className={errors.passwordConfirmation ? "error" : ""}
                    />
                    {errors.passwordConfirmation && <div className="error-message">{errors.passwordConfirmation}</div>}
                  </div>
                </div>

                {/* Điều khoản và điều kiện */}
                <div className="form-group terms">
                  <div className="checkbox-container">
                    <input
                      type="checkbox"
                      id="agreeTerms"
                      name="agreeTerms"
                      checked={formData.agreeTerms}
                      onChange={handleInputChange}
                      className={errors.agreeTerms ? "error" : ""}
                    />
                    <label htmlFor="agreeTerms">
                      Tôi đồng ý với <Link to="/terms">Điều khoản và Điều kiện</Link> và{" "}
                      <Link to="/privacy">Chính sách Bảo mật</Link>
                    </label>
                  </div>
                  {errors.agreeTerms && <div className="error-message">{errors.agreeTerms}</div>}
                </div>

                {/* Nút đăng ký */}
                <button type="submit" className="btn btn-primary btn-block" disabled={isSubmitting}>
                  {isSubmitting ? "Đang tạo tài khoản..." : "Tạo tài khoản"}
                </button>
              </form>

              {/* Đăng ký bằng mạng xã hội */}
              <div className="social-register">
                <p>Hoặc đăng ký bằng</p>
                <div className="social-buttons">
                  <button className="social-button google" onClick={handleGoogleSignup} type="button">
                    <FaGoogle /> Google
                  </button>
                  <button className="social-button facebook" onClick={handleFacebookSignup} type="button">
                    <FaFacebookF /> Facebook
                  </button>
                </div>
              </div>

              {/* Link đăng nhập */}
              <div className="login-link">
                <p>
                  Đã có tài khoản? <Link to="/login">Login</Link>
                </p>
              </div>
            </div>

            {/* Hình ảnh bên phải */}
            <div className="register-image">
              <img
                src="https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80"
                alt="Luxury Hotel"
              />
              <div className="image-overlay">
                <h2>Tham gia cộng đồng của chúng tôi</h2>
                <p>
                  Tạo tài khoản để truy cập các quyền lợi thành viên độc quyền và quản lý đặt phòng của bạn một cách dễ
                  dàng.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <Footer />
    </div>
  )
}

export default RegisterPage

