"use client"

import { useState, useEffect } from "react"
import PropTypes from "prop-types"
import "./RoomTypeForm.css" // Relative path to CSS

const RoomTypeForm = ({
  roomType,
  isEditMode,
  onSave,
  onClose,
  isSubmitting,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    basePrice: "",
    capacity: "",
  })
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (isEditMode && roomType) {
      setFormData({
        name: roomType.name || "",
        description: roomType.description || "",
        basePrice: roomType.basePrice ? String(roomType.basePrice) : "",
        capacity: roomType.capacity ? String(roomType.capacity) : "",
      })
      setErrors({}) // Clear errors when loading data for edit
    } else {
      // Reset form for add mode or if roomType is null
      setFormData({ name: "", description: "", basePrice: "", capacity: "" })
      setErrors({})
    }
  }, [isEditMode, roomType])

  const validateForm = () => {
    const newErrors = {}
    if (!formData.name.trim()) {
      newErrors.name = "Tên loại phòng là bắt buộc."
    }
    if (!formData.basePrice) {
      newErrors.basePrice = "Giá cơ bản là bắt buộc."
    } else if (isNaN(formData.basePrice) || Number(formData.basePrice) < 0) {
      newErrors.basePrice = "Giá cơ bản phải là một số không âm."
    }
    if (!formData.capacity) {
      newErrors.capacity = "Sức chứa là bắt buộc."
    } else if (
      !Number.isInteger(Number(formData.capacity)) ||
      Number(formData.capacity) <= 0
    ) {
      newErrors.capacity = "Sức chứa phải là một số nguyên dương."
    }
    // Description is optional

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))

    // Clear validation error for the field being changed
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: null,
      }))
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (validateForm()) {
      // Prepare data according to API spec (decimal/int types)
      const dataToSend = {
        ...formData,
        basePrice: parseFloat(formData.basePrice),
        capacity: parseInt(formData.capacity, 10),
      }
      const currentId = isEditMode ? roomType?.id : null
      onSave(dataToSend, currentId) // Pass data and ID (null for create) to parent
    }
  }

  return (
    <div className="form-modal-content roomtype-form">
      <h2>{isEditMode ? "Chỉnh sửa Loại phòng" : "Thêm Loại phòng mới"}</h2>
      <form onSubmit={handleSubmit} noValidate>
        <div className="form-group">
          <label htmlFor="rt-name">Tên loại phòng <span className="required">*</span></label>
          <input
            type="text"
            id="rt-name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? "rt-name-error" : undefined}
          />
          {errors.name && <span id="rt-name-error" className="error-message">{errors.name}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="rt-description">Mô tả</label>
          <textarea
            id="rt-description"
            name="description"
            value={formData.description}
            onChange={handleChange}
          />
          {/* No validation needed for description */}
        </div>

        <div className="form-group">
          <label htmlFor="rt-basePrice">Giá cơ bản (VNĐ) <span className="required">*</span></label>
          <input
            type="number"
            id="rt-basePrice"
            name="basePrice"
            value={formData.basePrice}
            onChange={handleChange}
            required
            min="0"
            step="1000" // Example step
            aria-invalid={!!errors.basePrice}
            aria-describedby={errors.basePrice ? "rt-basePrice-error" : undefined}
          />
          {errors.basePrice && <span id="rt-basePrice-error" className="error-message">{errors.basePrice}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="rt-capacity">Sức chứa (người) <span className="required">*</span></label>
          <input
            type="number"
            id="rt-capacity"
            name="capacity"
            value={formData.capacity}
            onChange={handleChange}
            required
            min="1"
            step="1"
            aria-invalid={!!errors.capacity}
            aria-describedby={errors.capacity ? "rt-capacity-error" : undefined}
          />
          {errors.capacity && <span id="rt-capacity-error" className="error-message">{errors.capacity}</span>}
        </div>

        <div className="form-actions">
          <button type="button" onClick={onClose} disabled={isSubmitting} className="cancel-button">
            Hủy bỏ
          </button>
          <button type="submit" disabled={isSubmitting} className="save-button">
            {isSubmitting ? "Đang lưu..." : (isEditMode ? "Lưu thay đổi" : "Thêm mới")}
          </button>
        </div>
      </form>
    </div>
  )
}

RoomTypeForm.propTypes = {
  roomType: PropTypes.object, // Null when adding
  isEditMode: PropTypes.bool.isRequired,
  onSave: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  isSubmitting: PropTypes.bool.isRequired,
}

export default RoomTypeForm 