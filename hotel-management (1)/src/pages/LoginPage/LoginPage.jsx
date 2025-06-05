"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { FaEnvelope, FaLock, FaGoogle, FaFacebookF } from "react-icons/fa"
import Header from "../../components/Header/Header"
import Footer from "../../components/Footer/Footer"
import "./LoginPage.css"
import { useAuth } from "../../context/AuthContext";

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  })
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Lấy hàm login từ AuthContext (AuthContext sẽ xử lý gọi API và chuyển hướng)
  const { login } = useAuth()

  // Cuộn lên đầu trang khi component được tải
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  // Xử lý thay đổi input
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))

    // Xóa lỗi khi người dùng nhập lại
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  // Xác thực form
  const validateForm = () => {
    const newErrors = {}

    if (!formData.email.trim()) {
      newErrors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid"
    }

    if (!formData.password) {
      newErrors.password = "Password is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Xử lý đăng nhập, gọi API thông qua AuthContext
  const handleLogin = async (e) => {
    e.preventDefault()

    if (validateForm()) {
      setIsSubmitting(true)
      try {
        // Gọi hàm login từ AuthContext, hàm này sẽ tự động lưu token, cập nhật currentUser và chuyển hướng dựa theo vai trò người dùng.
        await login(formData.email, formData.password)
      } catch (error) {
        // Các lỗi đã được xử lý bên trong AuthContext, bạn có thể log lỗi nếu cần.
        console.error("Login error:", error)
      } finally {
        setIsSubmitting(false)
      }
    }
  }

  return (
    <div className="login-page">
      <Header />

      <div className="login-container">
        <div className="container">
          <motion.div
            className="login-form-container"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="login-form-content">
              <h1>Login to Your Account</h1>
              <p>Welcome back! Please enter your credentials to access your account.</p>

              <form onSubmit={handleLogin} className="login-form">
                <div className="form-group">
                  <label htmlFor="email">
                    <FaEnvelope /> Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter your email"
                    className={errors.email ? "error" : ""}
                  />
                  {errors.email && <div className="error-message">{errors.email}</div>}
                </div>

                <div className="form-group">
                  <label htmlFor="password">
                    <FaLock /> Password
                  </label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Enter your password"
                    className={errors.password ? "error" : ""}
                  />
                  {errors.password && <div className="error-message">{errors.password}</div>}
                </div>

                <div className="form-options">
                  <div className="remember-me">
                    <input
                      type="checkbox"
                      id="rememberMe"
                      name="rememberMe"
                      checked={formData.rememberMe}
                      onChange={handleInputChange}
                    />
                    <label htmlFor="rememberMe">Remember me</label>
                  </div>

                  <Link to="/forgot-password" className="forgot-password">
                    Forgot Password?
                  </Link>
                </div>

                <button type="submit" className="btn btn-primary btn-block" disabled={isSubmitting}>
                  {isSubmitting ? "Logging in..." : "Login"}
                </button>
              </form>

              <div className="social-login">
                <p>Or login with</p>
                <div className="social-buttons">
                  <button className="social-button google">
                    <FaGoogle /> Google
                  </button>
                  <button className="social-button facebook">
                    <FaFacebookF /> Facebook
                  </button>
                </div>
              </div>

              <div className="register-link">
                <p>
                  Don't have an account? <Link to="/register">Register Now</Link>
                </p>
              </div>
            </div>

            <div className="login-image">
              <img
                src="https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80"
                alt="Luxury Hotel"
              />
              <div className="image-overlay">
                <h2>Experience Luxury</h2>
                <p>Login to access exclusive member benefits and manage your reservations.</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <Footer />
    </div>
  )
}

export default LoginPage
