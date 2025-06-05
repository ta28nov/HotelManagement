"use client"

import { useState, useEffect } from "react"
import { Link, useParams, useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { FaLock } from "react-icons/fa"
import { toast } from "react-toastify"
import Header from "../../components/Header/Header"
import Footer from "../../components/Footer/Footer"
import { useAuth } from "../../context/AuthContext"
import "./ResetPasswordPage.css"

const ResetPasswordPage = () => {
  const { token } = useParams() // Get token from URL
  const navigate = useNavigate()
  const { resetPassword } = useAuth() // Get function from context (to be added)

  const [formData, setFormData] = useState({
    password: "",
    passwordConfirmation: "",
  })
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [tokenIsValid, setTokenIsValid] = useState(true) // Assume token is valid initially
  const [resetSuccess, setResetSuccess] = useState(false);

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0)
    // Basic check if token exists, could add more validation later if needed
    if (!token) {
        setTokenIsValid(false);
        toast.error("Token đặt lại mật khẩu không hợp lệ hoặc bị thiếu.");
    }
  }, [token])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Clear error
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
    if (!formData.password) {
      newErrors.password = "Vui lòng nhập mật khẩu mới"
    } else if (formData.password.length < 8) {
      newErrors.password = "Mật khẩu phải có ít nhất 8 ký tự"
    }
    if (formData.password !== formData.passwordConfirmation) {
      newErrors.passwordConfirmation = "Mật khẩu xác nhận không khớp"
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle form submission
  const handleResetPassword = async (e) => {
    e.preventDefault()
    if (!token) {
       toast.error("Token đặt lại mật khẩu không hợp lệ hoặc bị thiếu.");
       return;
    }
    if (validateForm()) {
      setIsSubmitting(true)
      try {
        // Call context function (to be implemented)
        await resetPassword(token, formData.password)
        toast.success("Mật khẩu đã được đặt lại thành công! Vui lòng đăng nhập.")
        setResetSuccess(true); // Indicate success
        setTimeout(() => {
            navigate("/login")
        }, 3000); // Redirect after 3 seconds
      } catch (err) {
        const errorMessage = err.response?.data?.message || "Đặt lại mật khẩu thất bại. Token có thể không hợp lệ hoặc đã hết hạn."
        toast.error(errorMessage)
         // Check if the error indicates an invalid token and update state
        if (err.response?.status === 400 || err.response?.status === 404) {
            // Assuming 400/404 might mean invalid token based on general practices
            setTokenIsValid(false);
        }
      } finally {
        setIsSubmitting(false)
      }
    }
  }

  return (
    <div className="reset-password-page">
      <Header />
      <div className="reset-password-container">
        <motion.div
          className="reset-password-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1>Đặt lại mật khẩu</h1>

          {!tokenIsValid ? (
            <div className="token-error-message">
              <p>Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn. Vui lòng yêu cầu lại.</p>
              <Link to="/forgot-password" className="btn btn-link">Yêu cầu liên kết mới</Link>
            </div>
          ) : resetSuccess ? (
             <div className="submission-success">
                 <h2>Thành công!</h2>
                 <p>Mật khẩu của bạn đã được đặt lại thành công. Bạn sẽ được chuyển hướng đến trang đăng nhập.</p>
                 <Link to="/login" className="btn btn-primary">Đi đến Đăng nhập ngay</Link>
            </div>
          ) : (
            <>
              <p>Nhập mật khẩu mới và xác nhận mật khẩu cho tài khoản của bạn.</p>
              <form onSubmit={handleResetPassword} className="reset-password-form">
                <div className="form-group">
                  <label htmlFor="password">
                    <FaLock /> Mật khẩu mới
                  </label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Nhập mật khẩu mới"
                    className={errors.password ? "error" : ""}
                  />
                  {errors.password && <div className="error-message">{errors.password}</div>}
                </div>
                <div className="form-group">
                  <label htmlFor="passwordConfirmation">
                    <FaLock /> Xác nhận mật khẩu mới
                  </label>
                  <input
                    type="password"
                    id="passwordConfirmation"
                    name="passwordConfirmation"
                    value={formData.passwordConfirmation}
                    onChange={handleInputChange}
                    placeholder="Xác nhận mật khẩu mới"
                    className={errors.passwordConfirmation ? "error" : ""}
                  />
                  {errors.passwordConfirmation && (
                    <div className="error-message">{errors.passwordConfirmation}</div>
                  )}
                </div>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Đang cập nhật..." : "Đặt lại mật khẩu"}
                </button>
              </form>
            </>
          )}
        </motion.div>
      </div>
      <Footer />
    </div>
  )
}

export default ResetPasswordPage 