"use client"

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { format, parseISO } from 'date-fns';
import bookingService from '../../../services/bookingService';
import serviceService from '../../../services/serviceService';
import { BOOKING_STATUS, PAYMENT_STATUS, formatCurrency } from '../../../config/constants';
import './BookingDetailModal.css';

const BookingDetailModal = ({ bookingId, isOpen, onClose, onDataChange }) => {
  // State declarations
  const [bookingDetails, setBookingDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const [availableServices, setAvailableServices] = useState([]);
  const [showAddServiceForm, setShowAddServiceForm] = useState(false);
  const [selectedServiceId, setSelectedServiceId] = useState('');
  const [serviceQuantity, setServiceQuantity] = useState(1);

  // Hàm tải lại dữ liệu booking
  const fetchData = async () => {
    if (!bookingId || !isOpen) return;
    setLoading(true);
    try {
      const details = await bookingService.getBookingById(bookingId);
      setBookingDetails(details);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      console.error("Lỗi tải dữ liệu:", err);
    } finally {
      setLoading(false);
    }
  };

  // useEffect cho việc tải dữ liệu ban đầu
  useEffect(() => {
    fetchData();
  }, [bookingId, isOpen]);

  // Load available services when showing add service form
  useEffect(() => {
    const loadAvailableServices = async () => {
      if (showAddServiceForm) {
        try {
          const response = await serviceService.getAllServices();
          setAvailableServices(response.data);
        } catch (err) {
          toast.error("Không thể tải danh sách dịch vụ");
          console.error("Lỗi tải dịch vụ:", err);
          setShowAddServiceForm(false);
        }
      }
    };
    loadAvailableServices();
  }, [showAddServiceForm]);

  const handleCheckIn = async () => {
    if (!bookingId) return;
    if (!window.confirm(`Xác nhận CHECK-IN cho đặt phòng #${bookingId}?`)) return;

    setActionLoading(true);
    try {
      await bookingService.checkIn(bookingId);
      toast.success(`Đã check-in đặt phòng #${bookingId}.`);
      await fetchData(); // Refresh lại dữ liệu
      onDataChange(); // Cập nhật danh sách chính
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || "Lỗi khi check-in.");
      console.error("Lỗi check-in:", err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCheckOut = async () => {
    if (!bookingId) return;
    if (!window.confirm(`Xác nhận CHECK-OUT cho đặt phòng #${bookingId}?`)) return;

    setActionLoading(true);
    try {
      await bookingService.checkOut(bookingId);
      toast.success(`Đã check-out đặt phòng #${bookingId}.`);
      await fetchData(); // Refresh lại dữ liệu
      onDataChange(); // Cập nhật danh sách chính
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || "Lỗi khi check-out.");
      console.error("Lỗi check-out:", err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdatePayment = async (newStatus) => {
    if (!bookingId || !newStatus) return;

    // Kiểm tra logic trạng thái thanh toán
    const validTransitions = {
      'pending': ['partially_paid', 'paid'],
      'partially_paid': ['paid', 'pending'],
      'paid': ['partially_paid'] // Cho phép chuyển về partially_paid khi thêm dịch vụ mới
    };

    const currentPaymentStatus = bookingDetails?.paymentStatus || 'pending';
    
    if (!validTransitions[currentPaymentStatus]?.includes(newStatus)) {
      toast.error(`Không thể chuyển từ trạng thái ${currentPaymentStatus} sang ${newStatus}`);
      return;
    }

    // Kiểm tra trạng thái booking
    if (['cancelled', 'checked_out'].includes(bookingDetails?.status)) {
      toast.error("Không thể cập nhật thanh toán cho đặt phòng đã trả phòng hoặc đã hủy");
      return;
    }

    if (!window.confirm(`Cập nhật trạng thái thanh toán thành '${newStatus}'?`)) return;

    setActionLoading(true);
    try {
      await bookingService.updatePaymentStatus(bookingId, { paymentStatus: newStatus });
      toast.success("Cập nhật thanh toán thành công!");
      await fetchData(); // Refresh toàn bộ dữ liệu booking
      onDataChange(); // Cập nhật danh sách chính
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || "Lỗi cập nhật thanh toán.");
      console.error("Lỗi cập nhật thanh toán:", err.response || err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddServiceSubmit = async (e) => {
    e.preventDefault();
    
    // Kiểm tra điều kiện
    if (!selectedServiceId || serviceQuantity <= 0) {
      toast.warn("Vui lòng chọn dịch vụ và nhập số lượng hợp lệ.");
      return;
    }

    // Kiểm tra trạng thái booking - chỉ chặn khi đã hủy hoặc đã trả phòng
    if (['checked_out', 'cancelled'].includes(bookingDetails?.status)) {
      toast.error("Không thể thêm dịch vụ cho đặt phòng đã trả phòng hoặc đã hủy");
      return;
    }

    const selectedService = availableServices.find(s => s.id === parseInt(selectedServiceId));
    if (!selectedService) {
      toast.error("Không tìm thấy thông tin dịch vụ");
      return;
    }

    setActionLoading(true);
    try {
      const serviceData = { 
        serviceId: parseInt(selectedServiceId, 10),
        quantity: parseInt(serviceQuantity, 10)
      };
      
      // Thêm dịch vụ
      await bookingService.addServiceToBooking(bookingId, serviceData);

      toast.success("Thêm dịch vụ thành công!");
      
      // Reset form
      setShowAddServiceForm(false);
      setSelectedServiceId('');
      setServiceQuantity(1);
      
      // Refresh data
      await fetchData();
      onDataChange();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || "Lỗi khi thêm dịch vụ.");
      console.error("Lỗi thêm dịch vụ:", err.response || err);
    } finally {
      setActionLoading(false);
    }
  };
  
  const handleRemoveService = async (bookingServiceIdToRemove) => {
    if (!bookingServiceIdToRemove) return;

    // Kiểm tra trạng thái booking
    if (['checked_out', 'cancelled'].includes(bookingDetails?.status)) {
      toast.error("Không thể xóa dịch vụ của đặt phòng đã trả phòng hoặc đã hủy");
      return;
    }

    if (!window.confirm(`Bạn có chắc muốn xóa dịch vụ này khỏi đặt phòng?`)) return;

    setActionLoading(true);
    try {
      await bookingService.removeServiceFromBooking(bookingId, bookingServiceIdToRemove);
      toast.success("Xóa dịch vụ thành công!");
      await fetchData();
      onDataChange();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || "Lỗi khi xóa dịch vụ.");
      console.error("Lỗi xóa dịch vụ:", err.response || err);
    } finally {
      setActionLoading(false);
    }
  };
  
  const handleConfirmBooking = async () => {
    if (!bookingId) return;
    if (!bookingDetails) return;
    
    // Validate current status
    if (bookingDetails.status !== "pending") {
      toast.error("Chỉ có thể xác nhận đặt phòng ở trạng thái chờ xác nhận.");
      return;
    }

    if (!window.confirm(`Xác nhận XÁC NHẬN đặt phòng #${bookingId}?`)) return;

    setActionLoading(true);
    try {
      await bookingService.updateBooking(bookingId, { status: "confirmed" });
      toast.success(`Đã xác nhận đặt phòng #${bookingId}.`);
      await fetchData(); // Refresh data
      onDataChange(); // Update parent list
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || "Lỗi khi xác nhận đặt phòng.");
      console.error("Lỗi xác nhận đặt phòng:", err);
    } finally {
      setActionLoading(false);
    }
  };

  // Hủy đặt phòng
  const handleCancelBooking = async () => {
      if (!bookingId) return;
       if (!window.confirm(`Bạn có chắc muốn HỦY đặt phòng #${bookingId}? Hành động này có thể không thể hoàn tác.`)) return;

      setActionLoading(true);
      try {
          // Gọi API updateBooking với status = cancelled
          await bookingService.updateBooking(bookingId, { status: 'cancelled' });
          toast.success(`Đã hủy đặt phòng #${bookingId}.`);
          await fetchData(); // Refresh data after cancellation
          onDataChange(); // Update main list
      } catch (err) {
           toast.error(err.response?.data?.message || err.message || "Lỗi khi hủy đặt phòng.");
           console.error("Lỗi hủy đặt phòng:", err.response || err);
      } finally {
           setActionLoading(false);
      }
  }

  if (!isOpen) return null;

  return (
    <motion.div
      className="modal-backdrop detail-modal-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="modal-content detail-modal-content"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -50 }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2>Chi tiết đặt phòng #{bookingId}</h2>

        {loading && <div className="loading">Đang tải chi tiết...</div>}
        {error && <div className="error-message">{error}</div>}

        {bookingDetails && !loading && !error && (
          <div className="booking-details-grid">
            <div className="detail-section">
                <h4>Thông tin khách hàng</h4>
                <p><strong>Tên:</strong> {bookingDetails.customerName}</p>
                <p><strong>Email:</strong> {bookingDetails.customerEmail || 'N/A'}</p>
                <p><strong>Điện thoại:</strong> {bookingDetails.customerPhoneNumber || 'N/A'}</p>
                <p><strong>ID Khách hàng:</strong> {bookingDetails.customerId}</p>
            </div>

             <div className="detail-section">
                <h4>Thông tin phòng</h4>
                <p><strong>Số phòng:</strong> {bookingDetails.roomNumber}</p>
                <p><strong>Loại phòng:</strong> {bookingDetails.roomTypeName}</p>
                <p><strong>ID Phòng:</strong> {bookingDetails.roomId}</p>
             </div>
             
             <div className="detail-section">
                <h4>Chi tiết đặt phòng</h4>
                <p><strong>Check-in:</strong> {format(parseISO(bookingDetails.checkInDate), 'HH:mm dd/MM/yyyy')}</p>
                <p><strong>Check-out:</strong> {format(parseISO(bookingDetails.checkOutDate), 'HH:mm dd/MM/yyyy')}</p>
                <p><strong>Người lớn:</strong> {bookingDetails.adults}</p>
                <p><strong>Trẻ em:</strong> {bookingDetails.children}</p>
                <p><strong>Tạo lúc:</strong> {format(parseISO(bookingDetails.createdAt), 'HH:mm dd/MM/yyyy')}</p>
             </div>
             
              <div className="detail-section">
                <h4>Trạng thái & Thanh toán</h4>
                 <p>
                    <strong>Trạng thái:</strong>{' '}
                    <span className={`status-badge status-${bookingDetails.status}`}>
                        {BOOKING_STATUS.find(s => s.value === bookingDetails.status)?.label || bookingDetails.status}
                    </span>
                 </p>
                 <p>
                    <strong>Thanh toán:</strong>{' '}
                     <span className={`payment-status-badge payment-${bookingDetails.paymentStatus}`}>
                         {PAYMENT_STATUS.find(s => s.value === bookingDetails.paymentStatus)?.label || bookingDetails.paymentStatus}
                     </span>
                 </p>
                 <p><strong>Tổng tiền:</strong> {formatCurrency(bookingDetails.totalAmount)}</p>
                 {bookingDetails.status !== 'cancelled' && bookingDetails.status !== 'checked_out' && bookingDetails.paymentStatus !== 'paid' && (
                     <div className='payment-actions'>
                         <label>Cập nhật TT:</label>
                         <select onChange={(e) => handleUpdatePayment(e.target.value)} disabled={actionLoading}>
                             <option value="">Chọn...</option>
                             {PAYMENT_STATUS.filter(s => s.value !== bookingDetails.paymentStatus).map(status => (
                                 <option key={status.value} value={status.value}>{status.label}</option>
                             ))}
                         </select>
                     </div>
                 )}

             </div>

            <div className="detail-section services-section">
              <h4>Dịch vụ đã sử dụng ({bookingDetails.services?.length || 0})</h4>
              {bookingDetails.services && bookingDetails.services.length > 0 ? (
                <ul className="used-services-list">
                  {bookingDetails.services.map(service => (
                    <li key={service.bookingServiceId}>
                      <span>
                        {service.name} (x{service.quantity}) - {formatCurrency(service.price)}
                        <span className="service-date"> - {format(parseISO(service.serviceDate), 'dd/MM/yyyy')}</span>
                      </span>
                      <button 
                        className="remove-service-button" 
                        onClick={() => handleRemoveService(service.bookingServiceId)}
                        disabled={actionLoading}
                        title="Xóa dịch vụ này"
                      >
                         &times;
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>Chưa có dịch vụ nào.</p>
              )}
               
               {!showAddServiceForm && !['cancelled', 'checked_out'].includes(bookingDetails.status) && (
                  <button 
                      className="add-service-toggle-button" 
                      onClick={() => setShowAddServiceForm(true)} 
                      disabled={actionLoading}
                  >
                    + Thêm dịch vụ
                  </button>
               )}

               {showAddServiceForm && (
                   <form onSubmit={handleAddServiceSubmit} className="add-service-form">
                       <div className="form-group">
                            <label htmlFor="serviceSelect">Chọn dịch vụ:</label>
                            <select 
                                id="serviceSelect"
                                value={selectedServiceId}
                                onChange={(e) => setSelectedServiceId(e.target.value)}
                                required
                                disabled={actionLoading}
                            >
                                <option value="" disabled>-- Chọn dịch vụ --</option>
                                {availableServices
                                    .filter(s => s.isAvailable)
                                    .map(s => (
                                        <option key={s.id} value={s.id}>{s.name} ({formatCurrency(s.price)})</option>
                                ))}
                            </select>
                       </div>
                       <div className="form-group">
                           <label htmlFor="serviceQuantity">Số lượng:</label>
                           <input 
                                type="number"
                                id="serviceQuantity"
                                value={serviceQuantity}
                                onChange={(e) => setServiceQuantity(parseInt(e.target.value, 10) || 1)}
                                min="1"
                                required
                                disabled={actionLoading}
                           />
                       </div>
                       <div className="form-actions inline-actions">
                           <button type="submit" className="save-button small-button" disabled={actionLoading}>Thêm</button>
                           <button 
                               type="button" 
                               className="cancel-button small-button" 
                               onClick={() => setShowAddServiceForm(false)} 
                               disabled={actionLoading}
                            >
                               Hủy
                           </button>
                       </div>
                   </form>
               )}
            </div>

            <div className="detail-section history-section">
              <h4>Lịch sử thay đổi ({bookingDetails.history?.length || 0})</h4>
              {bookingDetails.history && bookingDetails.history.length > 0 ? (
                 <ul>
                   {bookingDetails.history.map(entry => (
                     <li key={entry.id}>
                       [{format(parseISO(entry.changedAt), 'HH:mm dd/MM/yyyy')}]
                       <strong> {entry.status}</strong>
                       {entry.paymentStatus && ` / TT: ${entry.paymentStatus}`}
                       {entry.changedByUserName && ` (Bởi: ${entry.changedByUserName})`}
                       {entry.notes && ` - Ghi chú: ${entry.notes}`}
                     </li>
                   ))}
                 </ul>
              ) : (
                 <p>Chưa có lịch sử thay đổi.</p>
              )}
            </div>
          </div>
        )}

        {/* Nút hành động chính */}
        {bookingDetails && !loading && !error && (
             <div className="detail-actions form-actions">
                {/* Nút Xác nhận đặt phòng */} 
                {bookingDetails.status === 'pending' && (
                    <button 
                        onClick={handleConfirmBooking} 
                        className='action-button confirm-booking-button' 
                        disabled={actionLoading}
                        title="Xác nhận đặt phòng này"
                    >
                        Xác nhận đặt phòng
                    </button>
                )}
                
                {/* Nút Check-in */} 
                {bookingDetails.status === 'confirmed' && (
                    <button 
                        onClick={handleCheckIn} 
                        className='action-button checkin-button' 
                        disabled={actionLoading}
                        title="Check-in cho đặt phòng này"
                    >
                        Check-in
                    </button>
                )}
                
                {/* Nút Check-out */} 
                {bookingDetails.status === 'checked_in' && (
                    <button 
                        onClick={handleCheckOut} 
                        className='action-button checkout-button' 
                        disabled={actionLoading}
                        title="Check-out cho đặt phòng này"
                    >
                        Check-out
                    </button>
                )}
                
                {/* Nút Hủy Đặt phòng */} 
                {['pending', 'confirmed'].includes(bookingDetails.status) && (
                    <button 
                        onClick={handleCancelBooking} 
                        className='action-button cancel-booking-button' 
                        disabled={actionLoading}
                        title="Hủy đặt phòng này"
                    >
                        Hủy đặt phòng
                    </button>
                )}
                
                <button 
                    type="button" 
                    className="cancel-button" 
                    onClick={onClose} 
                    disabled={actionLoading}
                >
                    Đóng
                </button>
             </div>
        )}
         {!bookingDetails && !loading && !error && (
             <div className="form-actions">
                 <button type="button" className="cancel-button" onClick={onClose}>
                     Đóng
                 </button>
             </div>
         )}

      </motion.div>
    </motion.div>
  );
};

export default BookingDetailModal;