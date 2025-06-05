import React, { useState } from 'react';
import { FaSpinner, FaTimes } from 'react-icons/fa';
import { toast } from 'react-toastify';
import serviceService from '../../../services/serviceService'; // Giả sử service này có createCategory

const CategoryForm = ({ onClose, onSuccess }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Tên danh mục là bắt buộc.');
      return;
    }
    setError('');
    setIsSubmitting(true);

    try {
      const payload = { name: name.trim(), description: description.trim() };
      await serviceService.createCategory(payload); // Gọi API tạo danh mục
      toast.success('Thêm danh mục thành công!');
      onSuccess(); // Gọi callback để load lại danh mục và đóng form
    } catch (err) {
      const backendError = err.response?.data?.message || err.message || 'Lỗi không xác định';
      toast.error(`Thêm danh mục thất bại: ${backendError}`);
      console.error("Create category error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="category-form-modal-content"> {/* Class riêng */} 
      <div className="modal-header">
        <h2>Thêm Danh mục Dịch vụ Mới</h2>
        <button onClick={onClose} className="close-button" title="Đóng"><FaTimes /></button>
      </div>
      <form onSubmit={handleSubmit} className="category-form-container">
        <div className="form-group">
          <label htmlFor="categoryName">Tên danh mục</label>
          <input
            type="text"
            id="categoryName"
            value={name}
            onChange={(e) => {
                setName(e.target.value);
                if(error) setError('');
            }}
            disabled={isSubmitting}
            className={error ? 'input-error' : ''}
          />
          {error && <span className="error-message">{error}</span>}
        </div>
        <div className="form-group">
          <label htmlFor="categoryDescription">Mô tả (tùy chọn)</label>
          <textarea
            id="categoryDescription"
            rows="3"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={isSubmitting}
          />
        </div>
        <div className="form-actions">
          <button type="button" className="cancel-button" onClick={onClose} disabled={isSubmitting}>
            Hủy
          </button>
          <button type="submit" className="save-button" disabled={isSubmitting}>
            {isSubmitting ? <><FaSpinner className="spinner" /> Đang thêm...</> : 'Thêm danh mục'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CategoryForm; 