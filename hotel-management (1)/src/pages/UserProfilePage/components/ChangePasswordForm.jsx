"use client"

import { useState } from "react"
import { FaLock } from "react-icons/fa"
import { toast } from "react-toastify"
import { useAuth } from "../../../context/AuthContext" // Adjust path as needed
import "./ChangePasswordForm.css"

const ChangePasswordForm = () => {
  const { changePassword, loading } = useAuth() // Get function from context

  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    passwordConfirmation: "",
  })
  const [errors, setErrors] = useState({})

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    // Clear error on change
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
    if (!formData.currentPassword) {
      newErrors.currentPassword = "Vui lòng nhập mật khẩu hiện tại"
    }
    if (!formData.newPassword) {
      newErrors.newPassword = "Vui lòng nhập mật khẩu mới"
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = "Mật khẩu mới phải có ít nhất 8 ký tự"
    }
    if (formData.newPassword !== formData.passwordConfirmation) {
      newErrors.passwordConfirmation = "Mật khẩu xác nhận không khớp"
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle submission
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (validateForm()) {
      try {
        // Call context function
        await changePassword(
          formData.currentPassword,
          formData.newPassword
        )
        toast.success("Đổi mật khẩu thành công!")
        // Reset form after success
        setFormData({
          currentPassword: "",
          newPassword: "",
          passwordConfirmation: "",
        })
        setErrors({});
      } catch (err) {
        // Context handles general error toast
        console.error("Change password failed:", err)
         // Display specific validation errors if provided by API
         if (err.response?.data?.errors) {
            // Map backend errors to frontend fields if names differ
            // Example: map err.response.data.errors.CurrentPassword to errors.currentPassword
            const backendErrors = err.response.data.errors;
            const mappedErrors = {};
            if(backendErrors.CurrentPassword) mappedErrors.currentPassword = backendErrors.CurrentPassword[0];
            if(backendErrors.Password) mappedErrors.newPassword = backendErrors.Password[0]; // Assuming 'Password' maps to 'newPassword'
            if(backendErrors.PasswordConfirmation) mappedErrors.passwordConfirmation = backendErrors.PasswordConfirmation[0];
            setErrors(mappedErrors);
        } else if (err.response?.data?.message) {
            // If general message like 'Incorrect current password', show it as a general error or specific field
             setErrors({ currentPassword: err.response.data.message }); // Or a more general error display
        }
      }
    }
  }

  return (
    <form onSubmit={handleSubmit} className="change-password-form">
      <p>Để bảo mật tài khoản, vui lòng không chia sẻ mật khẩu cho người khác.</p>
      <div className="form-group">
        <label htmlFor="currentPassword">
          <FaLock /> Mật khẩu hiện tại
        </label>
        <input
          type="password"
          id="currentPassword"
          name="currentPassword"
          value={formData.currentPassword}
          onChange={handleInputChange}
          className={errors.currentPassword ? "error" : ""}
          autoComplete="current-password"
        />
        {errors.currentPassword && (
          <div className="error-message">{errors.currentPassword}</div>
        )}
      </div>
      <div className="form-group">
        <label htmlFor="newPassword">
          <FaLock /> Mật khẩu mới
        </label>
        <input
          type="password"
          id="newPassword"
          name="newPassword"
          value={formData.newPassword}
          onChange={handleInputChange}
          className={errors.newPassword ? "error" : ""}
          autoComplete="new-password"
        />
        {errors.newPassword && (
          <div className="error-message">{errors.newPassword}</div>
        )}
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
          className={errors.passwordConfirmation ? "error" : ""}
          autoComplete="new-password"
        />
        {errors.passwordConfirmation && (
          <div className="error-message">{errors.passwordConfirmation}</div>
        )}
      </div>
      <button
        type="submit"
        className="btn btn-primary"
        disabled={loading}
      >
        {loading ? "Đang lưu..." : "Lưu thay đổi"}
      </button>
    </form>
  )
}

export default ChangePasswordForm 