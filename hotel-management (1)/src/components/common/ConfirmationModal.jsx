import React from 'react';
import './ConfirmationModal.css'; // Tạo file CSS riêng

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = 'Xác nhận', cancelText = 'Hủy' }) => {
  if (!isOpen) return null;

  return (
    <div className="confirmation-modal-overlay">
      <div className="confirmation-modal-content">
        <h3>{title || 'Xác nhận hành động'}</h3>
        <p>{message || 'Bạn có chắc chắn muốn tiếp tục?'}</p>
        <div className="confirmation-modal-actions">
          <button className="confirm-button" onClick={onConfirm}>
            {confirmText}
          </button>
          <button className="cancel-button" onClick={onClose}>
            {cancelText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal; 