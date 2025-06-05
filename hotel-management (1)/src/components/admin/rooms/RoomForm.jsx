"use client"

/**
 * RoomForm.jsx
 *
 * Vai trò: Component form để thêm mới hoặc chỉnh sửa thông tin phòng.
 * Chức năng:
 * - Hiển thị form với các trường thông tin phòng theo spec API
 * - Lấy danh sách Loại phòng để chọn
 * - Xác thực dữ liệu nhập vào
 * - Gửi dữ liệu để tạo mới hoặc cập nhật phòng
 *
 * Quyền truy cập: Admin và Employee
 */

import React, { useState, useEffect } from 'react';
import { FaSpinner, FaTimes } from 'react-icons/fa';

// Giả sử ROOM_STATUS lấy từ constants hoặc API
const ROOM_STATUS_OPTIONS = {
    AVAILABLE: 'available',
    OCCUPIED: 'occupied',
    CLEANING: 'cleaning',
    MAINTENANCE: 'maintenance',
};

const RoomForm = ({ room, isEditMode, onClose, onSave, roomTypes = [], isSubmitting }) => {
  const [formData, setFormData] = useState({
    roomNumber: '',
    roomTypeId: '',
    floor: '',
    status: ROOM_STATUS_OPTIONS.AVAILABLE, // Mặc định
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isEditMode && room) {
      setFormData({
        roomNumber: room.roomNumber || '',
        roomTypeId: room.roomTypeId || '',
        floor: room.floor || '',
        status: room.status || ROOM_STATUS_OPTIONS.AVAILABLE,
      });
      setErrors({});
    } else {
      // Reset form for adding
      setFormData({
        roomNumber: '',
        roomTypeId: '', // Để trống ban đầu
        floor: 1, // Mặc định tầng 1?
        status: ROOM_STATUS_OPTIONS.AVAILABLE,
      });
      setErrors({});
    }
  }, [room, isEditMode]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    const val = type === 'number' ? parseInt(value, 10) || '' : value;
    setFormData(prev => ({ ...prev, [name]: val }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.roomNumber) newErrors.roomNumber = 'Số phòng là bắt buộc.';
    if (!formData.roomTypeId) newErrors.roomTypeId = 'Loại phòng là bắt buộc.';
    if (formData.floor === '' || isNaN(formData.floor) || formData.floor < 0) newErrors.floor = 'Tầng không hợp lệ.';
    if (!formData.status) newErrors.status = 'Trạng thái là bắt buộc.';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isSubmitting || !validateForm()) return;

    const dataToSave = {
        ...formData,
        floor: parseInt(formData.floor, 10),
        roomTypeId: parseInt(formData.roomTypeId, 10),
    };

    onSave(dataToSave, isEditMode ? room.id : null);
  };

  return (
    // Modal structure - nên đặt ở RoomList.jsx để quản lý overlay
    <div className="room-form-modal-content"> 
      <div className="modal-header">
        <h2>{isEditMode ? 'Chỉnh sửa Phòng' : 'Thêm phòng mới'}</h2>
        <button onClick={onClose} className="close-button" title="Đóng"><FaTimes /></button>
        </div>
      <form onSubmit={handleSubmit} className="room-form-container">
          <div className="form-group">
            <label htmlFor="roomNumber">Số phòng</label>
            <input
              type="text"
              id="roomNumber"
            name="roomNumber"
            value={formData.roomNumber}
            onChange={handleChange}
              disabled={isSubmitting}
            className={errors.roomNumber ? 'input-error' : ''}
            />
          {errors.roomNumber && <span className="error-message">{errors.roomNumber}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="roomTypeId">Loại phòng</label>
                    <select
                        id="roomTypeId"
            name="roomTypeId"
            value={formData.roomTypeId}
            onChange={handleChange}
            disabled={isSubmitting || roomTypes.length === 0}
            className={errors.roomTypeId ? 'input-error' : ''}
                    >
            <option value="" disabled>-- Chọn loại phòng --</option>
            {roomTypes.map(type => (
              // Giả sử roomType có id và name
              <option key={type.id} value={type.id}>{type.name}</option>
                        ))}
                    </select>
          {errors.roomTypeId && <span className="error-message">{errors.roomTypeId}</span>}
          {roomTypes.length === 0 && !isSubmitting && <span className="info-message">Đang tải loại phòng...</span>}
          </div>

          <div className="form-group">
            <label htmlFor="floor">Tầng</label>
            <input
              type="number"
              id="floor"
            name="floor"
            value={formData.floor}
            onChange={handleChange}
              disabled={isSubmitting}
            min="0"
            className={errors.floor ? 'input-error' : ''}
            />
          {errors.floor && <span className="error-message">{errors.floor}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="status">Trạng thái</label>
                   <select
                    id="status"
            name="status"
            value={formData.status}
            onChange={handleChange}
                    disabled={isSubmitting}
            className={errors.status ? 'input-error' : ''}
          >
             {/* Render options từ ROOM_STATUS_OPTIONS */}
            <option value={ROOM_STATUS_OPTIONS.AVAILABLE}>Có sẵn (Available)</option>
            <option value={ROOM_STATUS_OPTIONS.OCCUPIED}>Có khách (Occupied)</option>
            <option value={ROOM_STATUS_OPTIONS.CLEANING}>Đang dọn (Cleaning)</option>
            <option value={ROOM_STATUS_OPTIONS.MAINTENANCE}>Bảo trì (Maintenance)</option>
                  </select>
          {errors.status && <span className="error-message">{errors.status}</span>}
          </div>

          <div className="form-actions">
            <button type="button" className="cancel-button" onClick={onClose} disabled={isSubmitting}>
              Hủy
            </button>
           <button type="submit" className="save-button" disabled={isSubmitting || roomTypes.length === 0}>
            {isSubmitting ? (
              <><FaSpinner className="spinner" /> Đang lưu...</>
            ) : (isEditMode ? 'Lưu thay đổi' : 'Thêm mới')}
            </button>
          </div>
        </form>
    </div>
  );
};

export default RoomForm;

