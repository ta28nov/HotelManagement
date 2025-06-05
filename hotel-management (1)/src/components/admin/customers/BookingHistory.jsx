"use client"

/**
 * BookingHistory.jsx
 *
 * Vai trò: Component hiển thị lịch sử đặt phòng của một khách hàng.
 * Chức năng:
 * - Hiển thị danh sách các đặt phòng của khách hàng
 * - Hiển thị chi tiết từng đặt phòng
 * - Cho phép xem chi tiết đặt phòng
 *
 * Quyền truy cập: Admin và Employee
 */

import { useState, useEffect } from "react"
import { FaTimes, FaEye } from "react-icons/fa"
import { motion } from "framer-motion"
import { format } from "date-fns"
import { toast } from "react-toastify"
import customerService from "../../../services/customerService"
import { BOOKING_STATUS, formatCurrency } from "../../../config/constants"
import "./CustomerList.css"

const BookingHistory = ({ customerId, onClose }) => {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [customerName, setCustomerName] = useState("")

  useEffect(() => {
    const fetchBookingHistory = async () => {
      try {
        setLoading(true)
        // Fetch customer details
        const customerResponse = await customerService.getCustomerById(customerId)
        setCustomerName(customerResponse.data.name)

        // Fetch booking history
        const bookingsResponse = await customerService.getCustomerBookingHistory(customerId)
        setBookings(bookingsResponse.data)
      } catch (error) {
        toast.error("Không thể tải lịch sử đặt phòng")
        console.error(error)
      } finally {
        setLoading(false)
      }
    }

    fetchBookingHistory()
  }, [customerId])

  const getStatusClass = (status) => {
    switch (status) {
      case "confirmed":
        return "status-confirmed"
      case "checked_in":
        return "status-checked-in"
      case "checked_out":
        return "status-checked-out"
      case "cancelled":
        return "status-cancelled"
      default:
        return "status-pending"
    }
  }

  const getStatusLabel = (status) => {
    const statusObj = BOOKING_STATUS.find((s) => s.value === status)
    return statusObj ? statusObj.label : status
  }

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), "dd/MM/yyyy")
    } catch (error) {
      return dateString
    }
  }

  return (
    <div className="booking-history-overlay">
      <motion.div
        className="booking-history-container"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="history-header">
          <h2>Lịch sử đặt phòng - {customerName}</h2>
          <button className="close-button" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <div className="history-content">
          {loading ? (
            <div className="loading">Đang tải dữ liệu...</div>
          ) : bookings.length === 0 ? (
            <div className="no-bookings">Khách hàng chưa có đặt phòng nào.</div>
          ) : (
            <div className="bookings-list">
              {bookings.map((booking) => (
                <div key={booking.id} className="booking-item">
                  <div className="booking-header">
                    <div className="booking-id">Mã đặt phòng: #{booking.id}</div>
                    <div className={`booking-status ${getStatusClass(booking.status)}`}>
                      {getStatusLabel(booking.status)}
                    </div>
                  </div>

                  <div className="booking-details">
                    <div className="booking-info">
                      <div className="info-row">
                        <span className="info-label">Phòng:</span>
                        <span className="info-value">
                          {booking.roomNumber} ({booking.roomType})
                        </span>
                      </div>
                      <div className="info-row">
                        <span className="info-label">Ngày nhận phòng:</span>
                        <span className="info-value">{formatDate(booking.checkInDate)}</span>
                      </div>
                      <div className="info-row">
                        <span className="info-label">Ngày trả phòng:</span>
                        <span className="info-value">{formatDate(booking.checkOutDate)}</span>
                      </div>
                      <div className="info-row">
                        <span className="info-label">Tổng tiền:</span>
                        <span className="info-value">{formatCurrency(booking.totalAmount)}</span>
                      </div>
                      <div className="info-row">
                        <span className="info-label">Trạng thái thanh toán:</span>
                        <span className={`info-value payment-status-${booking.paymentStatus}`}>
                          {booking.paymentStatus === "paid"
                            ? "Đã thanh toán"
                            : booking.paymentStatus === "partially_paid"
                              ? "Thanh toán một phần"
                              : "Chưa thanh toán"}
                        </span>
                      </div>
                    </div>

                    <div className="booking-actions">
                      <button className="view-button">
                        <FaEye /> Xem chi tiết
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}

export default BookingHistory

