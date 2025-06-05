import React, { useState, useEffect } from 'react';
import { ROLES } from '../../../config/constants';
import { FaSpinner } from 'react-icons/fa'; // Import spinner icon
// Import CSS riêng cho form nếu cần, hoặc sử dụng Users.css
// import './UserForm.css';

// Helper function for email validation (simpler regex)
const validateEmail = (email) => {
  // Basic regex, allows most common formats
  const re = /^\S+@\S+\.\S+$/;
  return re.test(String(email).toLowerCase());
};

const UserForm = ({ initialData, onSave, onCancel, isSubmitting }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phoneNumber: '',
    role: ROLES.CUSTOMER, // Mặc định là khách hàng
  });
  const [errors, setErrors] = useState({}); // State để lưu lỗi validation
  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    if (initialData) {
      setIsEditMode(true);
      // Không bao gồm password khi sửa
      setFormData({
        name: initialData.name || '',
        email: initialData.email || '',
        password: '', // Để trống khi sửa
        phoneNumber: initialData.phoneNumber || '',
        role: initialData.role || ROLES.CUSTOMER,
      });
    } else {
      setIsEditMode(false);
      // Reset form cho chế độ thêm mới
      setFormData({
        name: '',
        email: '',
        password: '',
        phoneNumber: '',
        role: ROLES.CUSTOMER,
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Xóa lỗi khi người dùng bắt đầu nhập lại
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = 'Họ tên là bắt buộc.';

    // Chỉ validate email khi KHÔNG ở chế độ chỉnh sửa (tức là khi thêm mới)
    // Hoặc nếu bạn cho phép sửa email thì cần logic khác
    if (!isEditMode) { 
        if (!formData.email) {
          newErrors.email = 'Email là bắt buộc.';
        } else if (!validateEmail(formData.email)) {
          newErrors.email = 'Định dạng email không hợp lệ.';
        }
        if (!formData.password) {
          newErrors.password = 'Mật khẩu là bắt buộc khi tạo mới.';
        }
    }
    
    // Thêm các validation khác nếu cần (ví dụ: SĐT)

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0; // Trả về true nếu không có lỗi
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!validateForm()) { // Validate trước khi submit
      return;
    }

    const dataToSave = { ...formData };
    if (isEditMode) {
      delete dataToSave.password; // Vẫn không gửi password khi update
      // Chỉ gửi các trường thực sự thay đổi (tùy chọn nâng cao)
    }
    onSave(dataToSave, isEditMode ? initialData.id : null);
  };

  return (
    // Sử dụng div làm container tạm thời, sau này có thể thay bằng Modal component
    <div className="user-form-container">
      <h2>{isEditMode ? 'Chỉnh sửa Người dùng' : 'Thêm Người dùng Mới'}</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Họ tên</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required={!isEditMode} // Bắt buộc khi thêm mới
            className={errors.name ? 'input-error' : ''}
          />
          {errors.name && <span className="error-message">{errors.name}</span>}
        </div>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            disabled={isEditMode} // Không cho sửa email? (Tùy yêu cầu)
            className={errors.email ? 'input-error' : ''}
          />
          {errors.email && <span className="error-message">{errors.email}</span>}
        </div>
        {!isEditMode && ( // Chỉ hiển thị password khi thêm mới
          <div className="form-group">
            <label htmlFor="password">Mật khẩu</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className={errors.password ? 'input-error' : ''}
            />
            {errors.password && <span className="error-message">{errors.password}</span>}
          </div>
        )}
        <div className="form-group">
          <label htmlFor="phoneNumber">Số điện thoại</label>
          <input
            type="tel"
            id="phoneNumber"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleChange}
          />
        </div>
        <div className="form-group">
          <label htmlFor="role">Vai trò</label>
          <select
            id="role"
            name="role"
            value={formData.role}
            onChange={handleChange}
            required
          >
            {/* Lấy ROLES từ constants */}
            <option value={ROLES.CUSTOMER}>Khách hàng</option>
            <option value={ROLES.EMPLOYEE}>Nhân viên</option>
            <option value={ROLES.ADMIN}>Admin</option>
            {/* Thêm các role khác nếu có */}
          </select>
        </div>
        <div className="form-actions">
          <button type="submit" className="save-button" disabled={isSubmitting}>
             {isSubmitting ? (
                <><FaSpinner className="spinner" /> Đang lưu...</> 
             ) : (isEditMode ? 'Lưu thay đổi' : 'Thêm người dùng')}
          </button>
          <button type="button" className="cancel-button" onClick={onCancel} disabled={isSubmitting}>
            Hủy
          </button>
        </div>
      </form>
    </div>
  );
};

export default UserForm; 