"use client"

/**
 * CustomerForm.jsx
 *
 * Vai trò: Component form để thêm mới hoặc chỉnh sửa thông tin khách hàng.
 * Chức năng:
 * - Hiển thị form với các trường thông tin khách hàng
 * - Xác thực dữ liệu nhập vào
 * - Gửi dữ liệu để tạo mới hoặc cập nhật khách hàng
 *
 * Quyền truy cập: Admin và Employee
 */

import { useState, useEffect } from "react"
import { useForm, Controller } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"
import Modal from "../../common/Modal"
import Spinner from "../../common/Spinner"
import "./CustomerForm.css"

// Validation Schema
const schema = yup.object().shape({
  firstName: yup.string().required("Họ là bắt buộc").max(50, "Họ không được vượt quá 50 ký tự"),
  lastName: yup.string().required("Tên là bắt buộc").max(50, "Tên không được vượt quá 50 ký tự"),
  email: yup
    .string()
    .email("Email không hợp lệ")
    .max(100, "Email không được vượt quá 100 ký tự")
    .nullable()
    .transform(value => (value ? value : null)), // Ensure empty string becomes null
  phoneNumber: yup
    .string()
    .required("Số điện thoại là bắt buộc")
    .matches(/^[0-9]+$/, "Số điện thoại chỉ được chứa số")
    .max(20, "Số điện thoại không được vượt quá 20 ký tự"),
  idNumber: yup.string().max(50, "Số CCCD/HC không được vượt quá 50 ký tự").nullable(),
  nationality: yup.string().max(50, "Quốc tịch không được vượt quá 50 ký tự").nullable(),
})

const CustomerForm = ({ isOpen, onClose, onSave, customerData, isSubmitting }) => {
  const isEditMode = Boolean(customerData)

  const {
    register,
    handleSubmit,
    control, // Use Controller for potential future custom inputs
    formState: { errors },
    reset,
    setValue,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
      idNumber: "",
      nationality: "",
    },
  })

  // Populate form when in edit mode or when customerData changes
  useEffect(() => {
    if (isEditMode && customerData) {
      // Ensure nulls are handled correctly, default to empty string for form fields
      setValue("firstName", customerData.firstName || "")
      setValue("lastName", customerData.lastName || "")
      setValue("email", customerData.email || "")
      setValue("phoneNumber", customerData.phoneNumber || "")
      setValue("idNumber", customerData.idNumber || "")
      setValue("nationality", customerData.nationality || "")
    } else {
      reset() // Reset form for add mode or if customerData becomes null
    }
  }, [customerData, isEditMode, setValue, reset])

  const onSubmit = (data) => {
    // Convert empty strings back to null for optional fields before saving
    const payload = {
      ...data,
      email: data.email || null,
      idNumber: data.idNumber || null,
      nationality: data.nationality || null,
    };
    onSave(payload)
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEditMode ? "Sửa thông tin Khách hàng" : "Thêm Khách hàng mới"} className="customer-form-modal">
      <form onSubmit={handleSubmit(onSubmit)} className="customer-form" noValidate>
        <div className="form-grid">
          {/* First Name */}
          <div className="form-group">
            <label htmlFor="firstName" className="required">
              Họ
            </label>
            <input
              id="firstName"
              type="text"
              {...register("firstName")}
              aria-invalid={errors.firstName ? "true" : "false"}
              disabled={isSubmitting}
            />
            {errors.firstName && <p className="error-message">{errors.firstName.message}</p>}
          </div>

          {/* Last Name */}
          <div className="form-group">
            <label htmlFor="lastName" className="required">
              Tên
            </label>
            <input
              id="lastName"
              type="text"
              {...register("lastName")}
              aria-invalid={errors.lastName ? "true" : "false"}
              disabled={isSubmitting}
            />
            {errors.lastName && <p className="error-message">{errors.lastName.message}</p>}
          </div>

          {/* Phone Number */}
          <div className="form-group">
            <label htmlFor="phoneNumber" className="required">
              Số điện thoại
            </label>
            <input
              id="phoneNumber"
              type="tel" // Use type=tel for better mobile UX
              {...register("phoneNumber")}
              aria-invalid={errors.phoneNumber ? "true" : "false"}
              disabled={isSubmitting}
            />
            {errors.phoneNumber && <p className="error-message">{errors.phoneNumber.message}</p>}
          </div>

          {/* Email */}
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              {...register("email")}
              aria-invalid={errors.email ? "true" : "false"}
              disabled={isSubmitting}
            />
            {errors.email && <p className="error-message">{errors.email.message}</p>}
          </div>

          {/* ID Number */}
          <div className="form-group">
            <label htmlFor="idNumber">Số CCCD/HC</label>
            <input
              id="idNumber"
              type="text"
              {...register("idNumber")}
              aria-invalid={errors.idNumber ? "true" : "false"}
              disabled={isSubmitting}
            />
            {errors.idNumber && <p className="error-message">{errors.idNumber.message}</p>}
          </div>

          {/* Nationality */}
          <div className="form-group">
            <label htmlFor="nationality">Quốc tịch</label>
            <input
              id="nationality"
              type="text"
              {...register("nationality")}
              aria-invalid={errors.nationality ? "true" : "false"}
              disabled={isSubmitting}
            />
            {errors.nationality && <p className="error-message">{errors.nationality.message}</p>}
          </div>
        </div>

        <div className="modal-actions">
          <button type="button" onClick={onClose} disabled={isSubmitting} className="btn btn-secondary">
            Hủy
          </button>
          <button type="submit" disabled={isSubmitting} className="btn btn-primary">
            {isSubmitting ? <Spinner size="sm" /> : isEditMode ? "Lưu thay đổi" : "Thêm Khách hàng"}
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default CustomerForm

