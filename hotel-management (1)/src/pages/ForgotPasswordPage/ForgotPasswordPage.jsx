"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { FaEnvelope, FaArrowLeft } from "react-icons/fa"
import { toast } from "react-toastify"
import Header from "../../components/Header/Header"
import Footer from "../../components/Footer/Footer"
import { useAuth } from "../../context/AuthContext"
import "./ForgotPasswordPage.css"

const ForgotPasswordPage = () => {
  const [formData, setFormData] = useState({ email: "" })
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false) // State to show success message

  // Get forgotPassword function from context (Will be added later)
  const { forgotPassword } = useAuth()

  // Scroll to top on component mount
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  // Validate form
  const validateForm = () => {
    const newErrors = {}
    if (!formData.email.trim()) {
      newErrors.email = "Vui lòng nhập email"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email không hợp lệ"
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle form submission
  const handleForgotPassword = async (e) => {
    e.preventDefault()
    if (validateForm()) {
      setIsSubmitting(true)
      try {
        // Call context function (to be implemented)
        await forgotPassword(formData.email)
        // Always show success message for security reasons
        setIsSubmitted(true)
        // Optionally toast, but the API doc says always return 200 OK
        // toast.success("Yêu cầu đặt lại mật khẩu đã được gửi.");
      } catch (err) {
        // Log error for debugging, but don't reveal to user
        console.error("Forgot password error:", err)
        // Still show success message to prevent email enumeration
        setIsSubmitted(true)
        // const errorMessage = err.response?.data?.message || "Đã xảy ra lỗi. Vui lòng thử lại."
        // toast.error(errorMessage)
      } finally {
        setIsSubmitting(false)
      }
    }
  }

  return (
    <div className="forgot-password-page">
      <Header />
      <div className="forgot-password-container">
        <motion.div
          className="forgot-password-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {!isSubmitted ? (
            <>
              <h1>Quên mật khẩu?</h1>
              <p>
                Đừng lo lắng! Nhập địa chỉ email liên kết với tài khoản của bạn và chúng tôi sẽ gửi hướng dẫn đặt lại mật khẩu (nếu tài khoản tồn tại).
              </p>
              <form onSubmit={handleForgotPassword} className="forgot-password-form">
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
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Đang xử lý..." : "Gửi hướng dẫn"}
                </button>
              </form>
              <div className="back-to-login">
                <Link to="/login">
                  <FaArrowLeft /> Quay lại Đăng nhập
                </Link>
              </div>
            </>
          ) : (
            <div className="submission-success">
              <h2>Kiểm tra hộp thư của bạn</h2>
              <p>
                Nếu địa chỉ email <strong>{formData.email}</strong> được liên kết với một tài khoản, bạn sẽ nhận được email hướng dẫn đặt lại mật khẩu trong vài phút tới.
              </p>
               <p>Vui lòng kiểm tra cả thư mục spam.</p>
              <Link to="/login" className="btn btn-secondary">
                Quay lại Đăng nhập
              </Link>
            </div>
          )}
        </motion.div>
      </div>
      <Footer />
    </div>
  )
}

export default ForgotPasswordPage 