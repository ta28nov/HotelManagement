import React, { useState, useEffect } from 'react';
import { FaSpinner, FaTimes } from 'react-icons/fa';

// Component này nhận vào onSave để gọi lại Services.jsx xử lý API
const ServiceForm = ({ service, isEditMode, onClose, onSave, categories = [], isSubmitting }) => {
  const [formData, setFormData] = useState({
    name: '',
    categoryId: '',
    description: '',
    price: '',
    isAvailable: true, // Mặc định là true
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isEditMode && service) {
      setFormData({
        name: service.name || '',
        categoryId: service.categoryId || '',
        description: service.description || '',
        price: service.price || '',
        isAvailable: service.isAvailable !== undefined ? service.isAvailable : true,
      });
      setErrors({});
    } else {
      // Reset form for adding
      setFormData({
        name: '',
        categoryId: categories.length > 0 ? categories[0].id : '', // Chọn mặc định nếu có
        description: '',
        price: '',
        isAvailable: true,
      });
      setErrors({});
    }
  }, [service, isEditMode, categories]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : (type === 'number' ? parseFloat(value) || '' : value);
    setFormData(prev => ({ ...prev, [name]: val }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = 'Tên dịch vụ là bắt buộc.';
    if (!formData.categoryId) newErrors.categoryId = 'Danh mục là bắt buộc.';
    if (formData.price === '' || isNaN(formData.price) || formData.price < 0) newErrors.price = 'Giá không hợp lệ.';
    // Description có thể không bắt buộc

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isSubmitting || !validateForm()) return;

    const dataToSave = {
      ...formData,
      price: parseFloat(formData.price),
      categoryId: parseInt(formData.categoryId, 10),
    };
    onSave(dataToSave, isEditMode ? service.id : null);
  };

  return (
    <div className="service-form-modal-content"> {/* Class riêng cho modal dịch vụ */} 
      <div className="modal-header">
        <h2>{isEditMode ? 'Chỉnh sửa Dịch vụ' : 'Thêm Dịch vụ Mới'}</h2>
        <button onClick={onClose} className="close-button" title="Đóng"><FaTimes /></button>
      </div>
      <form onSubmit={handleSubmit} className="service-form-container"> {/* Class riêng cho form dịch vụ */} 
        <div className="form-group">
          <label htmlFor="name">Tên dịch vụ</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            disabled={isSubmitting}
            className={errors.name ? 'input-error' : ''}
          />
          {errors.name && <span className="error-message">{errors.name}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="categoryId">Danh mục</label>
          <select
            id="categoryId"
            name="categoryId"
            value={formData.categoryId}
            onChange={handleChange}
            disabled={isSubmitting || categories.length === 0}
            className={errors.categoryId ? 'input-error' : ''}
          >
            <option value="" disabled>-- Chọn danh mục --</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
          {errors.categoryId && <span className="error-message">{errors.categoryId}</span>}
          {categories.length === 0 && !isSubmitting && <span className="info-message">Đang tải danh mục...</span>}
        </div>

        <div className="form-group">
          <label htmlFor="description">Mô tả</label>
          <textarea
            id="description"
            name="description"
            rows="3"
            value={formData.description}
            onChange={handleChange}
            disabled={isSubmitting}
          />
        </div>

        <div className="form-group">
          <label htmlFor="price">Giá (VNĐ)</label>
          <input
            type="number"
            id="price"
            name="price"
            value={formData.price}
            onChange={handleChange}
            disabled={isSubmitting}
            min="0"
            step="1000" // Bước nhảy giá
            className={errors.price ? 'input-error' : ''}
          />
          {errors.price && <span className="error-message">{errors.price}</span>}
        </div>

        <div className="form-group form-group-checkbox">
          <label htmlFor="isAvailable">Trạng thái hoạt động</label>
           <div className="checkbox-wrapper">
             <input
               type="checkbox"
               id="isAvailable"
               name="isAvailable"
               checked={formData.isAvailable}
               onChange={handleChange}
               disabled={isSubmitting}
             />
             <span>{formData.isAvailable ? 'Đang hoạt động' : 'Ngừng hoạt động'}</span>
           </div>
        </div>

        <div className="form-actions">
          <button type="button" className="cancel-button" onClick={onClose} disabled={isSubmitting}>
            Hủy
          </button>
          <button type="submit" className="save-button" disabled={isSubmitting || categories.length === 0}>
            {isSubmitting ? (
              <><FaSpinner className="spinner" /> Đang lưu...</>
            ) : (isEditMode ? 'Lưu thay đổi' : 'Thêm mới')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ServiceForm; 